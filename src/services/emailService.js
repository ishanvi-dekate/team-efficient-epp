import emailjs from '@emailjs/browser';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const emailjsConfigured = () => !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatTodoList(todos) {
  if (!todos.length) return 'No tasks — enjoy your day!';
  return todos.map(t => `• ${t.text}${t.dueTime ? ` (due ${t.dueTime})` : ''}`).join('\n');
}

async function getUserTodos(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'todos'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Send via EmailJS. Throws if not configured or if send fails.
async function sendEmail(toEmail, toName, subject, body) {
  if (!emailjsConfigured()) {
    throw new Error('EmailJS not configured. See .env.local setup.');
  }
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    { to_email: toEmail, to_name: toName, subject, message: body },
    PUBLIC_KEY,
  );
}

// ── Daily reminder ────────────────────────────────────────────────────────────
export async function sendDailyReminder(user) {
  const todos  = await getUserTodos(user.uid);
  const today  = todayStr();
  const pending = todos.filter(t => t.date === today && !t.done);
  const name   = user.displayName || user.email;

  const subject = `📋 Your tasks for today — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
  const body = `Hi ${name},\n\nHere are your tasks for today:\n\n${formatTodoList(pending)}\n\nYou've got this! — Efficient EPP`;

  await sendEmail(user.email, name, subject, body);
}

// ── Weekly digest ─────────────────────────────────────────────────────────────
export async function sendWeeklyDigest(user) {
  const todos = await getUserTodos(user.uid);
  const now   = new Date();

  // Build a date range for the past 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const weekTodos  = todos.filter(t => dates.includes(t.date));
  const done       = weekTodos.filter(t => t.done).length;
  const total      = weekTodos.length;
  const upcoming   = todos.filter(t => t.date >= todayStr() && !t.done);
  const name       = user.displayName || user.email;

  const subject = `📊 Your weekly progress — Efficient EPP`;
  const body = `Hi ${name},\n\nHere's your week in review:\n\n✅ Tasks completed: ${done} / ${total}\n\nUpcoming tasks:\n${formatTodoList(upcoming.slice(0, 10))}\n\nKeep up the great work! — Efficient EPP`;

  await sendEmail(user.email, name, subject, body);
}

// ── Deadline alert ────────────────────────────────────────────────────────────
export async function sendDeadlineAlert(user, todo) {
  const name    = user.displayName || user.email;
  const subject = `⏰ Task due soon: ${todo.text}`;
  const body    = `Hi ${name},\n\n"${todo.text}" is due at ${todo.dueTime} today.\n\nDon't forget! — Efficient EPP`;
  await sendEmail(user.email, name, subject, body);
}

// ── Auto-send logic (called on app load) ─────────────────────────────────────
// Checks Firestore to decide whether to send daily/weekly emails.
// Silently skips if EmailJS isn't configured or if already sent today/this week.
export async function checkAndSendNotifications(user) {
  if (!user || !emailjsConfigured()) return;

  try {
    const prefsSnap = await getDoc(doc(db, 'users', user.uid, 'settings', 'notifications'));
    if (!prefsSnap.exists()) return;
    const prefs = prefsSnap.data();

    const sentSnap = await getDoc(doc(db, 'users', user.uid, 'settings', 'notificationSent'));
    const sent = sentSnap.exists() ? sentSnap.data() : {};

    const today = todayStr();
    const week  = `${new Date().getFullYear()}-W${getISOWeek(new Date())}`;

    const updates = {};

    if (prefs.emailReminders && sent.dailyDate !== today) {
      await sendDailyReminder(user);
      updates.dailyDate = today;
    }

    if (prefs.weeklyDigest && sent.weekKey !== week) {
      // Only send weekly digest on Monday
      if (new Date().getDay() === 1) {
        await sendWeeklyDigest(user);
        updates.weekKey = week;
      }
    }

    if (Object.keys(updates).length > 0) {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'notificationSent'), { ...sent, ...updates });
    }

    // Deadline alerts: show a browser notification for todos due within 30 min
    if (prefs.taskDeadlines && 'Notification' in window) {
      checkDeadlineAlerts(user);
    }
  } catch (err) {
    console.warn('Notification check failed:', err.message);
  }
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

async function checkDeadlineAlerts(user) {
  if (Notification.permission === 'denied') return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission !== 'granted') return;

  const todos = await getUserTodos(user.uid);
  const today = todayStr();
  const now   = new Date();

  todos
    .filter(t => t.date === today && !t.done && t.dueTime)
    .forEach(t => {
      const [h, m] = t.dueTime.split(':').map(Number);
      const due = new Date();
      due.setHours(h, m, 0, 0);
      const diffMin = (due - now) / 60000;
      if (diffMin > 0 && diffMin <= 30) {
        new Notification(`⏰ Due in ${Math.round(diffMin)} min`, {
          body: t.text,
          icon: '/favicon.ico',
        });
      }
    });
}
