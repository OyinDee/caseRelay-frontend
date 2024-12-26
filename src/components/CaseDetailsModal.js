import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Spinner, Alert, Table, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import jsPDF from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import { api } from '../config/api';

const CaseDetailsModal = ({ caseId, show, handleClose }) => {  // Changed onHide to handleClose
  const [isUploading, setIsUploading] = useState(false);
  const [caseDetails, setCaseDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [caseStatus, setCaseStatus] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');

  useEffect(() => {
    if (show && caseId) {
      fetchCaseDetails();
    }
  }, [show, caseId]);

  const fetchCaseDetails = async () => {
    setIsLoading(true);
    try {
      const [detailsResponse, extrasResponse] = await Promise.all([
        api.get(`/case/${caseId}`),
        api.get(`/case/${caseId}/extras`)
      ]);
      
      setCaseDetails(detailsResponse.data);
      setComments(extrasResponse.data.comments || []);
      setDocuments(extrasResponse.data.documents || []);
      setCaseStatus(detailsResponse.data.status);
      setAssignedOfficer(detailsResponse.data.assignedOfficerId);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Failed to fetch case details');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    const jwtToken = localStorage.getItem('jwtToken');
    const currentTime = new Date().toISOString();

    const newCommentData = {
      commentText: newComment,
      authorId: (JSON.parse(localStorage.userDetails)).name,
      createdAt: currentTime,
    };

    try {
      await axios.post(
        `https://cr-bybsg3akhphkf3b6.canadacentral-01.azurewebsites.net/api/case/${caseId}/comment`,
        newCommentData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      toast.success('Comment added successfully');
      setComments([...comments, newCommentData]);
      setNewComment('');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    const jwtToken = localStorage.getItem('jwtToken');
    const formData = new FormData();
    formData.append('file', selectedFile);

    setIsUploading(true);
    try {
      await axios.post(`https://cr-bybsg3akhphkf3b6.canadacentral-01.azurewebsites.net/api/case/${caseId}/document`, formData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      await fetchCaseDetails();
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.message || 'Failed to upload document');
      } else {
        toast.error('Failed to upload document');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const exportCaseReport = () => {
    if (!caseDetails) return;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const lineHeight = 7;

    // Set up document properties
    doc.setFont('helvetica', 'normal');

    // Function to draw header
    const drawHeader = () => {
        // Company/Organization header (placeholder)
        doc.setFontSize(10);
        doc.text('OFFICIAL CASE REPORT', margin, 15, { align: 'left' });
        
        // Horizontal line
        doc.setLineWidth(0.5);
        doc.line(margin, 20, pageWidth - margin, 20);
    };

    // Function to add a line of text
    const addLine = (text, y, options = {}) => {
        const {
            fontSize = 11,
            align = 'left',
            style = 'normal'
        } = options;

        doc.setFontSize(fontSize);
        doc.setFont('helvetica', style);
        doc.text(text, align === 'left' ? margin : pageWidth - margin, y, { align });
    };

    // Function to add a section
    const addSection = (title, content, startY, options = {}) => {
        const { 
            titleFontSize = 12, 
            contentFontSize = 11 
        } = options;

        // Add section title
        addLine(title, startY, { 
            fontSize: titleFontSize, 
            style: 'bold' 
        });
        let currentY = startY + lineHeight;

        // Add content lines
        content.forEach(item => {
            if (!item) return; // Skip empty items
            const lines = doc.splitTextToSize(item, pageWidth - (2 * margin));
            lines.forEach(line => {
                addLine(line, currentY, { fontSize: contentFontSize });
                currentY += lineHeight;
            });
        });

        return currentY + lineHeight;
    };

    // Function to add footer
    const addFooter = (exporterName) => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Page number
            doc.setFontSize(10);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - margin, { align: 'center' });
            
            // Horizontal line
            doc.setLineWidth(0.5);
            doc.line(margin, pageHeight - (margin + 10), pageWidth - margin, pageHeight - (margin + 10));
            
            // Exported by
            if (i === pageCount) {
                doc.text(`Exported by: ${exporterName}`, margin, pageHeight - margin, { align: 'left' });
            }
        }
    };

    // Start PDF generation
    drawHeader();

    // Case Information Section
    let yPosition = addSection('Case Information', [
        `Case Number: ${caseDetails.caseNumber}`,
        `Title: ${caseDetails.title}`,
        `Description: ${caseDetails.description}`,
        `Category: ${caseDetails.category}`,
        `Severity: ${caseDetails.severity}`,
        `Status: ${caseDetails.status}`,
        `Reported At: ${new Date(caseDetails.reportedAt).toLocaleString()}`,
        caseDetails.resolvedAt ? `Resolved At: ${new Date(caseDetails.resolvedAt).toLocaleString()}` : ''
    ], 30);

    // Comments Section
    yPosition = addSection('Comments', comments.map((comment, index) => 
        `${index + 1}. ${comment.commentText} (By: ${comment.authorId} at ${new Date(comment.createdAt).toLocaleString()})`
    ), yPosition);

    // Documents Section
    yPosition = addSection('Attached Documents', documents.map((doc, index) => 
        `${index + 1}. ${doc.fileUrl} (Uploaded at: ${new Date(doc.uploadedAt).toLocaleString()})`
    ), yPosition);

    // Add footer with exporter name
    const exporterName = JSON.parse(localStorage.userDetails).name;
    addFooter(exporterName);

    // Save the document
    doc.save(`Case_${caseDetails.caseNumber}_Report.pdf`);
};
  
  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.patch(`/case/${caseId}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchCaseDetails();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignOfficer = async (officerId) => {
    try {
      await api.patch(`/case/${caseId}/assign`, { officerId });
      toast.success('Case assigned successfully');
      fetchCaseDetails();
    } catch (error) {
      toast.error('Failed to assign case');
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}  // Changed from onHide to handleClose
      size="lg" 
      centered
      scrollable  // Add this to make modal content scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>Case Details: {caseDetails?.caseNumber}</Modal.Title>
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
                              variant="outline-dark"
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

                <div className="mt-3">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
            <Button
              variant="dark"
              onClick={handleFileUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="mr-2"
                  />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </Button>

                </div>
              </Card.Body>
            </Card>

            <Form.Select
              value={caseStatus}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="mb-3"
            >
              <option value="Pending">Pending</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Closed">Closed</option>
              <option value="Resolved">Resolved</option>
            </Form.Select>

          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>  // Changed from onHide
          Close
        </Button>
        <Button variant="dark" onClick={exportCaseReport}>
          Export Case Report
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CaseDetailsModal;
