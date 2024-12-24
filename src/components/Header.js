import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './css/Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    setIsLoggedIn(!!token);
    setUserRole(userDetails.role || '');

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userDetails');
    setIsLoggedIn(false);
    setUserRole('');
    setMenuOpen(false);
    navigate('/');
  };

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <header className={`case-relay-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container-fluid header-container">
        {/* Logo Section */}
        <Link to="/" className="header-logo">
          <span className="logo-icon">🔍</span>
          <span className="logo-text">CaseRelay</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {isLoggedIn ? (
            <ul className="nav-links">
              <li>
                <Link 
                  to="/" 
                  className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
              </li>
              {userRole === 'Admin' && (
                <li>
                  <Link 
                    to="/admin-dashboard" 
                    className={`nav-link ${isActiveRoute('/admin-dashboard') ? 'active' : ''}`}
                  >
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <button 
                  onClick={handleLogout}
                  className="logout-button"
                >
                  Logout
                </button>
              </li>
            </ul>
          ) : (
            <ul className="nav-links">
              <li>
                <Link to="/" className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="nav-link login-btn">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="nav-link signup-btn">
                  Sign Up
                </Link>
              </li>
            </ul>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✖' : '☰'}
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          {isLoggedIn ? (
            <ul className="mobile-nav-links">
              <li>
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
              </li>
              {userRole === 'Admin' && (
                <li>
                  <Link to="/admin-dashboard" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <button onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          ) : (
            <ul className="mobile-nav-links">
              <li>
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;