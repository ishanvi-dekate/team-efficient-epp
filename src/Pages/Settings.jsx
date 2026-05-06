import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut, updateProfile, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Settings.css';

// ─── Modal wrapper ──────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sm-overlay" onClick={onClose}>
      <div className="sm-card" onClick={(e) => e.stopPropagation()}>
        <div className="sm-header">
          <h2 className="sm-title">{title}</h2>
          <button className="sm-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="sm-body">{children}</div>
      </div>
    </div>
  );
}

// ─── Manage Account ─────────────────────────────────────────────────────────
function ManageAccountModal() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg); setStatus(''); }
    else { setStatus(msg); setError(''); }
  };

  const saveName = async () => {
    if (!displayName.trim()) { flash('Name cannot be empty.', true); return; }
    setLoading(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      flash('Display name updated!');
    } catch {
      flash('Failed to update name. Please try again.', true);
    } finally { setLoading(false); }
  };

  const resetPassword = async () => {
    if (!user?.email) { flash('No email on this account.', true); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      flash(`Reset email sent to ${user.email}.`);
    } catch {
      flash('Failed to send reset email. Please try again.', true);
    } finally { setLoading(false); }
  };

  return (
    <>
      <p className="sm-info"><strong>Email:</strong> {user?.email || '—'}</p>

      <div className="sm-field">
        <label className="sm-label">Display Name</label>
        <div className="sm-row">
          <input
            className="sm-input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
          <button className="sm-btn" onClick={saveName} disabled={loading}>Save</button>
        </div>
      </div>

      <div className="sm-field">
        <label className="sm-label">Password</label>
        <button className="sm-btn sm-btn-outline" onClick={resetPassword} disabled={loading}>
          Send Password Reset Email
        </button>
      </div>

      {status && <p className="sm-success">{status}</p>}
      {error && <p className="sm-error">{error}</p>}
    </>
  );
}

// ─── Notifications ──────────────────────────────────────────────────────────
function NotificationsModal() {
  const user = auth.currentUser;
  const [prefs, setPrefs] = useState({
    emailReminders: false,
    weeklyDigest: false,
    taskDeadlines: false,
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid, 'settings', 'notifications')).then((snap) => {
      if (snap.exists()) setPrefs((p) => ({ ...p, ...snap.data() }));
    });
  }, []);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'notifications'), prefs);
      setStatus('Saved!');
      setTimeout(() => setStatus(''), 2500);
    } catch {
      setStatus('Failed to save.');
    } finally { setSaving(false); }
  };

  const options = [
    { key: 'emailReminders', label: 'Daily task reminders via email' },
    { key: 'weeklyDigest', label: 'Weekly progress digest' },
    { key: 'taskDeadlines', label: 'Deadline alerts' },
  ];

  return (
    <>
      <p className="sm-info">Choose which notifications you'd like to receive.</p>
      <div className="sm-toggles">
        {options.map(({ key, label }) => (
          <label key={key} className="sm-toggle-row">
            <span>{label}</span>
            <button
              className={`sm-toggle ${prefs[key] ? 'on' : ''}`}
              onClick={() => toggle(key)}
              role="switch"
              aria-checked={prefs[key]}
            >
              <span className="sm-thumb" />
            </button>
          </label>
        ))}
      </div>
      <button className="sm-btn" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save Preferences'}
      </button>
      {status && <p className="sm-success">{status}</p>}
    </>
  );
}

