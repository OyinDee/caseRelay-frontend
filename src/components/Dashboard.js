import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Card, Button, Collapse, Spinner, Alert, Navbar } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const DashboardPage = ({ onLogout }) => {
  const [key, setKey] = useState('pending');
  const [cases, setCases] = useState([]);
  const [expandedCases, setExpandedCases] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: '',
    rank: '',
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

        const response = await axios.get('http://localhost:5299/api/cases', {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        });

        setCases(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching cases:', error);
        setError(error.message);
        setIsLoading(false);

        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      }
    };

    const demoCases = [
      {
        id: 1,
        caseNumber: 'CR-001',
        comment: 'Investigating a robbery case. Suspect identified, awaiting arrest.',
        officerName: userDetails.name || 'Officer John Doe',
        officerInCharge: 'Sergeant Mike Johnson',
        dateStarted: '2024-01-01',
        dateHandedOver: null,
        status: 'pending',
      },
      {
        id: 2,
        caseNumber: 'CR-002',
        comment: 'Solved a cybercrime case. Suspect convicted.',
        officerName: userDetails.name || 'Officer Jane Smith',
        officerInCharge: 'Sergeant Mike Johnson',
        dateStarted: '2024-01-05',
        dateHandedOver: '2024-02-10',
        status: 'solved',
      }
    ];

    fetchCases().catch(() => {
      setCases(demoCases);
      setIsLoading(false);
    });
  }, [onLogout]);

  const toggleCase = (caseId) => {
    setExpandedCases((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }));
  };

  const filteredCases = cases.filter((c) => c.status === key);

  return (
    <>
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand>Case Management System</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container 
        className="dashboard-container" 
        style={{ 
          minHeight: "calc(100vh - 56px)", 
          backgroundColor: "#f4f6f9", 
          padding: "2rem"
        }}
      >
        <div className="user-details bg-white shadow-sm rounded p-4 mb-4">
          <div className="row">
            <div className="col-md-6">
              <h3 className="mb-3" style={{ color: "#333" }}>
                {userDetails.name || 'Officer Dashboard'}
              </h3>
              <p className="mb-2">
                <strong>Rank:</strong> {userDetails.rank || 'N/A'}
              </p>
              <p className="mb-2">
                <strong>Department:</strong> {userDetails.department || 'N/A'}
              </p>
              <p>
                <strong>Badge Number:</strong> {userDetails.badgeNumber || 'N/A'}
              </p>
            </div>
            <div className="col-md-6 text-end">
              <h2 className="text-primary">Case Overview</h2>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading cases...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Tabs
          id="case-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-3"
        >
          <Tab eventKey="pending" title="Pending Cases">
            {filteredCases.length === 0 ? (
              <p className="text-center text-muted">No pending cases</p>
            ) : (
              filteredCases.map((caseItem) => (
                <Card key={caseItem.id} className="mb-3">
                  <Card.Header 
                    onClick={() => toggleCase(caseItem.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <strong>{caseItem.caseNumber}</strong> - {caseItem.officerName}
                  </Card.Header>
                  <Collapse in={expandedCases[caseItem.id]}>
                    <Card.Body>
                      <p><strong>Comment:</strong> {caseItem.comment}</p>
                      <p><strong>Officer in Charge:</strong> {caseItem.officerInCharge}</p>
                      <p><strong>Date Started:</strong> {caseItem.dateStarted}</p>
                      {caseItem.dateHandedOver && (
                        <p><strong>Date Handed Over:</strong> {caseItem.dateHandedOver}</p>
                      )}
                    </Card.Body>
                  </Collapse>
                </Card>
              ))
            )}
          </Tab>
          <Tab eventKey="solved" title="Solved Cases">
            {filteredCases.length === 0 ? (
              <p className="text-center text-muted">No solved cases</p>
            ) : (
              filteredCases.map((caseItem) => (
                <Card key={caseItem.id} className="mb-3">
                  <Card.Header 
                    onClick={() => toggleCase(caseItem.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <strong>{caseItem.caseNumber}</strong> - {caseItem.officerName}
                  </Card.Header>
                  <Collapse in={expandedCases[caseItem.id]}>
                    <Card.Body>
                      <p><strong>Comment:</strong> {caseItem.comment}</p>
                      <p><strong>Officer in Charge:</strong> {caseItem.officerInCharge}</p>
                      <p><strong>Date Started:</strong> {caseItem.dateStarted}</p>
                      {caseItem.dateHandedOver && (
                        <p><strong>Date Handed Over:</strong> {caseItem.dateHandedOver}</p>
                      )}
                    </Card.Body>
                  </Collapse>
                </Card>
              ))
            )}
          </Tab>
        </Tabs>
      </Container>
    </>
  );
};

export default DashboardPage;
