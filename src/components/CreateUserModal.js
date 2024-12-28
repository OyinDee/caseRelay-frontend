import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const CreateUserModal = ({ show, handleClose, handleCreateUser, newUser, setNewUser }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreateUser(newUser);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formPoliceId">
            <Form.Label>Police ID</Form.Label>
            <Form.Control
              type="text"
              name="policeId"
              value={newUser.policeId}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={newUser.firstName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={newUser.lastName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formPhone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={newUser.phone}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formRole">
            <Form.Label>Role</Form.Label>
            <Form.Control
              as="select"
              name="role"
              value={newUser.role}
              onChange={handleChange}
              required
            >
              <option value="Officer">Officer</option>
              <option value="Admin">Admin</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formDepartment">
            <Form.Label>Department</Form.Label>
            <Form.Control
              as="select"
              name="department"
              value={newUser.department}
              onChange={handleChange}
              required
            >
              <option value="Homicide">Homicide</option>
              <option value="Narcotics">Narcotics</option>
              <option value="Cyber Crime">Cyber Crime</option>
              <option value="Traffic">Traffic</option>
              <option value="Internal Affairs">Internal Affairs</option>
              <option value="Fraud">Fraud</option>
              <option value="Special Victims Unit">Special Victims Unit</option>
              <option value="Patrol">Patrol</option>
              <option value="SWAT">SWAT</option>
              <option value="K-9 Unit">K-9 Unit</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formBadgeNumber">
            <Form.Label>Badge Number</Form.Label>
            <Form.Control
              type="text"
              name="badgeNumber"
              value={newUser.badgeNumber}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formRank">
            <Form.Label>Rank</Form.Label>
            <Form.Control
              as="select"
              name="rank"
              value={newUser.rank}
              onChange={handleChange}
              required
            >
              <option value="Officer">Officer</option>
              <option value="Detective">Detective</option>
              <option value="Sergeant">Sergeant</option>
              <option value="Lieutenant">Lieutenant</option>
              <option value="Captain">Captain</option>
              <option value="Chief">Chief</option>
              <option value="Deputy Chief">Deputy Chief</option>
              <option value="Inspector">Inspector</option>
              <option value="Commander">Commander</option>
              <option value="Deputy Inspector">Deputy Inspector</option>
              <option value="Deputy Commander">Deputy Commander</option>
            </Form.Control>
          </Form.Group>
          <Button variant="dark" type="submit" className="mt-3">
            Create User
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateUserModal;
