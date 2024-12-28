import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Check, Trash2 } from 'lucide-react';
import axios from 'axios';
import './css/Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = 'https://cr-bybsg3akhphkf3b6.canadacentral-01.azurewebsites.net/api';

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

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get(`${API_BASE_URL}/notification`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Notifications:', response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.patch(
        `${API_BASE_URL}/notification/${notificationId}/read`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      setNotifications(prev => 
        prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.delete(`${API_BASE_URL}/notification/${notificationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userDetails');
    setIsLoggedIn(false);
    setUserRole('');
    setMenuOpen(false);
    navigate('/');
  };

  const handleNavigation = (path) => {
    setIsNavigating(true);
    navigate(path);
    setIsNavigating(false);
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
                  className="nav-link login-btn"
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

        {isLoggedIn && (
          <div className="notifications-wrapper">
            <button 
              className="notifications-button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} color="white" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h6>Notifications</h6>
                  {notifications.length > 0 && (
                    <button 
                      className="mark-all-read"
                      onClick={() => notifications.forEach(n => markAsRead(n.notificationId))}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {isLoadingNotifications ? (
                    <div className="notification-loading">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <p className="no-notifications">No notifications</p>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.notificationId} 
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                      >
                        <div className="notification-content">
                          <h6 className="notification-title">{notification.title}</h6>
                          <p className="notification-message">{notification.message}</p>
                          <small className="notification-meta">
                            {new Date(notification.createdAt).toLocaleString()} • By {notification.actionBy}
                          </small>
                        </div>
                        <div className="notification-actions">
                          {!notification.isRead && (
                            <button 
                              className="action-button"
                              onClick={() => markAsRead(notification.notificationId)}
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button 
                            className="action-button delete"
                            onClick={() => deleteNotification(notification.notificationId)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isNavigating && (
        <div className="navigation-loader">
          <div className="loader-line"></div>
        </div>
      )}
    </header>
  );
};

export default Header;
