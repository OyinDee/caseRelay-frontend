import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer bg-dark text-white py-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5 className="footer-brand">CaseRelay</h5>
            <p className="text-muted">Connecting Cases, Empowering Justice</p>
          </div>
          
          <div className="col-md-4 mb-3 mb-md-0">
            <h6 className="footer-section-title">Quick Links</h6>
            <ul className="list-unstyled">
              <li><a href="/about" className="footer-link">About Us</a></li>
              <li><a href="/services" className="footer-link">Services</a></li>
              <li><a href="/contact" className="footer-link">Contact</a></li>
            </ul>
          </div>
          
          <div className="col-md-4">
            <h6 className="footer-section-title">Connect With Us</h6>
            <div className="social-icons">
              <a href="#" className="text-white me-3"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-white me-3"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-white me-3"><i className="fab fa-linkedin-in"></i></a>
              <a href="#" className="text-white"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
        
        <hr className="my-4 border-secondary" />
        
        <div className="row">
          <div className="col-12 text-center">
            <p className="mb-0">
              &copy; {currentYear} CaseRelay. All Rights Reserved. 
              <a href="/privacy" className="footer-legal-link ms-2">Privacy Policy</a> | 
              <a href="/terms" className="footer-legal-link ms-2">Terms of Service</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;