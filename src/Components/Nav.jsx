import './Nav.css';
import { useState } from 'react';
import Home from '../Pages/Home.jsx';

function Nav({ setPage }) {
  return (
    <footer>
      <div className='navibar'>
        <ul className = 'nav'>
          <li onClick={() => setPage("Home")}>Home</li>
          <li onClick={() => setPage("Todo")}>To-Do</li>
          <li onClick={() => setPage("Mental")}>Mental Health</li>
          <li onClick={() => setPage("Settings")}>Settings</li>
          <li onClick={() => setPage("Profile")}>Profile</li>
          <li onClick={() => setPage("LoginPage")}>Sign-Out</li>
        </ul>
      </div>
      </footer>
  );
}

export default Nav