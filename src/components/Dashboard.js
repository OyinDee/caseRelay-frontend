import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Card, Button, Collapse, Spinner, Alert, Navbar } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import for redirect
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Dashboard.css';
import CaseDetailsModal from './CaseDetailsModal';

const DashboardPage = ({ onLogout }) => {
  const [key, setKey] = useState('pending');
  const [cases, setCases] = useState([]);
  const [expandedCases, setExpandedCases] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: '',
    role: '',
    department: '',
    badgeNumber: ''
  });

  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userDetails');
    onLogout && onLogout();
    navigate('/login'); 
  };

  const handleViewCase = (caseId) => {
    setSelectedCaseId(caseId);
    setShowCaseModal(true);
  };

  const handleCloseCaseModal = () => {
    setShowCaseModal(false);
    setSelectedCaseId(null);
  };

  useEffect(() => {
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      try {
        const parsedUserDetails = JSON.parse(storedUserDetails);
        setUserDetails(parsedUserDetails);
      } catch (error) {
        console.error('Error parsing user details:', error);
      }
    }

    const fetchCases = async () => {
      const jwtToken = localStorage.getItem('jwtToken');

      if (!jwtToken) {
        handleLogout(); // No token found, log out user
        return;
      }

      try {
        const tokenParts = jwtToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }

        const response = await axios.get('http://localhost:5299/api/case/user', {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        });

        setCases(response.data);
        setIsLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('jwtToken'); // Clear the invalid JWT token
          navigate('/login'); // Redirect to the login page
        } else {
          const message =
            err.response?.data?.message || 'Failed to fetch cases. Try again.';
          setError(message);
          setIsLoading(false);
        }
      }
    };

    fetchCases();
  }, [onLogout, navigate]);

  const toggleCase = (caseId) => {
    setExpandedCases((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }));
  };

  const getPendingStatuses = ['Pending', 'Open', 'Investigating'];
  const getSolvedStatuses = ['Closed', 'Resolved'];

  const filteredCases = cases.filter((c) =>
    (key === 'pending' && getPendingStatuses.includes(c.status)) ||
    (key === 'closed' && getSolvedStatuses.includes(c.status))
  );

  return (
    <div className="dashboard-wrapper">
      <Navbar bg="dark" variant="dark" className="dashboard-navbar">
        <Container>
          <Navbar.Brand className="dashboard-brand">Case Management System</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Button variant="outline-light" onClick={handleLogout} className="logout-btn">
              Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="dashboard-container">
        <div className="user-details-card mb-4">
          <div className="row">
            <div className="col-md-8">
              <h3 className="user-name">
                {userDetails.name || 'Officer Dashboard'}
              </h3>
              <div className="user-info">
                <p><strong>Role:</strong> {userDetails.role || 'N/A'}</p>
                <p><strong>Department:</strong> {userDetails.department || 'N/A'}</p>
                <p><strong>Badge Number:</strong> {userDetails.badgeNumber || 'N/A'}</p>
              </div>
            </div>
            <div className="col-md-4 text-end">
              <h4 className="case-overview-title">Case Overview</h4>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="loading-container">
            <Spinner animation="border" variant="dark" />
            <p className="loading-text">Loading cases...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="error-alert">
            {error}
          </Alert>
        )}

        <Tabs
          id="case-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="case-tabs mb-3"
        >
          <Tab eventKey="pending" title="Pending Cases">
            {filteredCases.length === 0 ? (
              <p className="no-cases-message">No pending cases</p>
            ) : (
              filteredCases.map((caseItem) => (
                <Card key={caseItem.caseId} className="case-card mb-3">
                  <Card.Header
                    onClick={() => toggleCase(caseItem.caseId)}
                    className="case-card-header"
                  >
                    <strong>{caseItem.caseNumber}</strong> - {caseItem.title}
                  </Card.Header>
                  <Collapse in={expandedCases[caseItem.caseId]}>
                    <Card.Body className="case-card-body">
                      <p><strong>Description:</strong> {caseItem.description}</p>
                      <p><strong>Category:</strong> {caseItem.category}</p>
                      <p><strong>Severity:</strong> {caseItem.severity}</p>
                      <p><strong>Reported At:</strong> {new Date(caseItem.reportedAt).toLocaleString()}</p>
                      <p><strong>Status:</strong> {caseItem.status}</p>
                      <div className="d-flex justify-content-between">
                        <button className="handover-button w-100 mx-1">Handover this case</button>

                        <button 
                          className="handover-button w-100 mx-1" 
                          onClick={() => handleViewCase(caseItem.caseId)}
                        >
                          View Case
                        </button>
                      </div>
                    </Card.Body>
                  </Collapse>
                </Card>
              ))
            )}
          </Tab>
          <Tab eventKey="closed" title="Solved Cases">
            {filteredCases.length === 0 ? (
              <p className="no-cases-message">No solved cases</p>
            ) : (
              filteredCases.map((caseItem) => (
                <Card key={caseItem.caseId} className="case-card mb-3">
                  <Card.Header
                    onClick={() => toggleCase(caseItem.caseId)}
                    className="case-card-header"
                  >
                    <strong>{caseItem.caseNumber}</strong> - {caseItem.title}
                  </Card.Header>
                  <Collapse in={expandedCases[caseItem.caseId]}>
                    <Card.Body className="case-card-body">
                      <p><strong>Description:</strong> {caseItem.description}</p>
                      <p><strong>Category:</strong> {caseItem.category}</p>
                      <p><strong>Severity:</strong> {caseItem.severity}</p>
                      <p><strong>Reported At:</strong> {new Date(caseItem.reportedAt).toLocaleString()}</p>
                      {caseItem.resolvedAt && (
                        <p><strong>Resolved At:</strong> {new Date(caseItem.resolvedAt).toLocaleString()}</p>
                      )}
                      <p><strong>Status:</strong> {caseItem.status}</p>
                      <button 
                        className="view-case-button w-100" 
                        onClick={() => handleViewCase(caseItem.caseId)}
                      >
                        View Case
                      </button>
                    </Card.Body>
                  </Collapse>
                </Card>
              ))
            )}
          </Tab>
        </Tabs>

        {/* Case Details Modal */}
        <CaseDetailsModal 
          caseId={selectedCaseId}
          show={showCaseModal}
          onHide={handleCloseCaseModal}
        />
      </Container>
    </div>
  );
};

export default DashboardPage;
