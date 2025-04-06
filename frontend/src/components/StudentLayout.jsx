import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar'; 

const StudentLayout = ({ onLogout }) => {
    const [studentInfo, setStudentInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudentInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/'); // Redirect to login if no token exists
                    return;
                }

                const response = await axios.get('/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setStudentInfo(response.data);
            } catch (err) {
                console.error('Error fetching student info:', err);
                if (err.response && err.response.status === 401) {
                    alert('Session expired. Please log in again.');
                    navigate('/'); // Redirect to login on unauthorized access
                } else {
                    alert('Failed to fetch student information.');
                }
            }
        };

        fetchStudentInfo();
    }, [navigate]);

    if (!studentInfo) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Navbar userType="student" onLogout={onLogout} /> {/* Include the Navbar component */}
            <div className="p-4">
                <Outlet /> {/* Render the nested routes */}
            </div>
        </div>
    );
};

export default StudentLayout;