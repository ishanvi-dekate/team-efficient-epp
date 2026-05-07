import './Nav.css';

function Nav({ setPage, currentPage }) {
  const navItems = [
    { label: 'Home', target: 'Home' },
    { label: 'Tracker', target: 'Todo' },
    { label: 'Mental Check', target: 'Mental' },
    { label: 'Profile', target: 'Profile' },
    { label: 'Settings', target: 'Settings' },
  ];

  return (
    <nav className="app-nav">
      <ul className="app-nav-list">
        {navItems.map((item) => (
          <li
            key={item.target}
            className={`app-nav-item ${currentPage === item.target ? 'active' : ''}`}
            onClick={() => setPage(item.target)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Nav;