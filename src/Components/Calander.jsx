import { useState } from 'react';
import './Calander.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const CalendarManager = ({ selectedDate, onSelectDate }) => {
  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const [current, setCurrent] = useState(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const year = current.getFullYear();
  const month = current.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={prevMonth}>&lt;</button>
        <h2 className="calendar-title">{MONTH_NAMES[month]} {year}</h2>
        <button className="calendar-nav" onClick={nextMonth}>&gt;</button>
      </div>
      <div className="calendar-grid">
        {DAY_HEADERS.map(d => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}
        {cells.map((day, i) => {
          const dateStr = day ? formatDate(year, month, day) : null;
          return (
            <div
              key={i}
              className={[
                'calendar-cell',
                day ? 'calendar-cell-active' : '',
                dateStr === todayStr ? 'calendar-cell-today' : '',
                dateStr === selectedDate ? 'calendar-cell-selected' : '',
              ].join(' ')}
              onClick={() => day && onSelectDate(dateStr)}
            >
              {day ?? ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarManager;
