import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/Login.css';

const LoginPage = () => {
  const [policeId, setPoliceId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.post('http://localhost:5299/api/auth/login', {
        policeId,
        passcode,
      });

      const { token } = response.data;
      localStorage.setItem('jwtToken', token);

      navigate('/dashboard');
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response?.data) {
        setErrorMessage(error.response.data.message || 'An error occurred during login.');
      } else {
        setErrorMessage('Unable to connect to the server. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 bg-light d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0 rounded-lg login-card">
              <div className="card-header text-white text-center">
                <h3 className="my-2">CaseRelay Login</h3>
              </div>
              <div className="card-body">
                {/* Error Message */}
                {errorMessage && (
                  <div className="alert alert-danger text-center" role="alert">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  {/* Police ID Input */}
                  <div className="mb-3">
                    <label htmlFor="policeId" className="form-label">Police ID</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person-fill"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="policeId"
                        placeholder="Enter Police ID"
                        value={policeId}
                        onChange={(e) => setPoliceId(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Passcode Input */}
                  <div className="mb-3">
                    <label htmlFor="passcode" className="form-label">Passcode</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="passcode"
                        placeholder="Enter Passcode"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Login Button */}
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn login-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Loading...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Card Footer */}
              <div className="card-footer text-center">
                <a href="#" className="text-decoration-none forgot-password">Forgot Passcode?</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;