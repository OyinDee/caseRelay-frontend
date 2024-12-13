import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Card, Button, Collapse } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Dashboard.css';

const DashboardPage = () => {
  const [key, setKey] = useState('pending');
  const [cases, setCases] = useState([]);
  const [expandedCases, setExpandedCases] = useState({});

  useEffect(() => {
    // Fetch cases from the API
    const fetchCases = async () => {
      try {
        const jwtToken = 'your-jwt-token-here'; // Replace with actual JWT token
        const response = await axios.get('http://localhost:5299/api/cases', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setCases(response.data);
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    };

    fetchCases();
  }, []);

  const toggleCase = (caseId) => {
    setExpandedCases((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }));
  };

  const demoCases = [
    {
      id: 1,
      caseNumber: 'CR-001',
      comment: 'Investigating a robbery case. Suspect identified, awaiting arrest.',
      officerName: 'Officer John Doe',
      officerInCharge: 'Sergeant Mike Johnson',
      dateStarted: '2024-01-01',
      dateHandedOver: null,
      status: 'pending',
    },
    {
      id: 2,
      caseNumber: 'CR-002',
      comment: 'Solved a cybercrime case. Suspect convicted.',
      officerName: 'Officer Jane Smith',
      officerInCharge: 'Sergeant Mike Johnson',
      dateStarted: '2024-01-05',
      dateHandedOver: '2024-02-10',
      status: 'solved',
    },
    {
      id: 3,
      caseNumber: 'CR-003',
      comment: 'Investigating a homicide case. Evidence collected, suspect on the run.',
      officerName: 'Officer John Doe',
      officerInCharge: 'Sergeant Mike Johnson',
      dateStarted: '2024-01-10',
      dateHandedOver: null,
      status: 'pending',
    },
    {
      id: 4,
      caseNumber: 'CR-004',
      comment: 'Solved a narcotics case. Drug ring dismantled.',
      officerName: 'Officer Jane Smith',
      officerInCharge: 'Sergeant Mike Johnson',
      dateStarted: '2024-01-15',
      dateHandedOver: '2024-03-01',
      status: 'solved',
    },
    {
      id: 5,
      caseNumber: 'CR-005',
      comment: 'Investigating a burglary case. Suspect apprehended, awaiting trial.',
      officerName: 'Officer John Doe',
      officerInCharge: 'Sergeant Mike Johnson',
      dateStarted: '2024-01-20',
      dateHandedOver: null,
      status: 'pending',
    },
    {
      id: 6,
      caseNumber: 'CR-006',
      comment: 'Solved a fraud case. Suspect sentenced.',
      officerName: 'Officer Jane Smith',
      officerInCharge: 'Sergeant Mike Johnson',
      dateStarted: '2024-01-25',
      dateHandedOver: '2024-03-15',
      status: 'solved',
    },
    {
      id: 7,
      caseNumber: 'CR-007',
      comment: 'Investigating a kidnapping case. Victim rescued, suspect in custody.',
      officerName: 'Officer John Doe',
      officerInCharge: 'Sergeant Mike Johnson',
      dateStarted: '2024-02-01',
      dateHandedOver: null,
      status: 'pending',
    },
    {
      id: 8,
      caseNumber: 'CR-008',
      comment: 'Solved a domestic violence case. Victim safe, suspect jailed.',
      officerName: 'Officer Jane Smith',
      officerInCharge: 'Sergeant Mike Johnson',
      dateStarted: '2024-02-05',
      dateHandedOver: '2024-03-20',
      status: 'solved',
    },
    {
      id: 9,
      caseNumber: 'CR-009',
      comment: 'Investigating a vandalism case. Suspect identified, awaiting arrest.',
      officerName: 'Officer John Doe',
      officerInCharge: 'Sergeant Mike Johnson',
      dateStarted: '2024-02-10',
      dateHandedOver: null,
      status: 'pending',
    },
    {
      id: 10,
      caseNumber: 'CR-010',
      comment: 'Solved a human trafficking case. Victims rescued, suspects convicted.',
      officerName: 'Officer Jane Smith',
      officerInCharge: 'Sergeant Mike Johnson',
      dateStarted: '2024-02-15',
      dateHandedOver: '2024-04-01',
      status: 'solved',
    },
  ];

  const filteredCases = demoCases.filter((c) => c.status === key);

  return (
    <Container className="dashboard-container" style={{ minHeight: "100vh", backgroundColor: "#ffffff", padding: "2rem", paddingTop: "5rem" }}>
      <h2 className="text-center mb-4" style={{ color: "#000000" }}>Officer Dashboard</h2>
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        <Tab eventKey="pending" title="Pending">
          {filteredCases.map((c) => (
            <Card key={c.id} className="mb-3" style={{ backgroundColor: "#f8f9fa", color: "#000000" }}>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{c.caseNumber}</h5>
                    <small>{c.officerName}</small>
                  </div>
                  <Button variant="link" onClick={() => toggleCase(c.id)} style={{ color: "#000000" }}>
                    {expandedCases[c.id] ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              </Card.Header>
              <Collapse in={expandedCases[c.id]}>
                <Card.Body>
                  <p><strong>Comment:</strong> {c.comment}</p>
                  <p><strong>Officer In Charge:</strong> {c.officerInCharge}</p>
                  <p><strong>Date Started:</strong> {c.dateStarted}</p>
                  {c.dateHandedOver && <p><strong>Date Handed Over:</strong> {c.dateHandedOver}</p>}
                </Card.Body>
              </Collapse>
            </Card>
          ))}
        </Tab>
        <Tab eventKey="solved" title="Solved">
          {filteredCases.map((c) => (
            <Card key={c.id} className="mb-3" style={{ backgroundColor: "#f8f9fa", color: "#000000" }}>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{c.caseNumber}</h5>
                    <small>{c.officerName}</small>
                  </div>
                  <Button variant="link" onClick={() => toggleCase(c.id)} style={{ color: "#000000" }}>
                    {expandedCases[c.id] ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              </Card.Header>
              <Collapse in={expandedCases[c.id]}>
                <Card.Body>
                  <p><strong>Comment:</strong> {c.comment}</p>
                  <p><strong>Officer In Charge:</strong> {c.officerInCharge}</p>
                  <p><strong>Date Started:</strong> {c.dateStarted}</p>
                  {c.dateHandedOver && <p><strong>Date Handed Over:</strong> {c.dateHandedOver}</p>}
                </Card.Body>
              </Collapse>
            </Card>
          ))}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default DashboardPage;
