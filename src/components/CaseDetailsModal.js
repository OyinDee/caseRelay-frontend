import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Spinner, Alert, Table } from 'react-bootstrap';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';

const CaseDetailsModal = ({ caseId, show, onHide }) => {
  const [caseDetails, setCaseDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (show && caseId) {
      fetchCaseDetails();
    }
  }, [show, caseId]);

  const fetchCaseDetails = async () => {
    setIsLoading(true);
    const jwtToken = localStorage.getItem('jwtToken');

    try {
      const caseResponse = await axios.get(`http://localhost:5299/api/case/${caseId}/extras`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setCaseDetails(caseResponse.data);

      // const commentsResponse = await axios.get(`http://localhost:5299/api/case/${caseId}/comments`, {
      //   headers: {
      //     Authorization: `Bearer ${jwtToken}`,
      //   },
      // });
      // setComments(commentsResponse.data);

      const caseData = await axios.get(`http://localhost:5299/api/case/${caseId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      console.log(caseData)
      setComments(caseData.data.comments);

      setDocuments(caseData.data.documents || []);
      setIsLoading(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("AxiosError:", err.toJSON());
      } else {
        console.error("Unexpected error:", err);
      }
      setError(err.response?.data?.message || "Failed to fetch case details");
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    const jwtToken = localStorage.getItem('jwtToken');
    const currentTime = new Date().toISOString();

    const newCommentData = {
      commentText: newComment,
      authorId: (JSON.parse(localStorage.userDetails)).name,
      createdAt: currentTime
    };

    try {
      const response = await axios.post(
        `http://localhost:5299/api/case/${caseId}/comment`,
        newCommentData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      setComments([...comments, newCommentData]);
      setNewComment('');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("AxiosError:", err.toJSON());
      } else {
        console.error("Unexpected error:", err);
      }
      setError(err.response?.data?.message || "Failed to add comment");
    }
  };

  const exportCaseReport = () => {
    if (!caseDetails) return;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Case Report: ${caseDetails.caseNumber}`, 10, 20);

    doc.setFontSize(12);
    let yPosition = 30;
    const addLine = (text) => {
      doc.text(text, 10, yPosition);
      yPosition += 10;
    };

    addLine(`Title: ${caseDetails.title}`);
    addLine(`Description: ${caseDetails.description}`);
    addLine(`Category: ${caseDetails.category}`);
    addLine(`Severity: ${caseDetails.severity}`);
    addLine(`Status: ${caseDetails.status}`);
    addLine(`Reported At: ${new Date(caseDetails.reportedAt).toLocaleString()}`);
    
    if (caseDetails.resolvedAt) {
      addLine(`Resolved At: ${new Date(caseDetails.resolvedAt).toLocaleString()}`);
    }

    yPosition += 10;
    doc.setFontSize(14);
    doc.text('Comments', 10, yPosition);
    yPosition += 10;
    doc.setFontSize(12);

    comments.forEach((comment, index) => {
      addLine(`Comment ${index + 1}: ${comment.commentText}`);
      addLine(`By: ${comment.authorId} at ${new Date(comment.createdAt).toLocaleString()}`);
      yPosition += 5;
    });

    doc.save(`Case_${caseDetails.caseNumber}_Report.pdf`);
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      aria-labelledby="case-details-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="case-details-modal">
          Case Details: {caseDetails?.caseNumber}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {isLoading ? (
          <div className="text-center">
            <Spinner animation="border" variant="dark" />
            <p>Loading case details...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            <Card className="mb-3">
              <Card.Header>Case Information</Card.Header>
              <Card.Body>
                <p><strong>Title:</strong> {caseDetails.title}</p>
                <p><strong>Description:</strong> {caseDetails.description}</p>
                <p><strong>Category:</strong> {caseDetails.category}</p>
                <p><strong>Severity:</strong> {caseDetails.severity}</p>
                <p><strong>Status:</strong> {caseDetails.status}</p>
                <p><strong>Reported At:</strong> {new Date(caseDetails.reportedAt).toLocaleString()}</p>
                {caseDetails.resolvedAt && (
                  <p><strong>Resolved At:</strong> {new Date(caseDetails.resolvedAt).toLocaleString()}</p>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>Comments</Card.Header>
              <Card.Body>
                {comments.length === 0 ? (
                  <p className="text-muted">No comments yet</p>
                ) : (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Author</th>
                        <th>Comment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comments.map((comment, index) => (
                        <tr key={index}>
                          <td>{comment.authorId}</td>
                          <td>{comment.commentText}</td>
                          <td>{new Date(comment.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                <div className="mt-3">
                  <h6>Add a Comment</h6>
                  <div className="d-flex">
                    <input 
                      type="text" 
                      className="form-control mr-2" 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Enter your comment"
                    />
                    <Button 
                      variant="dark" 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="ml-2"
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>Attached Documents</Card.Header>
              <Card.Body>
                {documents.length === 0 ? (
                  <p className="text-muted">No documents attached</p>
                ) : (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Uploaded At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc, index) => (
                        <tr key={doc.fileUrl + index}>
                          <td>{doc.fileName}</td>
                          <td>{new Date(doc.uploadedAt).toLocaleString()}</td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button 
          variant="primary" 
          onClick={exportCaseReport}
          disabled={isLoading || error}
        >
          Export Case Report
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CaseDetailsModal;
