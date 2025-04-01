import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import defaultEventImage from '../assets/logo-sm.svg';

// Common event card component styling for all dashboards
const EventCard = ({ event, index, onClick, expired }) => (
    <div
        onClick={() => onClick(event._id)}
        className={`group bg-white/10 rounded-lg overflow-hidden shadow-lg border border-white/10 
            cursor-pointer relative flex flex-col h-[360px] transition-all duration-300 
            hover:shadow-2xl hover:border-white/30 animate-slideUp ${expired ? 'opacity-70' : ''}`}
        style={{ 
            animationDelay: `${index * 0.1}s`,
            animationFillMode: 'both' 
        }}
    >
        {/* Image Section */}
        <div className="relative w-full h-40 flex-shrink-0">
            <img
                src={event.image || defaultEventImage}
                alt={event.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultEventImage;
                }}
            />
            {expired && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white/90 font-bold text-lg uppercase tracking-wider">
                        EXPIRED
                    </span>
                </div>
            )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow bg-white/5 backdrop-blur-sm">
            <h3 className="text-white text-lg font-medium line-clamp-1 mb-4">
                {event.name}
            </h3>
            <div className="space-y-2 mt-auto">
                <p className="text-white/90 text-sm flex justify-between items-center gap-4">
                    <span className="text-white/70 min-w-[60px]">Date:</span>
                    <span className="text-right">
                        {new Date(event.date).toLocaleDateString('en-GB')}
                    </span>
                </p>
                <p className="text-white/90 text-sm flex justify-between items-center gap-4">
                    <span className="text-white/70 min-w-[60px]">Time:</span>
                    <span className="text-right">{event.time}</span>
                </p>
                <p className="text-white/90 text-sm flex justify-between items-center gap-4">
                    <span className="text-white/70 min-w-[60px]">Venue:</span>
                    <span className="text-right">{event.venue}</span>
                </p>
            </div>
        </div>
    </div>
);

const StudentDashboard = ({ onLogout }) => {
    const [events, setEvents] = useState([]);
    const [applications, setApplications] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

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
        const fetchEvents = async () => {
            try {
                const response = await apiClient.get('/events');
                setEvents(response.data);
            } catch (err) {
                console.error('Error fetching events:', err);
                alert('Failed to fetch events');
            }
        };

        const fetchApplications = async () => {
            try {
                const response = await apiClient.get(`/event-requests/applications/status/${user.id}`);
                setApplications(response.data);
            } catch (err) {
                console.error('Error fetching applications:', err);
                alert('Failed to fetch applications');
            }
        };

        fetchEvents();
        fetchApplications();
    }, [user.id]);

    const handleEventClick = (eventId) => {
        navigate(`/student/event/${eventId}`);
    };

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-hidden transform-gpu">
            <div className="h-full flex-1 p-4 bg-black/30 shadow-lg backdrop-blur-md max-w-7xl mx-auto overflow-hidden flex flex-col animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                    All Events
                </h2>

                {events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 overflow-y-auto h-[calc(100vh-200px)] pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
                        {events.map((event, index) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                index={index}
                                onClick={handleEventClick}
                                expired={isEventExpired(event.date, event.time)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-center text-white/80 text-lg py-5">No events found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;