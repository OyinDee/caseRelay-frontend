import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Cloud as CloudIcon, 
  ShieldCheck as ShieldCheckIcon, 
  Bell as BellIcon, 
  ClipboardList as ClipboardListIcon, 
  Database as DatabaseIcon, 
  Lock as LockIcon 
} from 'lucide-react';
import './css/LandingPage.css';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page mt-5">
      {/* Animated Hero Section */}
      <div className="hero-section container-fluid text-center position-relative py-5">
        {/* Background Shapes */}
        <div className="background-shape position-absolute top-0 start-0 end-0"></div>

        {/* Hero Content */}
        <div className="hero-content">
          <h1 className="display-3 fw-bold mb-3">CaseRelay</h1>
          <p className="lead text-muted mb-4 mx-auto">
            Revolutionizing Law Enforcement Case Management with Cutting-Edge Technology
          </p>
          <div className="cta-buttons d-flex justify-content-center gap-3">
            <a 
              href="#features" 
              className="btn btn-lg shadow-lg theGSbtn"
            >
              Get Started
            </a>
            <Link 
              to="/login" 
              className="btn btn-outline-secondary btn-lg"
            >
              Login Now →
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="features-section py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Transforming Case Management</h2>
            <p className="lead text-muted">
              Designed for law enforcement professionals who demand efficiency, security, and precision.
            </p>
          </div>
          <div className="row">
            {[
              {
                icon: <CloudIcon className="feature-icon" />,
                title: "Collaborative Investigations",
                description: "Seamless real-time collaboration across teams, breaking down communication barriers."
              },
              {
                icon: <ShieldCheckIcon className="feature-icon" />,
                title: "Secure Handovers",
                description: "Comprehensive case transfer protocols ensuring no critical information is lost."
              },
              {
                icon: <BellIcon className="feature-icon" />,
                title: "Intelligent Notifications",
                description: "Smart, contextual alerts keeping you informed about critical case developments."
              }
            ].map((feature, index) => (
              <div key={index} className="col-md-4 mb-4">
                <div className="card h-100 feature-card">
                  <div className="card-body text-center">
                    <div className="mb-3">{feature.icon}</div>
                    <h5 className="card-title">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="value-propositions py-5 bg-light">
        <div className="container">
          <div className="row">
            {[
              {
                icon: <ClipboardListIcon className="value-icon" />,
                title: "Efficiency",
                description: "Streamline workflows with intelligent case management tools that reduce administrative overhead."
              },
              {
                icon: <LockIcon className="value-icon" />,
                title: "Uncompromised Security",
                description: "Military-grade encryption and access controls protect sensitive investigative data."
              },
              {
                icon: <DatabaseIcon className="value-icon" />,
                title: "Comprehensive Tracking",
                description: "Detailed audit trails and version history for complete accountability and transparency."
              }
            ].map((value, index) => (
              <div key={index} className="col-md-4 mb-4">
                <div className="card h-100 value-card text-center">
                  <div className="card-body">
                    <div className="mb-3">{value.icon}</div>
                    <h5 className="card-title">{value.title}</h5>
                    <p className="card-text text-muted">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section text-white py-5 text-center">
        <div className="container">
          <h2 className="display-5 fw-bold mb-3">Ready to Revolutionize Your Workflow?</h2>
          <p className="lead mb-4">
            Join the future of law enforcement case management. Request a personalized demo today.
          </p>
          <a 
            href="#contact" 
            className="btn btn-light btn-lg"
          >
            Contact Us!
          </a>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;