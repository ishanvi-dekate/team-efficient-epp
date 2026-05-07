import './Header.css';

function Header() {
  return (
    <header className="app-header">
      <div className="header-wave" aria-hidden="true" />
      <div className="header-wave header-wave-2" aria-hidden="true" />
      <div className="app-header-brand">
        <span className="app-header-name">efficient.epp</span>
        <span className="app-header-tag">expLore YoUr HaBits</span>
      </div>
    </header>
  );
}

export default Header;