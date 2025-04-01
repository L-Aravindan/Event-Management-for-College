import React from 'react';
import { Navigate } from 'react-router-dom';
import { setAuthToken } from '../services/api';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Redirect to login if no token is found
        return <Navigate to="/login" />;
    }

    // Set token in Axios headers
    setAuthToken(token);

    return children;
};

export default PrivateRoute;