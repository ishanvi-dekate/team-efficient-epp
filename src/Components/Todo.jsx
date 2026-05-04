import { useState } from 'react';
import './Todo.css';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input.trim(), done: false }]);
    setInput('');
  };

  const toggleTodo = (id) =>
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const deleteTodo = (id) =>
    setTodos(todos.filter(t => t.id !== id));

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
      <ul className="todo-items">
        {todos.length === 0 && (
          <li className="todo-empty">No tasks yet. Add one above!</li>
        )}
        {todos.map(todo => (
          <li key={todo.id} className={`todo-item ${todo.done ? 'todo-item-done' : ''}`}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className="todo-text">{todo.text}</span>
            <button className="todo-delete-btn" onClick={() => deleteTodo(todo.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
