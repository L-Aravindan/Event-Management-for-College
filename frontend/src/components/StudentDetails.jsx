import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const StudentDetails = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [events, setEvents] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedStudent, setEditedStudent] = useState(null);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                const [studentRes, eventsRes, attendanceRes] = await Promise.all([
                    apiClient.get(`/admin/users/${studentId}`),
                    apiClient.get(`/admin/users/${studentId}/event-requests`),
                    apiClient.get(`/admin/users/${studentId}/attendance`) // New endpoint
                ]);

                setStudent(studentRes.data);
                setEditedStudent(studentRes.data);

                // Combine event data with attendance data
                const eventsWithAttendance = eventsRes.data.map(event => ({
                    ...event,
                    hasAttendance: attendanceRes.data.some(record => record.eventId === event.eventId)
                }));
                setEvents(eventsWithAttendance);
            } catch (err) {
                console.error('Error fetching student details:', err);
                alert('Failed to fetch student details');
            }
        };
        fetchStudentDetails();
    }, [studentId]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedStudent(student);
    };

    const handleChange = (e) => {
        setEditedStudent({
            ...editedStudent,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        try {
            await apiClient.put(`/admin/users/${studentId}`, editedStudent);
            setStudent(editedStudent);
            setIsEditing(false);
            alert('Student details updated successfully');
        } catch (err) {
            console.error('Error updating student:', err);
            alert('Failed to update student details');
        }
    };

    const handleEventStatusChange = async (eventId, newStatus) => {
        try {
            await apiClient.put(`/admin/events/${eventId}/status`, { 
                status: newStatus,
                studentId: studentId
            });
            
            // Update local state
            setEvents(events.map(event => 
                event._id === eventId ? { ...event, status: newStatus } : event
            ));
            
            alert('Event status updated successfully');
        } catch (err) {
            console.error('Error updating event status:', err);
            alert('Failed to update event status');
        }
    };

    const handleRequestAction = async (eventId, action) => {
        try {
            await apiClient.put(`/admin/event-requests/${eventId}`, { status: action });
            alert(`Request ${action}ed successfully`);
            // Refresh events after action
            const eventsRes = await apiClient.get(`/admin/users/${studentId}/event-requests`);
            setEvents(eventsRes.data);
        } catch (err) {
            console.error(`Error ${action}ing request:`, err);
            alert(`Failed to ${action} request`);
        }
    };

    const handleAttendanceOverride = async (eventId, hasAttended) => {
        try {
            await apiClient.put(`/admin/attendance/override/${eventId}/${student._id}`, {
                hasAttendance: hasAttended
            });
            
            // Update local state
            setEvents(events.map(event => 
                event._id === eventId ? { ...event, hasAttendance: hasAttended } : event
            ));
            
            alert('Attendance status updated successfully');
        } catch (err) {
            console.error('Error updating attendance status:', err);
            alert('Failed to update attendance status');
        }
    };

    const handleBack = () => {
        navigate('/admin/view-students');
    };

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
            <div className="max-w-7xl mx-auto bg-black/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 sm:p-6 md:p-8 animate-fadeIn">
                <button
                    onClick={handleBack}
                    className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-white flex items-center gap-2"
                >
                    <span>←</span> Back
                </button>

                {student && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                Student Details
                            </h2>
                            {!isEditing ? (
                                <button
                                    onClick={handleEdit}
                                    className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-white rounded-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    Edit Details
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-white rounded-lg transition-all duration-300 hover:-translate-y-1"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-all duration-300 hover:-translate-y-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Student Information */}
                            <div className="space-y-4 bg-white/10 rounded-lg p-6">
                                <h3 className="text-xl text-white font-semibold mb-4">Personal Information</h3>
                                {Object.entries(isEditing ? editedStudent : student)
                                    .filter(([key]) => !['_id', '__v', 'password', 'role', 'createdAt', 'updatedAt'].includes(key))
                                    .map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <span className="text-white/60 capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                                            </span>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name={key}
                                                    value={value}
                                                    onChange={handleChange}
                                                    className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm"
                                                />
                                            ) : (
                                                <span className="text-white">{value}</span>
                                            )}
                                        </div>
                                    ))
                                }
                            </div>

                            {/* Events Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl text-white font-semibold mb-4">Events Participated</h3>
                                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                                    {events.length > 0 ? (
                                        events.map((event) => (
                                            <div 
                                                key={event._id}
                                                className="bg-white/10 rounded-lg p-4 border border-white/10"
                                            >
                                                <h4 className="text-white font-medium mb-2">{event.name}</h4>
                                                <div className="space-y-2 text-sm">
                                                    <p className="flex justify-between">
                                                        <span className="text-white/60">Date:</span>
                                                        <span className="text-white">
                                                            {new Date(event.date).toLocaleDateString('en-GB')}
                                                        </span>
                                                    </p>
                                                    <p className="flex justify-between items-center">
                                                        <span className="text-white/60">Status:</span>
                                                        <select
                                                            value={event.status}
                                                            onChange={(e) => handleEventStatusChange(event._id, e.target.value)}
                                                            className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm"
                                                        >
                                                            <option value="pending" className="bg-black text-yellow-300">Pending</option>
                                                            <option value="approved" className="bg-black text-green-300">Approved</option>
                                                            <option value="rejected" className="bg-black text-red-300">Rejected</option>
                                                        </select>
                                                    </p>
                                                    <p className="flex justify-between items-center">
                                                        <span className="text-white/60">Attendance Override:</span>
                                                        <select
                                                            value={event.hasAttendance ? "present" : "absent"}
                                                            onChange={(e) => handleAttendanceOverride(event._id, e.target.value === "present")}
                                                            className={`bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm ${
                                                                event.hasAttendance ? 'text-green-300' : 'text-red-300'
                                                            }`}
                                                        >
                                                            <option value="present" className="bg-black text-green-300">Present</option>
                                                            <option value="absent" className="bg-black text-red-300">Absent</option>
                                                        </select>
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-white/60 bg-white/10 rounded-lg p-6">
                                            No events found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Event Requests Section */}
                        <div className="mt-6">
                            <h3 className="text-xl text-white font-semibold mb-4">Event Requests</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {events.map((event) => (
                                    <div 
                                        key={event.eventId}
                                        className="bg-white/10 rounded-lg p-4 border border-white/10"
                                    >
                                        <h4 className="text-white font-medium mb-2">{event.eventName}</h4>
                                        <div className="space-y-2 text-sm">
                                            <p className="flex justify-between">
                                                <span className="text-white/60">Date:</span>
                                                <span className="text-white">
                                                    {new Date(event.date).toLocaleDateString('en-GB')}
                                                </span>
                                            </p>
                                            <p className="flex justify-between">
                                                <span className="text-white/60">Status:</span>
                                                <span className={`
                                                    ${event.status === 'pending' ? 'text-yellow-300' : ''}
                                                    ${event.status === 'approved' ? 'text-green-300' : ''}
                                                    ${event.status === 'rejected' ? 'text-red-300' : ''}
                                                `}>
                                                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                </span>
                                            </p>
                                        </div>
                                        {event.status === 'pending' && (
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleRequestAction(event.eventId, 'approved')}
                                                    className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-white rounded-lg"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRequestAction(event.eventId, 'rejected')}
                                                    className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetails;
