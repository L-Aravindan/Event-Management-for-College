import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Only import components used for layout/routing/auth
import FacultyLayout from './components/FacultyLayout';
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy load all other components
const AddEvents = React.lazy(() => import('./components/AddEvents'));
const ApproveRequests = React.lazy(() => import('./components/ApproveRequests'));
const AddMentoredStudents = React.lazy(() => import('./components/AddMentoredStudents'));
const DisplayMentoredStudents = React.lazy(() => import('./components/DisplayMentoredStudents'));
const DisplayEvents = React.lazy(() => import('./components/DisplayEvents'));
const StudentDashboard = React.lazy(() => import('./components/StudentDashboard'));
const ApprovalStatus = React.lazy(() => import('./components/ApprovalStatus'));
const EventsParticipated = React.lazy(() => import('./components/EventsParticipated'));
const StudentProfile = React.lazy(() => import('./components/StudentProfile'));
const FacultyProfile = React.lazy(() => import('./components/FacultyProfile'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const ViewStudents = React.lazy(() => import('./components/ViewStudents'));
const ViewFaculties = React.lazy(() => import('./components/ViewFaculties'));
const EventDetail = React.lazy(() => import('./components/EventDetail'));
const FacultyEventDetail = React.lazy(() => import('./components/FacultyEventDetail'));
const AdminEventDetail = React.lazy(() => import('./components/AdminEventDetail'));
const CalendarView = React.lazy(() => import('./components/CalendarView'));
const AdminAnalytics = React.lazy(() => import('./components/AdminAnalytics'));
const StudentDetails = React.lazy(() => import('./components/StudentDetails'));

// Loading fallback component
const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black/50 p-8 rounded-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
            <p className="text-white font-medium">Loading...</p>
        </div>
    </div>
);

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
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/register" element={<Register />} />

                    {/* Student Routes */}
                    <Route
                        path="/student/*"
                        element={
                            <ProtectedRoute role="student">
                                <StudentLayout onLogout={handleLogout} />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <StudentDashboard onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="approval-status" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <ApprovalStatus onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="events-participated" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <EventsParticipated onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="profile" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <StudentProfile onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="event/:eventId" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <EventDetail />
                            </Suspense>
                        } />
                        <Route path="calendar" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <CalendarView />
                            </Suspense>
                        } />
                    </Route>

                    {/* Faculty Routes */}
                    <Route
                        path="/faculty/*"
                        element={
                            <ProtectedRoute role="faculty">
                                <FacultyLayout onLogout={handleLogout} />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="add-events" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <AddEvents onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="approve-requests" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <ApproveRequests onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="add-mentored-students" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <AddMentoredStudents onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="display-mentored-students" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <DisplayMentoredStudents onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="display-events" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <DisplayEvents onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="profile" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <FacultyProfile onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="event/:eventId" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <FacultyEventDetail />
                            </Suspense>
                        } />
                    </Route>

                    {/* Admin Routes */}
                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute role="admin">
                                <AdminLayout onLogout={handleLogout} />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <AdminDashboard onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="view-students" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <ViewStudents onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="view-faculties" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <ViewFaculties onLogout={handleLogout} />
                            </Suspense>
                        } />
                        <Route path="analytics" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <AdminAnalytics />
                            </Suspense>
                        } />
                        <Route path="event/:eventId" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <AdminEventDetail />
                            </Suspense>
                        } />
                        <Route path="calendar" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <CalendarView />
                            </Suspense>
                        } />
                        <Route path="student/:studentId" element={
                            <Suspense fallback={<LoadingFallback />}>
                                <StudentDetails onLogout={handleLogout} />
                            </Suspense>
                        } />
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    );
};

export default App;