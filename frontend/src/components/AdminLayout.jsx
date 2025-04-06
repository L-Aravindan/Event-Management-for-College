import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar'; 

const AdminLayout = ({ onLogout }) => {
    const [adminInfo, setAdminInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/'); // Redirect to login if no token exists
                    return;
                }

                const response = await axios.get('/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setAdminInfo(response.data);
            } catch (err) {
                console.error('Error fetching admin info:', err);
                if (err.response && err.response.status === 401) {
                    alert('Session expired. Please log in again.');
                    navigate('/'); // Redirect to login on unauthorized access
                } else {
                    alert('Failed to fetch admin information.');
                }
            }
        };

        fetchAdminInfo();
    }, [navigate]);

    if (!adminInfo) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Navbar userType="admin" onLogout={onLogout} /> {/* Include the Navbar component */}
            <div className="p-4">
                <Outlet /> {/* Render the nested routes */}
            </div>
        </div>
    );
};

export default AdminLayout;