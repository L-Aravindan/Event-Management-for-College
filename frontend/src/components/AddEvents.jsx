import React, { useState, useRef } from 'react';
import apiClient from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/AddEvents.css'; // Import the CSS file

const AddEvents = ({ onLogout }) => {
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        venue: '',
        description: '',
        image: null,
        club: ''
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        if (e.target.name === 'image') {
            const file = e.target.files[0];
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isLoading) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Login required');
                setIsLoading(false);
                return;
            }

            if (!formData.image || !(formData.image instanceof File)) {
                alert('Please select a valid image file');
                setIsLoading(false);
                return;
            }

            // Validate required fields
            const requiredFields = ['name', 'date', 'time', 'venue', 'description', 'club'];
            const missingFields = requiredFields.filter(field => !formData[field]);
            if (missingFields.length > 0) {
                alert(`Missing fields: ${missingFields.join(', ')}`);
                setIsLoading(false);
                return;
            }

            // Create FormData and append fields
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('date', formData.date);
            formDataToSend.append('time', formData.time);
            formDataToSend.append('venue', formData.venue);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('club', formData.club);
            
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const response = await apiClient.post('/events', formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                alert('Event created with image!');
                navigate('/faculty/display-events');
            }
        } catch (err) {
            console.error('Submission error:', err);
            alert(err.response?.data?.error || 'Failed to create event');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-hidden transform-gpu">
            <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 sm:p-6 md:p-8 animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
                    Create New Event
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {imagePreview && (
                        <div className="w-full max-h-[200px] overflow-hidden rounded-lg mb-4">
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        ref={fileInputRef}
                        className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Event Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                        />
                        <input
                            type="text"
                            name="club"
                            placeholder="Club"
                            value={formData.club}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
                        />
                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
                        />
                    </div>
                    
                    <input
                        type="text"
                        name="venue"
                        placeholder="Venue"
                        value={formData.venue}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                    />
                    
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30 min-h-[100px] resize-y"
                    />
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white/20 hover:bg-white/30 text-white rounded-lg py-3 px-4 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating Event...' : 'Create Event'}
                    </button>
                </form>

                {isLoading && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddEvents;