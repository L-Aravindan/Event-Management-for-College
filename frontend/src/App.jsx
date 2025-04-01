import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // Import the Register component
import FacultyLayout from './components/FacultyLayout';
import StudentLayout from './components/StudentLayout'; // Import the StudentLayout component
import AdminLayout from './components/AdminLayout'; // Import the AdminLayout component
import AddEvents from './components/AddEvents';
import ApproveRequests from './components/ApproveRequests';
import AddMentoredStudents from './components/AddMentoredStudents';
import DisplayMentoredStudents from './components/DisplayMentoredStudents';
import DisplayEvents from './components/DisplayEvents';
import StudentDashboard from './components/StudentDashboard';
import ApprovalStatus from './components/ApprovalStatus';
import EventsParticipated from './components/EventsParticipated';
import StudentProfile from './components/StudentProfile'; // Import the StudentProfile component
import FacultyProfile from './components/FacultyProfile'; // Import the FacultyProfile component
import AdminDashboard from './components/AdminDashboard'; // Import the AdminDashboard component
import ViewStudents from './components/ViewStudents'; // Import the ViewStudents component
import ViewFaculties from './components/ViewFaculties'; // Import the ViewFaculties component
import EventDetail from './components/EventDetail'; // Import the EventDetail component
import FacultyEventDetail from './components/FacultyEventDetail'; // Import the FacultyEventDetail component
import AdminEventDetail from './components/AdminEventDetail'; // Import the AdminEventDetail component
import CalendarView from './components/CalendarView'; // Import the CalendarView component
import AdminAnalytics from './components/AdminAnalytics'; // Import the AdminAnalytics component
import StudentDetails from './components/StudentDetails';

const App = () => {
    const [userRole, setUserRole] = useState(null);

    // Check user role from token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            console.log('Decoded Token in App.js:', decoded); // Log the decoded token
            setUserRole(decoded.role);
        }
    }, []);

    // Update user role on login
    const handleLogin = (role) => {
        setUserRole(role);
    };

    // Clear user role on logout
    const handleLogout = () => {
        setUserRole(null);
    };

    // Protected Route Component
    const ProtectedRoute = ({ role, children }) => {
        if (userRole !== role) {
            console.log(`Access denied. Expected role: ${role}, Actual role: ${userRole}`);
            return <Navigate to="/" />;
        }
        return children;
    };

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect root to login */}
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} /> {/* Add Register route */}

                {/* Student Routes */}
                <Route
                    path="/student/*"
                    element={
                        <ProtectedRoute role="student">
                            <StudentLayout onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<StudentDashboard onLogout={handleLogout} />} />
                    <Route path="approval-status" element={<ApprovalStatus onLogout={handleLogout} />} />
                    <Route path="events-participated" element={<EventsParticipated onLogout={handleLogout} />} />
                    <Route path="profile" element={<StudentProfile onLogout={handleLogout} />} />
                    <Route path="event/:eventId" element={<EventDetail />} />
                    <Route path="calendar" element={<CalendarView />} />
                </Route>

                {/* Faculty Dashboard */}
                <Route
                    path="/faculty/*"
                    element={
                        <ProtectedRoute role="faculty">
                            <FacultyLayout onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                >
                    <Route path="add-events" element={<AddEvents onLogout={handleLogout} />} />
                    <Route path="approve-requests" element={<ApproveRequests onLogout={handleLogout} />} />
                    <Route path="add-mentored-students" element={<AddMentoredStudents onLogout={handleLogout} />} />
                    <Route path="display-mentored-students" element={<DisplayMentoredStudents onLogout={handleLogout} />} />
                    <Route path="display-events" element={<DisplayEvents onLogout={handleLogout} />} />
                    <Route path="profile" element={<FacultyProfile onLogout={handleLogout} />} /> {/* Add FacultyProfile route */}
                    <Route path="event/:eventId" element={<FacultyEventDetail />} /> {/* Add FacultyEventDetail route */}
                </Route>

                {/* Admin Dashboard */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminLayout onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<AdminDashboard onLogout={handleLogout} />} />
                    <Route path="view-students" element={<ViewStudents onLogout={handleLogout} />} />
                    <Route path="view-faculties" element={<ViewFaculties onLogout={handleLogout} />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="event/:eventId" element={<AdminEventDetail />} />
                    <Route path="calendar" element={<CalendarView />} />
                    <Route path="student/:studentId" element={<StudentDetails onLogout={handleLogout} />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;