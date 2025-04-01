import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';
import { useNavigate } from 'react-router-dom';

const ViewStudents = ({ onLogout }) => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchRegisterNumber, setSearchRegisterNumber] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await apiClient.get('/admin/users');
                const studentList = response.data.filter(user => user.role === 'student');
                setStudents(studentList);
                setFilteredStudents(studentList);
            } catch (err) {
                console.error('Error fetching students:', err);
                alert('Failed to fetch students');
            }
        };
        fetchStudents();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchRegisterNumber) {
            const filtered = students.filter(student => 
                student.registerNumber?.toString().includes(searchRegisterNumber)
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(students);
        }
    };

    const clearSearch = () => {
        setSearchRegisterNumber('');
        setFilteredStudents(students);
    };

    const handleDelete = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in to delete a student.');
                return;
            }
            await apiClient.delete(`/admin/users/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Student deleted successfully');
            setStudents(students.filter(student => student._id !== studentId));
        } catch (err) {
            console.error('Error deleting student:', err);
            alert('Failed to delete student');
        }
    };

    const handlePendingRequests = async (studentId) => {
        try {
            const response = await apiClient.get(`/admin/users/${studentId}/event-requests`);
            setPendingRequests(response.data);
            setSelectedStudent(studentId);
        } catch (err) {
            console.error('Error fetching pending requests:', err);
            alert('Failed to fetch pending requests');
        }
    };

    const handleRequestAction = async (eventId, action) => {
        try {
            // Convert action to match backend expected values
            const status = action === 'accepted' ? 'approved' : action;
            
            await apiClient.put(`/admin/users/${selectedStudent}/event-requests/${eventId}`, { 
                status: status
            });
            alert(`Request ${action}ed successfully`);
            
            // Refresh the pending requests after action
            const response = await apiClient.get(`/admin/users/${selectedStudent}/event-requests`);
            setPendingRequests(response.data);
        } catch (err) {
            console.error(`Error ${action}ing request:`, err);
            alert(`Failed to ${action} request`);
        }
    };

    const isEventExpired = (eventDate, eventTime) => {
        try {
            const [hours, minutes] = eventTime.split(':');
            const eventDateTime = new Date(eventDate);
            eventDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
            const currentDateTime = new Date();
            return currentDateTime > eventDateTime;
        } catch (error) {
            console.error('Error checking event expiry:', error);
            return false;
        }
    };

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-hidden transform-gpu">
            <div className="max-w-7xl mx-auto bg-black/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 sm:p-6 md:p-8 animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
                    View Students
                </h2>

                {/* Search Container */}
                <div className="mb-6">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Search by Register Number..."
                            value={searchRegisterNumber}
                            onChange={(e) => setSearchRegisterNumber(e.target.value)}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-white rounded-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            Search
                        </button>
                        {searchRegisterNumber && (
                            <button
                                onClick={clearSearch}
                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Students List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-xl text-white font-semibold mb-4">Students List</h3>
                        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 pr-2">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student._id}
                                    className="bg-white/10 rounded-lg p-4 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white font-medium">{student.name}</p>
                                            <p className="text-white/60 text-sm">Register: {student.registerNumber}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePendingRequests(student._id);
                                                }}
                                                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm transition-all duration-300"
                                            >
                                                View Requests
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/admin/student/${student._id}`);
                                                }}
                                                className="px-3 py-1 bg-accent/20 hover:bg-accent/30 text-white/80 rounded-lg text-sm transition-all duration-300"
                                            >
                                                View Details →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Requests Section */}
                    <div className="lg:col-span-2">
                        {selectedStudent ? (
                            <div className="space-y-4">
                                <h3 className="text-xl text-white font-semibold">
                                    Pending Requests
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                                    {pendingRequests.length > 0 ? (
                                        pendingRequests.map((request) => {
                                            const expired = isEventExpired(request.date, request.time);
                                            return (
                                                <div 
                                                    key={request.eventId}
                                                    className="bg-white/10 rounded-lg p-4 border border-white/10 transition-all duration-300"
                                                >
                                                    <h4 className="text-white font-medium mb-2">{request.eventName}</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <p className="flex justify-between">
                                                            <span className="text-white/60">Date:</span>
                                                            <span className="text-white">
                                                                {new Date(request.date).toLocaleDateString('en-GB')}
                                                            </span>
                                                        </p>
                                                        <p className="flex justify-between">
                                                            <span className="text-white/60">Status:</span>
                                                            <span className={`
                                                                ${request.status === 'pending' ? 'text-yellow-300' : ''}
                                                                ${request.status === 'approved' ? 'text-green-300' : ''}
                                                                ${request.status === 'rejected' ? 'text-red-300' : ''}
                                                            `}>
                                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    {!expired && (
                                                        <div className="flex gap-3 mt-4">
                                                            <button
                                                                onClick={() => handleRequestAction(request.eventId, 'approved')}
                                                                className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-white rounded-lg transition-all duration-300 hover:-translate-y-1"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRequestAction(request.eventId, 'rejected')}
                                                                className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-all duration-300 hover:-translate-y-1"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    {expired && (
                                                        <p className="text-red-400/80 text-sm mt-2 italic">Event has expired</p>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-white/60 bg-white/10 rounded-lg p-6">
                                            No pending requests found
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/60">
                                Select a student to view their requests
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewStudents;