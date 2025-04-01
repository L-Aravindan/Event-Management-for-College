import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';
import defaultEventImage from '../assets/logo-sm.svg';
import { useNavigate } from 'react-router-dom';

const EventsParticipated = ({ onLogout }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchParticipatedEvents = async () => {
            try {
                // Using the correct endpoint from backend
                const response = await apiClient.get(`/event-requests/applications/accepted/${user.id}`);
                if (response.data) {
                    const processedEvents = response.data.map(event => ({
                        ...event,
                        status: 'approved', // Since these are accepted events
                        attendanceMarked: event.hasAttendance // If your backend provides this information
                    }));
                    setEvents(processedEvents);
                } else {
                    setError('No data received from server');
                }
            } catch (err) {
                console.error('Error fetching participated events:', err);
                setError(err.response?.data?.message || 'Failed to fetch events');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchParticipatedEvents();
        } else {
            setError('User information not found');
            setLoading(false);
        }
    }, [user?.id]);

    const handleEventClick = (eventId) => {
        navigate(`/student/event/${eventId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-white/60">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-hidden transform-gpu">
            <div className="max-w-7xl mx-auto bg-black/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 sm:p-6 animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
                    Events Participated
                </h2>

                {events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 pr-2">
                        {events.map((event) => (
                            <div 
                                key={event._id}
                                onClick={() => handleEventClick(event._id)}
                                className="bg-white/10 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer group"
                            >
                                <div className="relative h-48">
                                    <img 
                                        src={event.image || defaultEventImage}
                                        alt={event.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultEventImage;
                                        }}
                                    />
                                    {event.attendanceMarked && (
                                        <div className="absolute top-2 right-2 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                                            Attendance Marked
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 space-y-3">
                                    <h3 className="text-lg font-semibold text-white truncate">
                                        {event.name}
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="text-white/80 text-sm flex justify-between">
                                            <span>Date:</span>
                                            <span>{new Date(event.date).toLocaleDateString('en-GB')}</span>
                                        </p>
                                        <p className="text-white/80 text-sm flex justify-between">
                                            <span>Time:</span>
                                            <span>{event.time}</span>
                                        </p>
                                        <p className="text-white/80 text-sm flex justify-between">
                                            <span>Venue:</span>
                                            <span>{event.venue}</span>
                                        </p>
                                        <p className="text-white/80 text-sm flex justify-between">
                                            <span>Status:</span>
                                            <span className={`
                                                px-2 py-0.5 rounded-full text-xs
                                                ${event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                                                ${event.status === 'approved' ? 'bg-green-500/20 text-green-300' : ''}
                                                ${event.status === 'rejected' ? 'bg-red-500/20 text-red-300' : ''}
                                            `}>
                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-white/60 text-lg py-8">
                        No events participated yet.
                    </p>
                )}
            </div>
        </div>
    );
};

export default EventsParticipated;