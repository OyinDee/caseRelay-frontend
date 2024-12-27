import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { ToastContainer, toast } from 'react-toastify';
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./css/Login.css";

const LoginPage = () => {
  const [policeId, setPoliceId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [rank, setRank] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("https://cr-bybsg3akhphkf3b6.canadacentral-01.azurewebsites.net/api/auth/login", {
        policeId,
        passcode,
        rank,
      });

      localStorage.setItem(
        "userDetails",
        JSON.stringify(response.data)
      );
      localStorage.setItem("jwtToken", token);

      toast.success("Login successful!");
      window.location.href = "/dashboard";
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "An error occurred during login.");
      } else {
        toast.error("Unable to connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("https://cr-bybsg3akhphkf3b6.canadacentral-01.azurewebsites.net/api/auth/forgot-password", {
        email: forgotPasswordEmail,
      });
      toast.success(response.data.message);
      setShowForgotPassword(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        toast.error(error.response.data.message || "Error while processing request.");
      } else {
        toast.error("Unable to connect to the server.");
      }
    }
  };

  return (
    <div className="login-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0 rounded-lg mt-5">
              <div className="card-header">
                <h3 className="text-center font-weight-light my-4">CaseRelay Login</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleLogin}>
                  <div className="form-floating mb-3">
                    <input
                      className="form-control"
                      id="inputPoliceId"
                      type="text"
                      placeholder="Enter your Police ID"
                      value={policeId}
                      onChange={(e) => setPoliceId(e.target.value)}
                      required
                    />
                    <label htmlFor="inputPoliceId">Police ID</label>
                  </div>
                  <div className="form-floating mb-3">
                    <input
                      className="form-control"
                      id="inputPasscode"
                      type="password"
                      placeholder="Enter your passcode"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      required
                    />
                    <label htmlFor="inputPasscode">Passcode</label>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
                    <button
                      className="btn btn-link text-decoration-none"
                      onClick={() => setShowForgotPassword(true)}
                      type="button"
                    >
                      Forgot Passcode?
                    </button>
                    <button
                      className="btn btn-dark w-50"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Login"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

{showForgotPassword && (
  <div className="modal fade show d-block" tabIndex="-1">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Forgot Passcode</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowForgotPassword(false)}
          ></button>
        </div>

        <div className="modal-body">
          <p className="text-muted mb-4 text-center">
            Enter your email address, and we’ll send instructions to reset your passcode.
          </p>
          <form onSubmit={handleForgotPasswordSubmit} className="d-flex flex-column">
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="forgotPasswordEmail"
                placeholder="Enter your email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
              />
              <label htmlFor="forgotPasswordEmail">Email Address</label>
            </div>

            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-dark"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowForgotPassword(false)}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default LoginPage;

