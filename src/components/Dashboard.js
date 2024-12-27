import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../config/api';
import CaseDetailsModal from './CaseDetailsModal';
import SearchBar from './SearchBar';
import './css/Dashboard.css';

const DashboardPage = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: '', role: '', department: '', badgeNumber: '', policeId: ''
  });
  const [newOfficerId, setNewOfficerId] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showCreateCaseModal, setShowCreateCaseModal] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '', description: '', category: '', severity: '', assignedOfficerId: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      const parsedUserDetails = JSON.parse(storedUserDetails);
      setUserDetails(parsedUserDetails);
      setNewCase(prev => ({ ...prev, assignedOfficerId: parsedUserDetails.policeId }));
    }
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await api.get('/case/user');
      setCases(response.data);
    } catch (error) {
      setError('Failed to fetch cases');
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHandover = async (caseId) => {
    try {
      await api.post(`/case/handover/${caseId}`, { NewOfficerId: newOfficerId });
      toast.success('Case handed over successfully');
      setShowHandoverModal(false);
      fetchCases();
    } catch (error) {
      toast.error('Failed to handover case');
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      await api.post('/case', { ...newCase, assignedOfficerId: userDetails.policeId });
      toast.success('Case created successfully');
      setShowCreateCaseModal(false);
      fetchCases();
    } catch (error) {
      toast.error('Failed to create case');
    }
  };

  const filteredCases = cases.filter(c => 
    activeTab === 'pending' ? 
      ['Pending', 'Open', 'Investigating'].includes(c.status) : 
      ['Closed', 'Resolved'].includes(c.status)
  );

  return (
    <div className="dashboard">
      <header className="header">
        <div className="user-info">
          <span className="user-name">{userDetails.name}</span>
          <span className="user-role">{userDetails.role}</span>
        </div>
        <div className="tabs">
          <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('pending')}>Pending</button>
          <button className={`tab ${activeTab === 'closed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('closed')}>Closed</button>
        </div>
      </header>

      <main className="main">
        <div className="actions">
          <SearchBar onSearchResults={setCases} />
          <button className="new-case" onClick={() => setShowCreateCaseModal(true)}>New Case</button>
        </div>

        <div className="cases">
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : filteredCases.map(caseItem => (
            <div key={caseItem.caseId} className="case">
              <div className="case-header">
                <h3>{caseItem.title}</h3>
                <span className="status">{caseItem.status}</span>
              </div>
              <div className="case-body">
                <p>{caseItem.description}</p>
                <div className="meta">
                  <span>{caseItem.category}</span>
                  <span>{caseItem.severity}</span>
                  <span>{new Date(caseItem.reportedAt).toLocaleDateString()}</span>
                </div>
                <div className="actions">
                  <button onClick={() => {
                    setSelectedCaseId(caseItem.caseId);
                    setShowCaseModal(true);
                  }}>Details</button>
                  <button onClick={() => {
                    setSelectedCaseId(caseItem.caseId);
                    setShowHandoverModal(true);
                  }}>Handover</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showHandoverModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Handover Case</h2>
            <input
              type="text"
              placeholder="New Officer ID"
              value={newOfficerId}
              onChange={e => setNewOfficerId(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => handleHandover(selectedCaseId)}>Confirm</button>
              <button onClick={() => setShowHandoverModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCreateCaseModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>New Case</h2>
            <form onSubmit={handleCreateCase}>
              <input
                type="text"
                placeholder="Title"
                value={newCase.title}
                onChange={e => setNewCase({...newCase, title: e.target.value})}
              />
              <textarea
                placeholder="Description"
                value={newCase.description}
                onChange={e => setNewCase({...newCase, description: e.target.value})}
              />
              <select value={newCase.category} 
                      onChange={e => setNewCase({...newCase, category: e.target.value})}>
                <option value="">Select Category</option>
                <option>Theft</option>
                <option>Assault</option>
                <option>Fraud</option>
                <option>Other</option>
              </select>
              <select value={newCase.severity}
                      onChange={e => setNewCase({...newCase, severity: e.target.value})}>
                <option value="">Select Severity</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
              <div className="modal-actions">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowCreateCaseModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CaseDetailsModal
        show={showCaseModal}
        handleClose={() => setShowCaseModal(false)}
        caseId={selectedCaseId}
      />
    </div>
  );
};

export default DashboardPage;
