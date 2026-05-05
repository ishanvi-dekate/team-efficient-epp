import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import {
  collection, addDoc, getDocs, deleteDoc, updateDoc,
  doc, query, orderBy,
} from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './ChatBot.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ── Tool declarations sent to Gemini ──────────────────────────────────────────
const TOOL_DECLARATIONS = [
  {
    name: 'list_todos',
    description: "Fetch the user's todos. Call this before making any edits so you know IDs and current state.",
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Filter to a single date YYYY-MM-DD (optional)' },
      },
    },
  },
  {
    name: 'add_todo',
    description: 'Add a new task for the user.',
    parameters: {
      type: 'object',
      properties: {
        text:    { type: 'string', description: 'Task description' },
        date:    { type: 'string', description: 'Date YYYY-MM-DD' },
        dueTime: { type: 'string', description: 'Due time HH:MM (optional)' },
      },
      required: ['text', 'date'],
    },
  },
  {
    name: 'update_todo',
    description: 'Update text, date, dueTime, or done status of an existing task by ID.',
    parameters: {
      type: 'object',
      properties: {
        id:      { type: 'string',  description: 'Todo document ID' },
        text:    { type: 'string',  description: 'New text (optional)' },
        date:    { type: 'string',  description: 'New date YYYY-MM-DD (optional)' },
        dueTime: { type: 'string',  description: 'New time HH:MM (optional)' },
        done:    { type: 'boolean', description: 'Mark done/undone (optional)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_todo',
    description: 'Delete a task permanently by ID.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Todo document ID' },
      },
      required: ['id'],
    },
  },
];

// ── Execute a Gemini-requested tool against Firestore ─────────────────────────
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
      text: args.text,
      date: args.date,
      dueTime: args.dueTime ?? null,
      done: false,
      createdAt: Date.now(),
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
    case 'list_todos':  return args.date ? `Reading tasks for ${args.date}…` : 'Reading your tasks…';
    case 'add_todo':    return `Adding "${args.text}" on ${args.date}`;
    case 'update_todo': return 'Updating task…';
    case 'delete_todo': return 'Removing task…';
    default:            return 'Working…';
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ChatBot({ user }) {
  const [open, setOpen]               = useState(false);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const geminiHistory                 = useRef([]); // persisted Gemini-format turns
  const bottomRef                     = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Load persisted chat history from Firestore on mount
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'chatHistory'), orderBy('timestamp', 'asc'));
    getDocs(q)
      .then(snap => {
        const stored = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
        setMessages(stored.map((m, i) => ({ id: i, ...m })));

        // Rebuild the Gemini-compatible history (user + model turns only, no action rows)
        const turns = stored.filter(m => !m.isAction && (m.role === 'user' || m.role === 'model'));
        // Trim any trailing user turn so history ends on model (Gemini requirement)
        while (turns.length && turns[turns.length - 1].role === 'user') turns.pop();
        geminiHistory.current = turns.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
        setHistoryLoaded(true);
      })
      .catch(err => { console.error(err); setHistoryLoaded(true); });
  }, [user]);

  const pushMessage = (role, text, isAction = false) => {
    const id = Date.now() + Math.random();
    setMessages(prev => [...prev, { id, role, text, isAction, timestamp: Date.now() }]);
  };

  const saveToFirestore = (role, text, isAction = false) =>
    addDoc(collection(db, 'users', user.uid, 'chatHistory'), {
      role, text, isAction, timestamp: Date.now(),
    }).catch(console.error);

  const send = async () => {
    if (!input.trim() || loading || !historyLoaded || !API_KEY) return;
    const userText = input.trim();
    setInput('');
    setLoading(true);

    pushMessage('user', userText);
    saveToFirestore('user', userText);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `You are a helpful AI assistant built into Efficient EPP, a student productivity web app.
Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
You help students manage their schedule and todo list.
You have tools to read, add, update, and delete todos in their account.
When asked to fix, optimize, or reorganize a schedule: always call list_todos first, then make the changes yourself using the other tools — do not just give advice.
Keep responses friendly, concise, and specific. After completing tool actions, give a brief summary of what changed.`,
        tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
      });

      const chat = model.startChat({ history: geminiHistory.current });
      let result   = await chat.sendMessage(userText);
      let response = result.response;

      // Agentic loop — keep handling tool calls until Gemini gives a text response
      let iterations = 0;
      while (iterations < 10 && response.candidates?.[0]?.content?.parts?.some(p => p.functionCall)) {
        iterations++;
        const toolResponses = [];

        for (const part of response.candidates[0].content.parts) {
          if (!part.functionCall) continue;
          const { name, args } = part.functionCall;

          pushMessage('action', actionLabel(name, args), true);
          const toolResult = await executeTool(name, args, user);
          toolResponses.push({ functionResponse: { name, response: { result: toolResult } } });
        }

        result   = await chat.sendMessage(toolResponses);
        response = result.response;
      }

      const finalText = response.text();
      pushMessage('model', finalText);
      saveToFirestore('model', finalText);

      // Append this full exchange to our local Gemini history ref
      geminiHistory.current = [
        ...geminiHistory.current,
        { role: 'user',  parts: [{ text: userText }] },
        { role: 'model', parts: [{ text: finalText }] },
      ];

    } catch (err) {
      console.error('Gemini error:', err);
      pushMessage('model', 'Sorry, something went wrong. Check your API key or try again.');
    }

    setLoading(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating action button */}
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

      {/* Chat panel */}
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
                <p>Try asking:<br/>
                  <em>"What tasks do I have this week?"</em><br/>
                  <em>"Fix my schedule for tomorrow"</em><br/>
                  <em>"Add study for math on Friday at 4pm"</em>
                </p>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`cb-msg ${msg.isAction ? 'cb-action' : msg.role === 'user' ? 'cb-user' : 'cb-bot'}`}>
                {msg.isAction ? (
                  <span className="cb-action-chip">⚙ {msg.text}</span>
                ) : (
                  <span className="cb-bubble">{msg.text}</span>
                )}
              </div>
            ))}

            {loading && (
              <div className="cb-msg cb-bot">
                <span className="cb-bubble cb-typing">
                  <span /><span /><span />
                </span>
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
