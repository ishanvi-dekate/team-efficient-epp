import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, addDoc, deleteDoc, updateDoc,
  doc, onSnapshot, query, orderBy,
} from 'firebase/firestore';
import './Todo.css';

function TodoList({ user }) {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Subscribe to this user's todos in Firestore
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

  const addTodo = async () => {
    if (!input.trim() || !user) return;
    await addDoc(collection(db, 'users', user.uid, 'todos'), {
      text: input.trim(),
      done: false,
      createdAt: Date.now(),
    });
    setInput('');
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
      <div className="todo-input-row">
        <input
          className="todo-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
        />
        <button className="todo-add-btn" onClick={addTodo}>Add</button>
      </div>

      {loading ? (
        <p className="todo-empty">Loading...</p>
      ) : (
        <ul className="todo-items">
          {todos.length === 0 && (
            <li className="todo-empty">No tasks yet. Add one above!</li>
          )}
          {todos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.done ? 'todo-item-done' : ''}`}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id, todo.done)}
              />
              <span className="todo-text">{todo.text}</span>
              <button className="todo-delete-btn" onClick={() => deleteTodo(todo.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoList;
