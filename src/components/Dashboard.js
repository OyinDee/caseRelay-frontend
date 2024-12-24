import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Card, Button, Collapse, Spinner, Alert, Navbar, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Dashboard.css';
import CaseDetailsModal from './CaseDetailsModal';
import SearchBar from './SearchBar';

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
  const [newOfficerId, setNewOfficerId] = useState(""); 
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false); 
  const [showCreateCaseModal, setShowCreateCaseModal] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    category: '',
    severity: ''
  });
  const navigate = useNavigate();

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
    fetchCases();
  }, [onLogout, navigate]);

  const fetchCases = async () => {
    const jwtToken = localStorage.getItem('jwtToken');

    if (!jwtToken) {
      handleLogout(); 
      return;
    }

    try {
      const response = await axios.get('https://caserelay-hmaah2bddygjcgbn.canadacentral-01.azurewebsites.net/api/case/user', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });

      setCases(response.data);
      console.log(response.data)
      setIsLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('jwtToken');
        navigate('/login');
      } else {
        const message =
          err.response?.data?.message || 'Failed to fetch cases. Try again.';
        setError(message);
        setIsLoading(false);
      }
    }
  };

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

  const handleHandover = async (caseId) => {
    if (!caseId || !newOfficerId) {
      alert("Please provide a valid Case ID and Officer ID.");
      return;
    }

    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.post(
        `https://caserelay-hmaah2bddygjcgbn.canadacentral-01.azurewebsites.net/api/case/handover/${caseId}`,
        { NewOfficerId: newOfficerId },
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      alert(response.data.message || 'Case handed over successfully.');
      setShowHandoverModal(false);
      fetchCases(); 
    } catch (error) {
      if (error.response?.data) {
        setError(error.response.data.message || 'Error handing over the case.');
      } else {
        setError('Unable to connect to the server.');
      }
    }
  };

  const handleSearchResults = (results) => {
    setCases(results);
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      await axios.post(
        'https://caserelay-hmaah2bddygjcgbn.canadacentral-01.azurewebsites.net/api/case',
        newCase,
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setShowCreateCaseModal(false);
      fetchCases();
      setNewCase({ title: '', description: '', category: '', severity: '' });
    } catch (error) {
      setError('Failed to create case');
    }
  };

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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <SearchBar onSearchResults={handleSearchResults} />
          <Button 
            variant="dark" 
            onClick={() => setShowCreateCaseModal(true)}
          >
            Create New Case
          </Button>
        </div>
        <div className="user-details-card mb-4">
          <div className="row">
            <div className="col-md-8">
              <h3 className="user-name">{userDetails.name || 'Officer Dashboard'}</h3>
              <div className="user-info">
                <p><strong>Role:</strong> {userDetails.role || 'N/A'}</p>
                <p><strong>Department:</strong> {userDetails.department || 'N/A'}</p>
                <p><strong>Badge Number:</strong> {userDetails.badgeNumber || 'N/A'}</p>
              </div>
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
                  <Card.Header onClick={() => toggleCase(caseItem.caseId)} className="case-card-header">
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
                        <button
                          className="handover-button w-100 mx-1"
                          onClick={() => {
                            setSelectedCaseId(caseItem.caseId);
                            setShowHandoverModal(true);
                          }}
                        >
                          Handover this case
                        </button>
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
                  <Card.Header onClick={() => toggleCase(caseItem.caseId)} className="case-card-header">
                    <strong>{caseItem.caseNumber}</strong> - {caseItem.title}
                  </Card.Header>
                  <Collapse in={expandedCases[caseItem.caseId]}>
                    <Card.Body className="case-card-body">
                      <p><strong>Description:</strong> {caseItem.description}</p>
                      <p><strong>Category:</strong> {caseItem.category}</p>
                      <p><strong>Severity:</strong> {caseItem.severity}</p>
                      <p><strong>Status:</strong> {caseItem.status}</p>
                    </Card.Body>
                  </Collapse>
                </Card>
              ))
            )}
          </Tab>
        </Tabs>
      </Container>

      <CaseDetailsModal
        show={showCaseModal}
        handleClose={handleCloseCaseModal}
        caseId={selectedCaseId}
      />

      <Modal show={showHandoverModal} onHide={() => setShowHandoverModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Handover Case</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><small><i>Disclaimer: Handover will transfer the case to another officer. Ensure the provided Officer ID is correct.</i></small></p>
          <Form onSubmit={(e) => { e.preventDefault(); handleHandover(selectedCaseId); }}>
            <Form.Group controlId="officerId">
              <Form.Label>New Officer ID</Form.Label>
              <Form.Control
                type="text"
                value={newOfficerId}
                onChange={(e) => setNewOfficerId(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="dark" type="submit" className="w-100 mt-2">
              Handover
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showCreateCaseModal} onHide={() => setShowCreateCaseModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Case</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateCase}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={newCase.title}
                onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newCase.description}
                onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={newCase.category}
                onChange={(e) => setNewCase({...newCase, category: e.target.value})}
                required
              >
                <option value="">Select category...</option>
                <option value="Theft">Theft</option>
                <option value="Assault">Assault</option>
                <option value="Fraud">Fraud</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Severity</Form.Label>
              <Form.Select
                value={newCase.severity}
                onChange={(e) => setNewCase({...newCase, severity: e.target.value})}
                required
              >
                <option value="">Select severity...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </Form.Select>
            </Form.Group>
            <Button variant="dark" type="submit" className="w-100">
              Create Case
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardPage;
