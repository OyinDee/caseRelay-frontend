import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/AdminDashboard.css';
import SearchBar from './SearchBar';

const AdminDashboardPage = () => {
  const [key, setKey] = useState('cases');
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = 'https://caserelay-hmaah2bddygjcgbn.canadacentral-01.azurewebsites.net/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [casesResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/Case/all`, { headers }),
        axios.get(`${API_BASE_URL}/Case/statistics`, { headers })
      ]);

      setCases(casesResponse.data);
      setStatistics(statsResponse.data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.put(`${API_BASE_URL}/User/promote-to-admin/${userId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert('User promoted to admin successfully');
      fetchData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.put(`${API_BASE_URL}/User/change-role/${userId}`, JSON.stringify(newRole), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert('Role updated successfully');
      fetchData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('jwtToken');
        await axios.delete(`${API_BASE_URL}/User/delete/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        alert('User deleted successfully');
        fetchData();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleApproveCase = async (caseId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.patch(
        `${API_BASE_URL}/Case/${caseId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      alert('Case approved successfully');
      fetchData();
    } catch (error) {
      setError('Failed to approve case');
    }
  };

  const handleSearchResults = (results) => {
    setCases(results);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="dark" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Container>
        <h1 className="admin-title">Admin Dashboard</h1>
        <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-4">
          <Tab eventKey="cases" title="All Cases">
            <SearchBar onSearchResults={handleSearchResults} />
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Case Number</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Approval Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map(caseItem => (
                  <tr key={caseItem.caseId}>
                    <td>{caseItem.caseNumber}</td>
                    <td>{caseItem.title}</td>
                    <td>{caseItem.status}</td>
                    <td>{caseItem.assignedOfficerId || 'Unassigned'}</td>
                    <td>{caseItem.isApproved ? 'Approved' : 'Pending Approval'}</td>
                    <td>
                      <Button 
                        variant="dark" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleApproveCase(caseItem.caseId)}
                        disabled={caseItem.isApproved}
                      >
                        {caseItem.isApproved ? 'Approved' : 'Approve'}
                      </Button>
                      <Button variant="outline-dark" size="sm">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
          
          <Tab eventKey="users" title="Users">
            <Button variant="dark" className="mb-3" onClick={() => setShowUserModal(true)}>
              Add New User
            </Button>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Police ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.userID}>
                    <td>{user.policeId}</td>
                    <td>{`${user.firstName} ${user.lastName}`}</td>
                    <td>{user.role}</td>
                    <td>{user.department}</td>
                    <td>
                      <Button variant="dark" size="sm" className="me-2" 
                        onClick={() => handlePromoteToAdmin(user.userID)}>
                        Promote to Admin
                      </Button>
                      <Button variant="outline-danger" size="sm"
                        onClick={() => handleDeleteUser(user.userID)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
          
          <Tab eventKey="statistics" title="Statistics">
            {statistics && (
              <div className="statistics-container">
                <Card className="stat-card">
                  <Card.Body>
                    <Card.Title>Total Cases</Card.Title>
                    <Card.Text>{statistics.totalCases}</Card.Text>
                  </Card.Body>
                </Card>
                {/* Add more statistics cards as needed */}
              </div>
            )}
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default AdminDashboardPage;
