import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Card, Button, Collapse, Spinner, Alert, Navbar } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Dashboard.css';

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

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userDetails');
    onLogout && onLogout();
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
        handleLogout();
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
      }  catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch cases. Try again.";
        setError(message);
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [onLogout]);

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
                      <button className="handover-button w-100">Handover this case</button>
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
                    </Card.Body>
                  </Collapse>
                </Card>
              ))
            )}
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default DashboardPage;