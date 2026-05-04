import { useState } from 'react';
import './Calander.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarManager = () => {
  const today = new Date();
  const [current, setCurrent] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selected, setSelected] = useState(null);

  const year = current.getFullYear();
  const month = current.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

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
        {cells.map((day, i) => (
          <div
            key={i}
            className={[
              'calendar-cell',
              day ? 'calendar-cell-active' : '',
              isToday(day) ? 'calendar-cell-today' : '',
              day && selected === `${year}-${month}-${day}` ? 'calendar-cell-selected' : '',
            ].join(' ')}
            onClick={() => day && setSelected(`${year}-${month}-${day}`)}
          >
            {day ?? ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarManager;

// peanut butter is shaped like the letter "E"
