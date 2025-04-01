import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import styles from '../styles/StudentProfile.module.css';

const StudentProfile = ({ onLogout }) => {
    const [formData, setFormData] = useState({
        registerNumber: '',
        classCoordinator: '',
        branch: '',
        department: '',
        section: '',
        year: '',
        mobileNumber: '',
        email: '',
        name: '',
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/users/me', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setFormData(response.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                alert('Failed to fetch profile.');
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { email, ...updateData } = formData;
            await apiClient.put('/users/me', updateData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Failed to update profile.');
        }
    };

    const handleBack = () => {
        setIsEditing(false);
        setFormData(formData);
    };

    // Add this array of allowed fields
    const allowedFields = [
        'name',
        'registerNumber',
        'classCoordinator',
        'branch',
        'department',
        'section',
        'year',
        'mobileNumber',
        'email'
    ];

    return (
        <div className="min-h-screen p-4 flex items-center justify-center">
            <div className="w-full max-w-2xl bg-black/70 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 sm:p-6 md:p-8 relative animate-fadeIn">
                {isEditing && (
                    <button 
                        onClick={handleBack}
                        className="absolute top-4 left-4 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 text-white text-sm"
                    >
                        Back
                    </button>
                )}

                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
                    {formData.name}
                </h2>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Form fields with responsive layout */}
                        {[
                            { label: 'Register Number', name: 'registerNumber' },
                            { label: 'Class Coordinator', name: 'classCoordinator' },
                            { label: 'Branch', name: 'branch' },
                            { label: 'Department', name: 'department' },
                            { label: 'Section', name: 'section' },
                            { label: 'Year', name: 'year' },
                            { label: 'Mobile Number', name: 'mobileNumber' },
                        ].map(field => (
                            <div key={field.name} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-white/10 pb-2">
                                <span className="text-gray-400 text-sm min-w-[130px]">
                                    {field.label}:
                                </span>
                                <input
                                    type="text"
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    className="w-full sm:flex-1 bg-white/10 border border-white/20 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-white/50"
                                />
                            </div>
                        ))}
                        
                        {/* Email field (non-editable) */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-white/10 pb-2">
                            <span className="text-gray-400 text-sm min-w-[130px]">Email:</span>
                            <span className="text-white text-sm">{formData.email}</span>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-white/20 hover:bg-white/30 text-white rounded-lg py-2 px-4 transition-all duration-300 hover:-translate-y-1 mt-6"
                        >
                            Save Changes
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        {/* Display fields with responsive layout */}
                        {Object.entries(formData).map(([key, value]) => (
                            allowedFields.includes(key) && (
                                <div key={key} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-white/10 pb-2">
                                    <span className="text-gray-400 text-sm min-w-[130px] capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                    </span>
                                    <span className="text-white text-sm">{value}</span>
                                </div>
                            )
                        ))}

                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full bg-white/20 hover:bg-white/30 text-white rounded-lg py-2 px-4 transition-all duration-300 hover:-translate-y-1 mt-6"
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProfile;