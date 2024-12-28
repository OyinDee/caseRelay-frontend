import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/AdminDashboard.css';
import SearchBar from './SearchBar';
import { toast } from 'react-toastify';
import { api } from '../config/api';
import CaseDetailsModal from './CaseDetailsModal';
import { Dropdown } from 'react-bootstrap';

const AdminDashboardPage = () => {
  const [key, setKey] = useState('cases');
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState({
    totalCases: 0,
    pendingCases: 0,
    openCases: 0,
    investigatingCases: 0,
    closedCases: 0,
    resolvedCases: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: '', data: null });
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
        axios.get(`${API_BASE_URL}/case/all`, { headers }),
        axios.get(`${API_BASE_URL}/case/statistics`, { headers }),
        axios.get(`${API_BASE_URL}/user/all`, { headers }) // Add users fetching
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

  const handleConfirmAction = () => {
    switch (confirmAction.type) {
      case 'delete':
        handleDeleteUserConfirmed(confirmAction.data);
        break;
      case 'promote':
        handlePromoteToAdminConfirmed(confirmAction.data);
        break;
      case 'demote':
        handleChangeRoleConfirmed(confirmAction.data, 'Officer');
        break;
      default:
        break;
    }
    setShowConfirmDialog(false);
  };

  const showConfirmationDialog = (type, data, message) => {
    setConfirmAction({ type, data });
    setShowConfirmDialog(true);
  };

  const handlePromoteToAdmin = (userId) => {
    showConfirmationDialog(
      'promote',
      userId,
      'Are you sure you want to promote this user to Admin? This will give them full administrative access.'
    );
  };

  const handleChangeRole = (userId, newRole) => {
    showConfirmationDialog(
      'demote',
      userId,
      'Are you sure you want to change this user\'s role to Officer? This will remove their administrative privileges.'
    );
  };

  const handleDeleteUser = (userId) => {
    showConfirmationDialog(
      'delete',
      userId,
      'Are you sure you want to delete this user? This action cannot be undone.'
    );
  };

  const handlePromoteToAdminConfirmed = async (userId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.put(
        `${API_BASE_URL}/user/promote-to-admin/${userId}`,
        null,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      console.log('Promote to Admin Response:', response.data);
      toast.success('User promoted to admin successfully');
      fetchData();
    } catch (error) {
      console.error('Promote to Admin Error:', error);
      toast.error(error.response?.data?.message || 'Failed to promote user to admin');
    }
  };

  const handleDeleteUserConfirmed = async (userId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.delete(`${API_BASE_URL}/User/delete/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Delete User Response:', response.data);
      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
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

  const handleViewCase = (caseId) => {
    setSelectedCaseId(caseId);
    setShowCaseModal(true);
  };

  const handleCloseCaseModal = () => {
    setShowCaseModal(false);
    setSelectedCaseId(null);
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
    <>
      <div className="admin-dashboard">
        <Container>
          <h1 className="admin-title">Admin Dashboard</h1>
          <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-4 custom-tabs">
            <Tab eventKey="cases" title="All Cases">
              <SearchBar onSearchResults={handleSearchResults} />
              <div className="cases-grid">
                {cases.map(caseItem => (
                  <Card key={caseItem.caseId} className="case-item">
                    <Card.Header>
                      <div className="case-header-content">
                        <h5>{caseItem.caseNumber}</h5>
                        <Dropdown align="end">
                          <Dropdown.Toggle variant="dark" size="sm">
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item 
                              onClick={() => handleViewCase(caseItem.caseId)}
                            >
                              View Details
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleApproveCase(caseItem.caseId)}
                              disabled={caseItem.isApproved}
                            >
                              {caseItem.isApproved ? 'Approved' : 'Approve'}
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <p><strong>Title:</strong> {caseItem.title}</p>
                      <p><strong>Status:</strong> {caseItem.status}</p>
                      <p><strong>Assigned To:</strong> {caseItem.assignedOfficerId || 'Unassigned'}</p>
                      <p><strong>Approval:</strong> {caseItem.isApproved ? 'Approved' : 'Pending'}</p>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Tab>
            
            <Tab eventKey="users" title="Users">
              <Button variant="dark" className="mb-3" onClick={() => setShowUserModal(true)}>
                Add New User
              </Button>
              <div className="users-grid">
                {users.map(user => (
                  <Card key={user.userID} className="user-item">
                    <Card.Header>
                      <div className="user-header-content">
                        <h5>{user.policeId}</h5>
                        <Dropdown align="end">
                          <Dropdown.Toggle variant="dark" size="sm">
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {user.role !== 'Admin' ? (
                              <Dropdown.Item
                                onClick={() => handlePromoteToAdmin(user.userID)}
                              >
                                Promote to Admin
                              </Dropdown.Item>
                            ) : (
                              <Dropdown.Item
                                onClick={() => handleChangeRole(user.userID, 'Officer')}
                              >
                                Change to Officer
                              </Dropdown.Item>
                            )}
                            <Dropdown.Item
                              onClick={() => handleDeleteUser(user.userID)}
                              className="text-danger"
                            >
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <p><strong>Name:</strong> {`${user.firstName} ${user.lastName}`}</p>
                      <p><strong>Role:</strong> {user.role}</p>
                      <p><strong>Department:</strong> {user.department}</p>
                    </Card.Body>
                  </Card>
                ))}
              </div>
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
                      <Card.Title>Pending Cases</Card.Title>
                      <Card.Text className="stat-number">{statistics.pendingCases}</Card.Text>
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
                      <Card.Title>Investigating</Card.Title>
                      <Card.Text className="stat-number">{statistics.investigatingCases}</Card.Text>
                    </Card.Body>
                  </Card>

                  <Card className="stat-card">
                    <Card.Body>
                      <Card.Title>Closed Cases</Card.Title>
                      <Card.Text className="stat-number">{statistics.closedCases}</Card.Text>
                    </Card.Body>
                  </Card>

                  <Card className="stat-card">
                    <Card.Body>
                      <Card.Title>Resolved Cases</Card.Title>
                      <Card.Text className="stat-number">{statistics.resolvedCases}</Card.Text>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </Tab>
          </Tabs>
        </Container>

        <CaseDetailsModal
          show={showCaseModal}
          handleClose={handleCloseCaseModal}
          caseId={selectedCaseId}
        />
      </div>

      <Modal show={showConfirmDialog} onHide={() => setShowConfirmDialog(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmAction.type === 'delete' && (
            <>
              <p className="mb-0">Are you sure you want to delete this user?</p>
              <p className="text-danger"><small>This action cannot be undone.</small></p>
            </>
          )}
          {confirmAction.type === 'promote' && (
            <>
              <p className="mb-0">Are you sure you want to promote this user to Admin?</p>
              <p className="text-muted"><small>This will give them full administrative access.</small></p>
            </>
          )}
          {confirmAction.type === 'demote' && (
            <>
              <p className="mb-0">Are you sure you want to change this user's role to Officer?</p>
              <p className="text-muted"><small>This will remove their administrative privileges.</small></p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant={confirmAction.type === 'delete' ? 'danger' : 'dark'}
            onClick={handleConfirmAction}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminDashboardPage;
