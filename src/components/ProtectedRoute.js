import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedAdminRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('jwtToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          'https://caserelay-hmaah2bddygjcgbn.canadacentral-01.azurewebsites.net/api/User/profile',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setIsAdmin(response.data.role === 'Admin');
        setIsLoading(false);
      } catch (error) {
        console.error('Error verifying admin status:', error);
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

export default ProtectedAdminRoute;
