import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import './WeeklyPlanner.css';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getWeekDates(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const anchor = new Date(y, m - 1, d);
  const startOffset = anchor.getDay(); // 0=Sun
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(anchor);
    day.setDate(anchor.getDate() - startOffset + i);
    return day;
  });
}

function formatMonthRange(dates) {
  const first = dates[0];
  const last = dates[6];
  const opts = { month: 'long', year: 'numeric' };
  if (first.getMonth() === last.getMonth()) {
    return first.toLocaleDateString('en-US', opts);
  }
  return `${first.toLocaleDateString('en-US', { month: 'short' })} – ${last.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

function WeeklyPlanner({ user, selectedDate, onSelectDate }) {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    if (!user) { setTodos([]); return; }
    const q = query(
      collection(db, 'users', user.uid, 'todos'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snap) => {
      setTodos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error('WeeklyPlanner Firestore error:', err));
  }, [user]);

  const weekDates = getWeekDates(selectedDate);
  const todayStr = formatDate(new Date());

  const goToPrevWeek = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const prev = new Date(y, m - 1, d - 7);
    onSelectDate(formatDate(prev));
  };

  const goToNextWeek = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + 7);
    onSelectDate(formatDate(next));
  };

  return (
    <div className="weekly-planner">
      <div className="weekly-header">
        <button className="weekly-nav" onClick={goToPrevWeek}>&lt;</button>
        <h2 className="weekly-title">Weekly Planner — {formatMonthRange(weekDates)}</h2>
        <button className="weekly-nav" onClick={goToNextWeek}>&gt;</button>
      </div>
      <div className="weekly-grid">
        {weekDates.map((date) => {
          const dateStr = formatDate(date);
          const dayTodos = todos.filter(t => t.date === dateStr);
          const done = dayTodos.filter(t => t.done).length;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <div
              key={dateStr}
              className={[
                'weekly-day',
                isToday ? 'weekly-day-today' : '',
                isSelected ? 'weekly-day-selected' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelectDate(dateStr)}
            >
              <div className="weekly-day-header">
                <span className="weekly-day-name">{DAY_NAMES[date.getDay()]}</span>
                <span className="weekly-day-num">{date.getDate()}</span>
              </div>
              {dayTodos.length > 0 && (
                <div className="weekly-progress-bar">
                  <div
                    className="weekly-progress-fill"
                    style={{ width: `${(done / dayTodos.length) * 100}%` }}
                  />
                </div>
              )}
              <ul className="weekly-todo-list">
                {dayTodos.length === 0 && (
                  <li className="weekly-empty">No tasks</li>
                )}
                {dayTodos.map(todo => (
                  <li key={todo.id} className={`weekly-todo-item ${todo.done ? 'weekly-todo-done' : ''}`}>
                    {todo.dueTime && (
                      <span className="weekly-todo-time">{todo.dueTime}</span>
                    )}
                    <span className="weekly-todo-text">{todo.text}</span>
                  </li>
                ))}
              </ul>
              {dayTodos.length > 0 && (
                <div className="weekly-count">{done}/{dayTodos.length} done</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyPlanner;
