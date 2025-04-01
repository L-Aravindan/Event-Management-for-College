import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import defaultEventImage from '../assets/logo-sm.svg';

const AdminEventDetail = () => {
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        venue: '',
        description: '',
        club: ''
    });
    const { eventId } = useParams();

    const isEventExpired = (eventDate, eventTime) => {
        const eventDateTime = new Date(`${eventDate}T${eventTime}`);
        const currentDateTime = new Date();
        return currentDateTime > eventDateTime;
    };

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await apiClient.get(`/events/${eventId}`);
                setEvent(response.data);
                setFormData({
                    name: response.data.name,
                    date: response.data.date.split('T')[0],
                    time: response.data.time,
                    venue: response.data.venue,
                    description: response.data.description,
                    club: response.data.club
                });
            } catch (err) {
                console.error('Error fetching event details:', err);
                alert('Failed to fetch event details');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const handleDelete = async () => {
        try {
            await apiClient.delete(`/events/${eventId}`);
            alert('Event deleted successfully!');
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Error deleting event:', err);
            alert('Failed to delete event');
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await apiClient.put(`/events/${eventId}`, formData);
            alert('Event updated successfully!');
            setEvent({ ...event, ...formData });
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating event:', err);
            alert('Failed to update event');
        }
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
                            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                                <img 
                                    src={event.image || defaultEventImage} 
                                    alt={event.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                            {isEditing ? (
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                                        placeholder="Event Name"
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-white/50"
                                            required
                                        />
                                        <input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-white/50"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="venue"
                                            value={formData.venue}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                                            placeholder="Venue"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="club"
                                            value={formData.club}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                                            placeholder="Club"
                                            required
                                        />
                                    </div>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50 min-h-[150px] resize-none"
                                        placeholder="Description"
                                        required
                                    />
                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            type="submit"
                                            className="flex-1 bg-accent/20 hover:bg-accent/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            Save Changes
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={toggleEditMode}
                                            className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
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
                                        <button 
                                            onClick={toggleEditMode}
                                            className="flex-1 bg-accent/20 hover:bg-accent/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            Edit Event
                                        </button>
                                        <button 
                                            onClick={handleDelete}
                                            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            Delete Event
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEventDetail;