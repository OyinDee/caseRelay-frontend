import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const formData = new FormData(event.target);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      policeId: formData.get('policeId'),
      department: formData.get('department'),
      badgeNumber: formData.get('badgeNumber'),
      rank: formData.get('rank'),
      role: 'Officer',
      passcode: formData.get('passcode'),
    };

    try {
      const response = await axios.post('http://localhost:5299/api/auth/register', data);
      setLoading(false);
      navigate('/login');
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response?.data) {
        setErrorMessage(error.response.data.message || 'An error occurred during signup.');
      } else {
        setErrorMessage('Unable to connect to the server. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="w-100 mt-4" style={{ maxWidth: "500px" }}>
        <div className="border p-4 rounded shadow-sm">
          <h2 className="text-center mb-4">Police Department Sign-Up</h2>
          
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          
          <Form onSubmit={handleSignup}>
            <div className="mb-3">
              <Row>
                <Col>
                  <Form.Group controlId="formFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control type="text" name="firstName" placeholder="First name" required />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formLastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control type="text" name="lastName" placeholder="Last name" required />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="mb-3">
              <Row>
                <Col>
                  <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" placeholder="Email address" required />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formPhone">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="tel" name="phone" placeholder="Phone number" required />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="mb-3">
              <Row>
                <Col>
                  <Form.Group controlId="formPoliceId">
                    <Form.Label>Police ID</Form.Label>
                    <Form.Control type="text" name="policeId" placeholder="Police ID" required />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formDepartment">
                    <Form.Label>Department</Form.Label>
                    <Form.Control as="select" name="department" required>
                      <option value="">Select Department</option>
                      <option>Crime</option>
                      <option>Homicide</option>
                      <option>Narcotics</option>
                      <option>Cybercrime</option>
                      <option>Fraud</option>
                      <option>Traffic</option>
                      <option>Forensics</option>
                      <option>Intelligence</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="mb-3">
              <Row>
                <Col>
                  <Form.Group controlId="formBadgeNumber">
                    <Form.Label>Badge Number</Form.Label>
                    <Form.Control type="text" name="badgeNumber" placeholder="Badge number" required />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formRank">
                    <Form.Label>Rank</Form.Label>
                    <Form.Control type="text" name="rank" placeholder="Rank" required />
                  </Form.Group>
                </Col>
              </Row>
            </div>
            <div className="mb-3">
              <Row>
                <Col>
                  <Form.Group controlId="formPasscode">
                    <Form.Label>Passcode</Form.Label>
                    <Form.Control type="password" name="passcode" placeholder="Create passcode" required />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <Button 
              variant="dark" 
              type="submit" 
              className="w-100 mt-3" 
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : 'Sign Up'}
            </Button>
          </Form>
        </div>
      </div>
    </Container>
  );
};

export default SignupPage;