import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`case-relay-header bg-black ${scrolled ? 'scrolled' : ''}`}
      style={{ 
        transition: 'all 0.3s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1030
      }}
    >
      <div className="container d-flex justify-content-between align-items-center py-2">
        {/* Logo */}
        <div className="d-flex align-items-center">
          <Link 
            to="/" 
            className="navbar-brand text-white d-flex align-items-center"
            style={{ fontWeight: 600, textDecoration: 'none' }}
          >
            <span className="logo-icon me-2">🔍</span>
            CaseRelay
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="navbar-toggler d-md-none text-white border-0 menu-toggle"
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          style={{
            background: 'none',
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* Desktop Navigation */}
        <nav className="d-none d-md-block">
          <ul className="nav flex-row align-items-center">
            <li className="nav-item">
              <Link 
                className="nav-link text-white nav-hover" 
                to="/" 
                onClick={closeMenu}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link text-white nav-hover" 
                href="#features" 
                onClick={closeMenu}
              >
                Features
              </a>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link text-white nav-hover ms-3 text-bold bold" 
                to="/login" 
                onClick={closeMenu}
                style={{
                  borderRadius: '20px',
                  padding: '6px 16px'
                }}
              >
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link text-white nav-hover ms-3 text-bold bold" 
                to="/signup" 
                onClick={closeMenu}
                style={{
                  borderRadius: '20px',
                  padding: '6px 16px'
                }}
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div 
        className={`mobile-menu ${menuOpen ? 'open' : ''} d-md-none`}
        style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          right: 0,
          backgroundColor: '#000020',
          zIndex: 1020,
        }}
      >
        <ul className="nav flex-column text-center">
          <li className="nav-item">
            <Link 
              className="nav-link text-white py-3" 
              to="/" 
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className="nav-link text-white py-3" 
              to="/#features" 
              onClick={closeMenu}
            >
              Features
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className="nav-link text-white py-3" 
              to="/login" 
              onClick={closeMenu}
            >
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className="nav-link text-white py-3" 
              to="/signup" 
              onClick={closeMenu}
            >
              Sign Up
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
