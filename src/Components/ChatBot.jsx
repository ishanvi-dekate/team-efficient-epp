import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import {
  collection, addDoc, getDocs, deleteDoc, updateDoc,
  doc, query, orderBy,
} from 'firebase/firestore';
import './ChatBot.css';

// Dev:        Vite middleware proxies /ai/chat → GitHub Models using server-side GITHUB_TOKEN
// Production: calls GitHub Models directly from the browser using VITE_GITHUB_TOKEN
async function callAI(messages) {
  if (import.meta.env.DEV) {
    const res = await fetch('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.text();
  }

  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token) throw new Error('Add VITE_GITHUB_TOKEN to .env.local to enable AI in production.');

  const res = await fetch('https://models.inference.ai.azure.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 1000 }),
  });
  if (!res.ok) throw new Error(`GitHub Models ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ── Firestore tool execution ──────────────────────────────────────────────────
async function executeTool(name, args, user) {
  const todosRef = collection(db, 'users', user.uid, 'todos');

  if (name === 'list_todos') {
    const snap = await getDocs(todosRef);
    let todos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (args.date) todos = todos.filter(t => t.date === args.date);
    return todos.map(({ id, text, date, dueTime, done }) => ({ id, text, date, dueTime: dueTime ?? null, done }));
  }
  if (name === 'add_todo') {
    const ref = await addDoc(todosRef, {
      text: args.text, date: args.date, dueTime: args.dueTime ?? null,
      done: false, createdAt: Date.now(),
    });
    return { success: true, id: ref.id };
  }
  if (name === 'update_todo') {
    const patch = {};
    if (args.text    !== undefined) patch.text    = args.text;
    if (args.date    !== undefined) patch.date    = args.date;
    if (args.dueTime !== undefined) patch.dueTime = args.dueTime;
    if (args.done    !== undefined) patch.done    = args.done;
    await updateDoc(doc(db, 'users', user.uid, 'todos', args.id), patch);
    return { success: true };
  }
  if (name === 'delete_todo') {
    await deleteDoc(doc(db, 'users', user.uid, 'todos', args.id));
    return { success: true };
  }
  return { error: 'Unknown tool' };
}

function actionLabel(name, args) {
  switch (name) {
    case 'list_todos':  return args?.date ? `Reading tasks for ${args.date}…` : 'Reading your tasks…';
    case 'add_todo':    return `Adding "${args?.text}" on ${args?.date}`;
    case 'update_todo': return 'Updating task…';
    case 'delete_todo': return 'Removing task…';
    default:            return 'Working…';
  }
}

// Try to parse a JSON tool call from the model's reply
function parseToolCall(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const obj = JSON.parse(trimmed);
    if (obj.tool) return obj;
  } catch {}
  return null;
}

const SYSTEM_PROMPT = `You are a helpful AI assistant built into Efficient EPP, a student productivity app.
Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

You can manage the user's todo list using tools. To call a tool, respond with ONLY a raw JSON object — no markdown fences, no explanation, just the JSON on its own line:

{"tool":"list_todos","args":{}}
{"tool":"list_todos","args":{"date":"YYYY-MM-DD"}}
{"tool":"add_todo","args":{"text":"task name","date":"YYYY-MM-DD","dueTime":"HH:MM"}}
{"tool":"update_todo","args":{"id":"<id>","text":"...","date":"YYYY-MM-DD","dueTime":"HH:MM","done":true}}
{"tool":"delete_todo","args":{"id":"<id>"}}

Rules:
- Always call list_todos first before editing anything so you have real IDs.
- When asked to fix or optimise a schedule, use the tools to actually do it — do not just give advice.
- After all tool calls are finished, reply in plain friendly text summarising what changed.
- When NOT calling a tool, respond in plain text only (no JSON).`;

// ── Component ─────────────────────────────────────────────────────────────────
export default function ChatBot({ user }) {
  const [open, setOpen]                   = useState(false);
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const historyRef                        = useRef([]); // [{role,content}] for Puter
  const bottomRef                         = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Load persisted history from Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'chatHistory'), orderBy('timestamp', 'asc'));
    getDocs(q)
      .then(snap => {
        const stored = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
        setMessages(stored.map((m, i) => ({ id: i, ...m })));
        // Rebuild Puter-format history (user + assistant only, no action chips)
        historyRef.current = stored
          .filter(m => !m.isAction && (m.role === 'user' || m.role === 'assistant'))
          .map(m => ({ role: m.role, content: m.text }));
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [user]);

  const pushMessage = (role, text, isAction = false) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), role, text, isAction }]);
  };

  const saveToFirestore = (role, text, isAction = false) =>
    addDoc(collection(db, 'users', user.uid, 'chatHistory'), {
      role, text, isAction, timestamp: Date.now(),
    }).catch(console.error);

  const send = async () => {
    if (!input.trim() || loading || !historyLoaded) return;
    const userText = input.trim();
    setInput('');
    setLoading(true);

    pushMessage('user', userText);
    saveToFirestore('user', userText);

    try {
      // Build full message array for Puter: system + history + new user message
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...historyRef.current,
        { role: 'user', content: userText },
      ];

      let finalText = '';
      let iterations = 0;

      // Agentic loop — keep going while the model returns tool calls
      while (iterations < 10) {
        iterations++;
        const text = await callAI(messages);
        const call = parseToolCall(text);

        if (call) {
          // Model wants to call a tool
          pushMessage('action', actionLabel(call.tool, call.args ?? {}), true);
          const result = await executeTool(call.tool, call.args ?? {}, user);

          // Feed the tool call + result back into the conversation
          messages.push({ role: 'assistant', content: text });
          messages.push({ role: 'user', content: `Tool result for ${call.tool}: ${JSON.stringify(result)}` });
        } else {
          // Final plain-text response
          finalText = text;
          break;
        }
      }

      if (!finalText) finalText = 'Done! Let me know if you need anything else.';

      pushMessage('assistant', finalText);
      saveToFirestore('assistant', finalText);

      // Update in-memory history for next turn
      historyRef.current = [
        ...historyRef.current,
        { role: 'user',      content: userText  },
        { role: 'assistant', content: finalText },
      ];

    } catch (err) {
      console.error('AI error:', err?.message ?? err);
      pushMessage('assistant', `Error: ${err?.message ?? 'Unknown error'}`);
    }

    setLoading(false);
  };

  if (!user) return null;

  return (
    <>
      <button className="cb-fab" onClick={() => setOpen(o => !o)} aria-label="Toggle AI chat">
        {open ? (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {open && (
        <div className="cb-panel">
          <div className="cb-header">
            <span className="cb-title">
              <span className="cb-status-dot" />
              AI Assistant
            </span>
            <button className="cb-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="cb-messages">
            {messages.length === 0 && !loading && (
              <div className="cb-empty">
                <p>👋 Hi! I can manage your schedule for you.</p>
                <p>Try:<br/>
                  <em>"What tasks do I have this week?"</em><br/>
                  <em>"Fix my schedule for tomorrow"</em><br/>
                  <em>"Add study for math on Friday at 4pm"</em>
                </p>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`cb-msg ${msg.isAction ? 'cb-action' : msg.role === 'user' ? 'cb-user' : 'cb-bot'}`}>
                {msg.isAction
                  ? <span className="cb-action-chip">⚙ {msg.text}</span>
                  : <span className="cb-bubble">{msg.text}</span>
                }
              </div>
            ))}

            {loading && (
              <div className="cb-msg cb-bot">
                <span className="cb-bubble cb-typing"><span /><span /><span /></span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="cb-input-row">
            <input
              className="cb-input"
              type="text"
              placeholder="Ask about your schedule…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading}
            />
            <button className="cb-send" onClick={send} disabled={loading || !input.trim()}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
