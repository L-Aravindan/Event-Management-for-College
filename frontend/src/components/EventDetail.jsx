import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import apiClient from '../services/api';
import '../styles/EventDetail.css';
import defaultEventImage from '../assets/logo-sm.svg';

const EventDetail = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasApplied, setHasApplied] = useState(false);
    const [hasMarkedAttendance, setHasMarkedAttendance] = useState(false);
    const [attendanceCode, setAttendanceCode] = useState('');
    const { eventId } = useParams();
    const user = JSON.parse(localStorage.getItem('user'));

    // Update isEventExpired function to match StudentDashboard
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

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                // Fetch event details
                const eventResponse = await apiClient.get(`/events/${eventId}`);
                setEvent(eventResponse.data);
                
                // Check if user has already applied
                const userApplication = eventResponse.data.applicants.find(
                    applicant => applicant.studentId === user.id
                );
                setHasApplied(!!userApplication);

                // Check attendance status
                const attendanceResponse = await apiClient.get('/attendance', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const hasAttended = attendanceResponse.data.some(
                    record => record.eventId._id === eventId
                );
                setHasMarkedAttendance(hasAttended);
            } catch (err) {
                console.error('Error fetching event details:', err);
                alert('Failed to fetch event details');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId, user.id]);

    const handleApply = async () => {
        try {
            // Check if event is expired before allowing application
            if (isEventExpired(event.date, event.time)) {
                alert('Cannot apply for expired events');
                return;
            }
            await apiClient.post(`/event-requests/${eventId}/apply`);
            alert('Application submitted successfully!');
            setHasApplied(true);
        } catch (err) {
            console.error('Error applying for event:', err);
            alert(err.response?.data?.error || 'Failed to apply for the event');
        }
    };

    const handleAttendance = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in to mark attendance.');
                return;
            }

            if (!attendanceCode) {
                alert('Please enter the attendance code.');
                return;
            }

            // Get current location
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                
                await apiClient.post(
                    `/events/${eventId}/verify-attendance`,
                    { 
                        attendanceCode,
                        latitude,
                        longitude
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                alert('Attendance marked successfully!');
                setHasMarkedAttendance(true);
            }, () => {
                alert('Failed to get location. Please enable location services.');
            });
        } catch (err) {
            console.error('Error marking attendance:', err);
            alert(err.response?.data?.error || 'Failed to mark attendance');
        }
    };

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!event) return <div className="error">Event not found</div>;

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button 
                    onClick={handleBack}
                    className="group mb-6 px-4 py-2 bg-white/10 rounded-lg transition-all duration-300 hover:-translate-y-1 text-white/90 hover:text-white flex items-center gap-2 text-base"
                >
                    <span className="transform transition-transform group-hover:-translate-x-1">←</span>
                    Back
                </button>

                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Left Column - Image and Status */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="relative group">
                            <div className="relative w-full rounded-xl overflow-hidden border border-white/10 h-[500px]"> {/* Reduced height from 600px to 400px */}
                                <img 
                                    src={event.image || defaultEventImage} 
                                    alt={event.name}
                                    className="w-full h-full object-cover" // Changed from object-cover to object-contain
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultEventImage;
                                    }}
                                />
                                {isEventExpired(event.date, event.time) && (
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                        <span className="text-white/90 font-bold text-2xl tracking-wider px-6 py-2 rounded-full border border-white/20 bg-black/50">
                                            EXPIRED
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <p className="text-white/60 text-base mb-1">Club</p>
                                <p className="text-white font-medium text-lg truncate">{event.club}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <p className="text-white/60 text-base mb-1">Venue</p>
                                <p className="text-white font-medium text-lg truncate">{event.venue}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Event Details */}
                    <div className="lg:col-span-7">
                        <div className="bg-black/70 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6 space-y-6">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h1 className="text-3xl font-bold text-white">{event.name}</h1>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                                            <p className="text-white/60 text-sm mb-1">Date</p>
                                            <p className="text-white font-medium text-xl">
                                                {new Date(event.date).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                                            <p className="text-white/60 text-sm mb-1">Time</p>
                                            <p className="text-white font-medium text-xl">{event.time}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                        <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                                        <p className="text-white/80 leading-relaxed">{event.description}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    {!hasApplied && !isEventExpired(event.date, event.time) && (
                                        <button 
                                            onClick={handleApply}
                                            className="flex-1 bg-accent/20 hover:bg-accent/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            Apply for Event
                                        </button>
                                    )}
                                    {hasApplied && !hasMarkedAttendance && !isEventExpired(event.date, event.time) && (
                                        <div className="flex-1 space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Enter attendance code"
                                                value={attendanceCode}
                                                onChange={(e) => setAttendanceCode(e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                                            />
                                            <button 
                                                onClick={handleAttendance}
                                                className="w-full bg-accent/20 hover:bg-accent/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                                            >
                                                Mark Attendance
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {hasMarkedAttendance && (
                                    <div className="bg-green-500/20 text-green-300 rounded-lg p-4 text-center font-medium">
                                        Attendance has been marked
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;