import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/signup.css';

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
    <Container className="signup-container" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "2rem", paddingTop: "5rem" }}>
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <div className="signup-form p-4 shadow-sm rounded" style={{ backgroundColor: "#ffffff" }}>
            <h2 className="text-center mb-4" style={{ color: "#343a40" }}>Police Department Sign-Up</h2>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Form onSubmit={handleSignup}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="formFirstName" className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control type="text" name="firstName" placeholder="Enter first name" required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formLastName" className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control type="text" name="lastName" placeholder="Enter last name" required />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formEmail" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" placeholder="Enter email" required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formPhone" className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="text" name="phone" placeholder="Enter phone number" required />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formPoliceId" className="mb-3">
                    <Form.Label>Police ID</Form.Label>
                    <Form.Control type="text" name="policeId" placeholder="Enter police ID" required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formDepartment" className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Control as="select" name="department" required>
                      <option>Crime</option>
                      <option>Homicide</option>
                      <option>Narcotics</option>
                      <option>Cybercrime</option>
                      {/* Add more departments as needed */}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formPasscode" className="mb-3">
                    <Form.Label>Passcode</Form.Label>
                    <Form.Control type="password" name="passcode" placeholder="Enter passcode" required />
                  </Form.Group>
                </Col>
              </Row>

              <Button variant="primary" type="submit" className="w-100" style={{ backgroundColor: "#343a40", borderColor: "#343a40" }} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Sign Up'}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SignupPage;
