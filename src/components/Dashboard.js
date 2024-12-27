import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../config/api';
import CaseDetailsModal from './CaseDetailsModal';
import SearchBar from './SearchBar';
import './css/Dashboard.css';

const DashboardPage = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [cases, setCases] = useState([]);
  const [expandedCases, setExpandedCases] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: '',
    role: '',
    department: '',
    badgeNumber: '',
    policeId: ''
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
    severity: '',
    assignedOfficerId: ''
  });
  const [isSearchResults, setIsSearchResults] = useState(false);
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
        setNewCase((prevNewCase) => ({
          ...prevNewCase,
          assignedOfficerId: parsedUserDetails.policeId
        }));
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
      const response = await axios.get('https://cr-bybsg3akhphkf3b6.canadacentral-01.azurewebsites.net/api/case/user', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      setCases(response.data);
      setIsLoading(false);
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          localStorage.removeItem('jwtToken');
          navigate('/login');
        } else {
          const message = err.response?.data?.message || 'Failed to fetch cases. Try again.';
          setError(message);
        }
      } else {
        setError('An unexpected error occurred');
      }
      setIsLoading(false);
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
    (activeTab === 'pending' && getPendingStatuses.includes(c.status)) ||
    (activeTab === 'closed' && getSolvedStatuses.includes(c.status))
  );

  const handleHandover = async (caseId) => {
    if (!caseId || !newOfficerId) {
      toast.error("Please provide a valid Case ID and Officer ID.");
      return;
    }
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.post(
        `https://cr-bybsg3akhphkf3b6.canadacentral-01.azurewebsites.net/api/case/handover/${caseId}`,
        { NewOfficerId: newOfficerId },
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success(response.data.message || 'Case handed over successfully.');
      setShowHandoverModal(false);
      fetchCases(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error handing over the case.');
    }
  };

  const handleSearchResults = (results) => {
    setCases(results);
    setIsSearchResults(true);
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...newCase,
        assignedOfficerId: String(userDetails.policeId)
      };
      await api.post('/case', data, {
        headers: { 'Content-Type': 'application/json' }
      });
      toast.success('Case created successfully!');
      setShowCreateCaseModal(false);
      fetchCases();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || 'Failed to create case');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="user-profile">
          <div className="avatar">{userDetails.name?.[0]?.toUpperCase() || 'O'}</div>
          <h3>{userDetails.name || 'Officer Dashboard'}</h3>
          <div className="user-details">
            <p>{userDetails.role || 'N/A'}</p>
            <p>{userDetails.department || 'N/A'}</p>
            <p>Badge #{userDetails.badgeNumber || 'N/A'}</p>
            <p>ID: {userDetails.policeId || 'N/A'}</p>
          </div>
        </div>
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Cases
          </button>
          <button 
            className={`tab-btn ${activeTab === 'closed' ? 'active' : ''}`}
            onClick={() => setActiveTab('closed')}
          >
            Solved Cases
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <SearchBar onSearchResults={handleSearchResults} />
          <button className="create-btn" onClick={() => setShowCreateCaseModal(true)}>
            + New Case
          </button>
        </header>

        {isLoading ? (
          <div className="loader">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="cases-grid">
            {filteredCases.map((caseItem) => (
              <div key={caseItem.caseId} className="case-card">
                <div className="case-header" onClick={() => toggleCase(caseItem.caseId)}>
                  <h3>{caseItem.title}</h3>
                  <span className={`status-badge ${caseItem.status.toLowerCase()}`}>
                    {caseItem.status}
                  </span>
                </div>
                <div className={`case-content ${expandedCases[caseItem.caseId] ? 'expanded' : ''}`}>
                  <p className="case-number">Case #{caseItem.caseNumber}</p>
                  <p className="case-description">{caseItem.description}</p>
                  <div className="case-meta">
                    <span className="meta-item">
                      <label>Category:</label> {caseItem.category}
                    </span>
                    <span className="meta-item">
                      <label>Severity:</label> {caseItem.severity}
                    </span>
                    <span className="meta-item">
                      <label>Reported:</label> {new Date(caseItem.reportedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!isSearchResults && (
                    <div className="case-actions">
                      <button onClick={() => handleViewCase(caseItem.caseId)}>
                        View Details
                      </button>
                      <button onClick={() => {
                        setSelectedCaseId(caseItem.caseId);
                        setShowHandoverModal(true);
                      }}>
                        Handover Case
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CaseDetailsModal
        show={showCaseModal}
        handleClose={handleCloseCaseModal}
        caseId={selectedCaseId}
      />

      {showHandoverModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Handover Case</h2>
              <button className="close-btn" onClick={() => setShowHandoverModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="disclaimer">Handover will transfer the case to another officer. Ensure the provided Officer ID is correct.</p>
              <form onSubmit={(e) => { e.preventDefault(); handleHandover(selectedCaseId); }}>
                <div className="form-group">
                  <label>New Officer ID</label>
                  <input
                    type="text"
                    value={newOfficerId}
                    onChange={(e) => setNewOfficerId(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn">Handover</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCreateCaseModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Case</h2>
              <button className="close-btn" onClick={() => setShowCreateCaseModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateCase}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newCase.title}
                    onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={newCase.description}
                    onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newCase.category}
                    onChange={(e) => setNewCase({...newCase, category: e.target.value})}
                    required
                  >
                    <option value="">Select category...</option>
                    <option value="Theft">Theft</option>
                    <option value="Assault">Assault</option>
                    <option value="Fraud">Fraud</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Severity</label>
                  <select
                    value={newCase.severity}
                    onChange={(e) => setNewCase({...newCase, severity: e.target.value})}
                    required
                  >
                    <option value="">Select severity...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <button type="submit" className="submit-btn">Create Case</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 
