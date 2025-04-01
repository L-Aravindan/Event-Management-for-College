import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import defaultEventImage from '../assets/logo-sm.svg';

const FacultyEventDetail = () => {
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const { eventId } = useParams();
    const user = JSON.parse(localStorage.getItem('user'));

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
                const response = await apiClient.get(`/events/${eventId}`);
                setEvent(response.data);
            } catch (err) {
                console.error('Error fetching event details:', err);
                alert('Failed to fetch event details');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const handleGenerateAttendance = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token ? 'Present' : 'Missing');
            
            if (!token) {
                alert('You must be logged in to generate an attendance code.');
                return;
            }
            
            // Check if geolocation is supported
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser.');
                return;
            }

            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                console.log('Location Coordinates:', { latitude, longitude });

                try {
                    const response = await apiClient.post(
                        `/events/${eventId}/generate-attendance`,
                        { latitude, longitude }
                    );
                    console.log('Generate Attendance Response:', response.data);
                    alert(`Attendance code generated: ${response.data.attendanceCode}`);
                } catch (err) {
                    console.error('Error generating attendance code:', {
                        error: err,
                        response: err.response,
                        request: err.request,
                        config: err.config
                    });
                    
                    if (err.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        const errorMessage = err.response.data.error || 'Failed to generate attendance code';
                        const errorDetails = err.response.data.details;
                        
                        console.error('Server Error Details:', {
                            status: err.response.status,
                            data: err.response.data,
                            headers: err.response.headers
                        });
                        
                        alert(`Error: ${errorMessage}\n${errorDetails ? JSON.stringify(errorDetails) : ''}`);
                    } else if (err.request) {
                        // The request was made but no response was received
                        alert('No response received from server. Please check your network connection.');
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        alert('Error setting up the request. Please try again.');
                    }
                }
            }, (error) => {
                console.error('Error getting location:', error);
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        alert('Location access was denied. Please enable location services.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert('Location information is unavailable.');
                        break;
                    case error.TIMEOUT:
                        alert('Location request timed out.');
                        break;
                    default:
                        alert('An unknown error occurred while getting location.');
                }
            }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('An unexpected error occurred. Please try again.');
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in to delete an event.');
                return;
            }
            await apiClient.delete(`/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Event deleted successfully!');
            navigate('/faculty/display-events');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 403) {
                alert('You are not authorized to delete this event.');
            } else {
                alert('Failed to delete event.');
            }
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!event) return <div className="error">Event not found</div>;

    const isExpired = isEventExpired(event.date, event.time);

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
                            <div className="relative w-full rounded-xl overflow-hidden border border-white/10 h-[550px]">
                                <img 
                                    src={event.image || defaultEventImage} 
                                    alt={event.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultEventImage;
                                    }}
                                />
                                {isExpired && (
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

                                {event.facultyId?._id === user?.id && !isExpired && (
                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            onClick={handleGenerateAttendance}
                                            className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            Generate Attendance Code
                                        </button>
                                        <button 
                                            onClick={handleDelete}
                                            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            Delete Event
                                        </button>
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

export default FacultyEventDetail;