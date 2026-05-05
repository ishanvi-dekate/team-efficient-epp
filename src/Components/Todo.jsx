import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, addDoc, deleteDoc, updateDoc,
  doc, onSnapshot, query, orderBy,
} from 'firebase/firestore';
import './Todo.css';

function formatLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function TodoList({ user, selectedDate }) {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'todos'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('Firestore error:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const visibleTodos = todos.filter(t => t.date === selectedDate);

  const addTodo = async () => {
    if (!input.trim() || !user) return;
    await addDoc(collection(db, 'users', user.uid, 'todos'), {
      text: input.trim(),
      done: false,
      createdAt: Date.now(),
      date: selectedDate,
      dueTime: dueTime || null,
    });
    setInput('');
    setDueTime('');
  };

  const toggleTodo = (id, currentDone) =>
    updateDoc(doc(db, 'users', user.uid, 'todos', id), { done: !currentDone });

  const deleteTodo = (id) =>
    deleteDoc(doc(db, 'users', user.uid, 'todos', id));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTodo();
  };

  return (
    <div className="todo-list">
      <h2 className="todo-title">To-Do List</h2>
      {selectedDate && (
        <p className="todo-date-label">{formatLabel(selectedDate)}</p>
      )}
      <div className="todo-input-row">
        <input
          className="todo-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
        />
        <input
          className="todo-time-input"
          type="time"
          value={dueTime}
          onChange={e => setDueTime(e.target.value)}
          title="Due time (optional)"
        />
        <button className="todo-add-btn" onClick={addTodo}>Add</button>
      </div>

      {loading ? (
        <p className="todo-empty">Loading...</p>
      ) : (
        <ul className="todo-items">
          {visibleTodos.length === 0 && (
            <li className="todo-empty">No tasks for this day. Add one above!</li>
          )}
          {visibleTodos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.done ? 'todo-item-done' : ''}`}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id, todo.done)}
              />
              <span className="todo-text">{todo.text}</span>
              {todo.dueTime && (
                <span className="todo-due-time">{todo.dueTime}</span>
              )}
              <button className="todo-delete-btn" onClick={() => deleteTodo(todo.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoList;
