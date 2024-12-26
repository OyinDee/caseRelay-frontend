import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";  // Import useNavigate hook
import Spinner from 'react-bootstrap/Spinner';   // Import spinner component from react-bootstrap

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState(""); // Add email state
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);  // Loader state
  const navigate = useNavigate();  // Initialize navigate hook

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);  // Show loader

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setIsLoading(false);  // Hide loader
      return;
    }

    try {
      const resetToken = new URLSearchParams(window.location.search).get("token");
      if (!resetToken) {
        setErrorMessage("Invalid or missing reset token.");
        setIsLoading(false);  // Hide loader
        return;
      }

      // Send request to reset password
      const response = await axios.post("https://cr-bybsg3akhphkf3b6.canadacentral-01.azurewebsites.net/api/auth/reset-password", {
        Email: email,  // Include email here
        ResetToken: resetToken,  // Include reset token here
        NewPasscode: newPassword  // New password (passcode)
      });

      setSuccessMessage(response.data.message || "Password reset successful.");
      setIsLoading(false);  // Hide loader

      // Navigate to login page after reset is successful
      navigate('/login');  
    } catch (error) {
      setIsLoading(false);  // Hide loader
      if (axios.isAxiosError(error) && error.response?.data) {
        setErrorMessage(error.response.data.message || "An error occurred.");
      } else {
        setErrorMessage("Unable to connect to the server.");
      }
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "white", color: "black" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card border-dark shadow-sm">
              <div className="card-header text-center bg-white border-dark">
                <h3 className="my-2">Reset Password</h3>
              </div>
              <div className="card-body">
                {errorMessage && (
                  <div className="alert alert-danger text-center" role="alert">
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div className="alert alert-success text-center" role="alert">
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control border-dark"
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control border-dark"
                      id="newPassword"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="form-control border-dark"
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn btn-dark" disabled={isLoading}>
                      {isLoading ? (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
