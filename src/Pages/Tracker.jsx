import Nav from '../Components/Nav';
import TodoList from '../Components/Todo';
import CalendarManager from '../Components/Calander';
import './Tracker.css';

function Tracker({ setPage }) {
  return (
    <div className="tracker-page">
      <div className="tracker-banner">
        <h1 className="tracker-title">Tracker</h1>
      </div>
      <div className="tracker-content">
        <CalendarManager />
        <TodoList />
      </div>
      <Nav setPage={setPage} />
    </div>
  );
}

export default Tracker;
