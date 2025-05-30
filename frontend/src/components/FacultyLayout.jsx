import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar'; // Import the Navbar component

const FacultyLayout = ({ onLogout }) => {
    const [facultyInfo, setFacultyInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFacultyInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/'); // Redirect to login if no token exists
                    return;
                }

                const response = await axios.get('/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setFacultyInfo(response.data);
            } catch (err) {
                console.error('Error fetching faculty info:', err);
                if (err.response && err.response.status === 401) {
                    alert('Session expired. Please log in again.');
                    navigate('/'); // Redirect to login on unauthorized access
                } else {
                    alert('Failed to fetch faculty information.');
                }
            }
        };

        fetchFacultyInfo();
    }, [navigate]);

    if (!facultyInfo) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Navbar userType="faculty" onLogout={onLogout} /> {/* Include the Navbar component */}
            <div className="p-4">
                <Outlet /> {/* Render the nested routes */}
            </div>
        </div>
    );
};

export default FacultyLayout;