// ─── Troubleshooting ────────────────────────────────────────────────────────
function TroubleshootingModal() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      q: "My todos aren't showing up.",
      a: "Make sure you're logged in. Todos are tied to your account and only show for the date they were created.",
    },
    {
      q: "The AI chat isn't responding.",
      a: "The AI needs an active internet connection. If it shows an error, try refreshing the page.",
    },
    {
      q: "The page looks broken after refreshing.",
      a: "Try a hard refresh (Ctrl+Shift+R / Cmd+Shift+R). If the issue persists, log out and log back in.",
    },
    {
      q: "I can't log in with my email and password.",
      a: "Use 'Send Password Reset Email' in Manage Account. Make sure you're using the email you signed up with.",
    },
    {
      q: "My display name isn't showing on the home page.",
      a: "Go to Manage Account, update your display name, then refresh the page.",
    },
    {
      q: "My profile information isn't saving.",
      a: "Make sure you're connected to the internet and click 'Save Changes' at the bottom of the Personal Information panel.",
    },
  ];

  return (
    <div className="sm-faq">
      {faqs.map((item, i) => (
        <div key={i} className="sm-faq-item">
          <button className="sm-faq-q" onClick={() => setOpen(open === i ? null : i)}>
            <span>{item.q}</span>
            <span className={`sm-chevron ${open === i ? 'open' : ''}`}>›</span>
          </button>
          {open === i && <p className="sm-faq-a">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Focus Mode ─────────────────────────────────────────────────────────────
function FocusModeModal() {
  const user = auth.currentUser;
  const [enabled, setEnabled] = useState(document.body.classList.contains('focus-mode'));
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    document.body.classList.toggle('focus-mode', next);
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'focusMode'), { enabled: next });
    } catch {
      setEnabled(!next);
      document.body.classList.toggle('focus-mode', !next);
    } finally { setSaving(false); }
  };

  return (
    <>
      <p className="sm-info">
        Focus Mode hides the AI chat assistant and reduces visual distractions so you can concentrate on your work.
      </p>
      <div className="sm-focus-wrap">
        <span className="sm-focus-label">
          {enabled ? 'Focus Mode is ON' : 'Focus Mode is OFF'}
        </span>
        <button
          className={`sm-toggle sm-toggle-lg ${enabled ? 'on' : ''}`}
          onClick={!saving ? toggle : undefined}
          role="switch"
          aria-checked={enabled}
        >
          <span className="sm-thumb" />
        </button>
      </div>
      {enabled && (
        <p className="sm-hint">The AI chat bubble is now hidden. Toggle off to bring it back.</p>
      )}
    </>
  );
}

// ─── Personal Information ────────────────────────────────────────────────────
function PersonalInfoModal() {
  const user = auth.currentUser;
  const [form, setForm] = useState({
    username: '', bedtime: '', sleepHours: '', stress: '',
    distractions: '', extracurriculars: '', homeworkClass: '',
    courses: '', goal1: '', goal2: '', goal3: '',
  });
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid, 'profile')).then((snap) => {
      if (snap.exists()) setForm((f) => ({ ...f, ...snap.data() }));
    });
  }, []);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'profile'), form);
      setStatus('Profile saved!');
      setTimeout(() => setStatus(''), 2500);
    } catch {
      setStatus('Failed to save. Please try again.');
    } finally { setSaving(false); }
  };

  return (
    <>
      <div className="sm-field">
        <label className="sm-label">Username</label>
        <input className="sm-input" type="text" value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="Your username" />
      </div>

      <div className="sm-two-col">
        <div className="sm-field">
          <label className="sm-label">Usual bedtime</label>
          <input className="sm-input" type="text" value={form.bedtime} onChange={(e) => set('bedtime', e.target.value)} placeholder="e.g. 11pm" />
        </div>
        <div className="sm-field">
          <label className="sm-label">Avg. sleep hours</label>
          <input className="sm-input" type="text" value={form.sleepHours} onChange={(e) => set('sleepHours', e.target.value)} placeholder="e.g. 7 hours" />
        </div>
      </div>

      <div className="sm-field">
        <label className="sm-label">Biggest stressor</label>
        <textarea className="sm-textarea" rows={2} value={form.stress} onChange={(e) => set('stress', e.target.value)} />
      </div>

      <div className="sm-field">
        <label className="sm-label">External distractions</label>
        <textarea className="sm-textarea" rows={2} value={form.distractions} onChange={(e) => set('distractions', e.target.value)} />
      </div>

      <div className="sm-field">
        <label className="sm-label">Extracurriculars &amp; duration</label>
        <textarea className="sm-textarea" rows={2} value={form.extracurriculars} onChange={(e) => set('extracurriculars', e.target.value)} />
      </div>

      <div className="sm-field">
        <label className="sm-label">Most homework-heavy class</label>
        <input className="sm-input" type="text" value={form.homeworkClass} onChange={(e) => set('homeworkClass', e.target.value)} />
      </div>

      <div className="sm-field">
        <label className="sm-label">Current courses</label>
        <textarea className="sm-textarea" rows={2} value={form.courses} onChange={(e) => set('courses', e.target.value)} />
      </div>

      <div className="sm-field">
        <label className="sm-label">Your 3 goals</label>
        <input className="sm-input" type="text" value={form.goal1} onChange={(e) => set('goal1', e.target.value)} placeholder="Goal 1" />
        <input className="sm-input" style={{ marginTop: '0.5rem' }} type="text" value={form.goal2} onChange={(e) => set('goal2', e.target.value)} placeholder="Goal 2" />
        <input className="sm-input" style={{ marginTop: '0.5rem' }} type="text" value={form.goal3} onChange={(e) => set('goal3', e.target.value)} placeholder="Goal 3" />
      </div>

      <button className="sm-btn" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
      {status && <p className="sm-success">{status}</p>}
    </>
  );
}

