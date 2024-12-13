import React from 'react';
import { Link } from 'react-router-dom';
import './css/404.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-subtitle">Page Not Found</p>
        <p className="not-found-description">
          Oops! The page you are looking for seems to have gone missing.
          It might have been moved or deleted.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn-go-home">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;