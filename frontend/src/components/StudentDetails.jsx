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
                const [studentRes, eventsRes] = await Promise.all([
                    apiClient.get(`/admin/users/${studentId}`),
                    apiClient.get(`/admin/users/${studentId}/events`)
                ]);
                setStudent(studentRes.data);
                setEditedStudent(studentRes.data);
                setEvents(eventsRes.data);
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

    const handleBack = () => {
        navigate('/admin/view-students');
    };

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-hidden transform-gpu">
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetails;
