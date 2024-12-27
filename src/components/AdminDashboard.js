import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/AdminDashboard.css';
import SearchBar from './SearchBar';
import { toast } from 'react-toastify';
import { api } from '../config/api';

const AdminDashboardPage = () => {
  const [key, setKey] = useState('cases');
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState({
    totalCases: 0,
    openCases: 0,
    closedCases: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = 'https://cr-bybsg3akhphkf3b6.canadacentral-01.azurewebsites.net/api';

  const fetchStats = async () => {
    try {
      const response = await api.get('/case/statistics');
      console.log('Statistics:', response.data);
      setStatistics(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const policeId = JSON.parse(localStorage.getItem('userDetails') || '{}').policeId;
    if (!token || !policeId) {
      navigate('/login');
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/userinfo/${policeId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('User Info:', response.data);
        const userInfo = response.data;
        if (userInfo.role !== 'Admin') {
          navigate('/dashboard');
          return;
        }
        fetchData();
        fetchStats();
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        navigate('/login');
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [casesResponse, statsResponse, usersResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/Case/all`, { headers }),
        axios.get(`${API_BASE_URL}/Case/statistics`, { headers }),
        axios.get(`${API_BASE_URL}/User/all`, { headers }) // Add users fetching
      ]);

      console.log('Cases:', casesResponse.data);
      console.log('Statistics:', statsResponse.data);
      console.log('Users:', usersResponse.data);

      setCases(casesResponse.data);
      setStatistics(statsResponse.data);
      setUsers(usersResponse.data); // Set users data
      setIsLoading(false);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || err.message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.put(`${API_BASE_URL}/User/promote-to-admin/${userId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Promote to Admin Response:', response.data);
      toast.success('User promoted to admin successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to promote user');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.put(`${API_BASE_URL}/User/change-role/${userId}`, JSON.stringify(newRole), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Change Role Response:', response.data);
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
        const response = await axios.delete(`${API_BASE_URL}/User/delete/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Delete User Response:', response.data);
        toast.success('User deleted successfully');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleApproveCase = async (caseId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.patch(
        `${API_BASE_URL}/Case/${caseId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Approve Case Response:', response.data);
      toast.success('Case approved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve case');
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
        <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-4 custom-tabs">
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
            {isLoading ? (
              <div className="text-center">
                <Spinner animation="border" variant="dark" />
                <p>Loading statistics...</p>
              </div>
            ) : (
              <div className="statistics-grid">
                <Card className="stat-card">
                  <Card.Body>
                    <Card.Title>Total Cases</Card.Title>
                    <Card.Text className="stat-number">{statistics.totalCases}</Card.Text>
                  </Card.Body>
                </Card>

                <Card className="stat-card">
                  <Card.Body>
                    <Card.Title>Open Cases</Card.Title>
                    <Card.Text className="stat-number">{statistics.openCases}</Card.Text>
                  </Card.Body>
                </Card>

                <Card className="stat-card">
                  <Card.Body>
                    <Card.Title>Closed Cases</Card.Title>
                    <Card.Text className="stat-number">{statistics.closedCases}</Card.Text>
                  </Card.Body>
                </Card>
              </div>
            )}
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default AdminDashboardPage;