// ─── Danger Zone ────────────────────────────────────────────────────────────
function DangerZoneModal({ setPage }) {
  const user = auth.currentUser;
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm !== 'DELETE') { setError('Type DELETE in all caps to confirm.'); return; }
    setLoading(true);
    try {
      await deleteUser(user);
      setPage('LoginPage');
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        setError('For security, please log out, log back in, then try again.');
      } else {
        setError('Failed to delete account. Please try again.');
      }
    } finally { setLoading(false); }
  };

  return (
    <>
      <p className="sm-info sm-danger-info">
        Deleting your account is permanent and cannot be undone. All your todos, profile info, and settings will be lost forever.
      </p>

      <div className="sm-field">
        <label className="sm-label">Type <strong>DELETE</strong> to confirm</label>
        <input
          className="sm-input sm-input-danger"
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="DELETE"
        />
      </div>

      <button
        className="sm-btn sm-btn-danger"
        onClick={handleDelete}
        disabled={loading || confirm !== 'DELETE'}
      >
        {loading ? 'Deleting…' : 'Permanently Delete Account'}
      </button>

      {error && <p className="sm-error">{error}</p>}
    </>
  );
}

// ─── Settings page ───────────────────────────────────────────────────────────
function Settings({ setPage }) {
  const [activeModal, setActiveModal] = useState(null);

  // Apply focus mode from Firestore on mount
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    getDoc(doc(db, 'users', user.uid, 'settings', 'focusMode')).then((snap) => {
      if (snap.exists() && snap.data().enabled) {
        document.body.classList.add('focus-mode');
      }
    });
  }, []);

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      setPage('LoginPage');
    } catch (err) {
      console.error('Log out failed:', err);
    }
  };

  const options = [
    { label: 'Manage Account',         key: 'ManageAccount',  icon: '👤' },
    { label: 'Notification Preferences', key: 'Notifications', icon: '🔔' },
    { label: 'Troubleshooting',         key: 'Troubleshooting', icon: '🔧' },
    { label: 'Focus Mode',              key: 'FocusMode',      icon: '🎯' },
    { label: 'Personal Information',    key: 'PersonalInfo',   icon: '📋' },
    { label: 'Log Out',                 key: 'LogOut',         icon: '🚪' },
    { label: 'Danger Zone',             key: 'DangerZone',     icon: '⚠️', danger: true },
  ];

  const handleClick = (opt) => {
    if (opt.key === 'LogOut') handleLogOut();
    else setActiveModal(opt.key);
  };

  const close = () => setActiveModal(null);

  const modalContent = {
    ManageAccount:  { title: 'Manage Account',          body: <ManageAccountModal /> },
    Notifications:  { title: 'Notification Preferences', body: <NotificationsModal /> },
    Troubleshooting:{ title: 'Troubleshooting',          body: <TroubleshootingModal /> },
    FocusMode:      { title: 'Focus Mode',               body: <FocusModeModal /> },
    PersonalInfo:   { title: 'Personal Information',     body: <PersonalInfoModal /> },
    DangerZone:     { title: 'Danger Zone',              body: <DangerZoneModal setPage={setPage} /> },
  };

  const active = activeModal && modalContent[activeModal];

  return (
    <div className="settings-page">
      <div className="settings-banner">
        <h1 className="settings-title">Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-grid">
          {options.map((opt) => (
            <button
              key={opt.key}
              className={`settings-button ${opt.danger ? 'settings-button-danger' : ''}`}
              onClick={() => handleClick(opt)}
            >
              <span className="settings-btn-icon">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {active && (
        <Modal title={active.title} onClose={close}>
          {active.body}
        </Modal>
      )}
    </div>
  );
}

export default Settings;
