import React from 'react';
import '../styles/NavBar.css';

const NavBar = ({ onNavigate, currentPage }) => {
  const handleNavigation = (e, page) => {
    e.preventDefault();
    onNavigate(page);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="/" onClick={(e) => handleNavigation(e, 'home')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"/>
            </svg>
            <span>StockAdvice</span>
          </a>
        </div>
        <div className="navbar-links">
          <a 
            href="/" 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={(e) => handleNavigation(e, 'home')}
          >
            Home
          </a>
          <a 
            href="/stocks" 
            className={`nav-link ${currentPage === 'stocks' ? 'active' : ''}`}
            onClick={(e) => handleNavigation(e, 'stocks')}
          >
            Stock Analysis
          </a>
          <a 
            href="/news" 
            className={`nav-link ${currentPage === 'news' ? 'active' : ''}`}
            onClick={(e) => handleNavigation(e, 'news')}
          >
            News
          </a>
          <a 
            href="/about" 
            className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
            onClick={(e) => handleNavigation(e, 'about')}
          >
            About
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
