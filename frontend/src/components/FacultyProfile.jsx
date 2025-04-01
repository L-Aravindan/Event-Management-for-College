import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

const FacultyProfile = ({ onLogout }) => {
    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        department: '',
        contactNumber: '',
        email: '',
        officeRoom: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    // Add this array of allowed fields
    const allowedFields = [
        'name',
        'designation',
        'department',
        'contactNumber',
        'email',
        'officeRoom'
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/users/me');
                // Filter out unwanted fields
                const filteredData = {};
                allowedFields.forEach(field => {
                    filteredData[field] = response.data[field];
                });
                setFormData(filteredData);
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
            await apiClient.put('/users/me', updateData);
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

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-hidden transform-gpu">
            <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 sm:p-6 animate-fadeIn">
                {isEditing && (
                    <button 
                        onClick={handleBack}
                        className="mb-6 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 text-white"
                    >
                        Back
                    </button>
                )}

                <h2 className="text-2xl sm:text-3xl text-white font-bold text-center mb-6">
                    {formData.name}
                </h2>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {[
                            { label: 'Designation', name: 'designation' },
                            { label: 'Department', name: 'department' },
                            { label: 'Contact Number', name: 'contactNumber' },
                            { label: 'Office Room', name: 'officeRoom' }
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
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-white/10 pb-2">
                            <span className="text-gray-400 text-sm min-w-[130px]">Email:</span>
                            <span className="text-white text-sm">{formData.email}</span>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-accent/20 hover:bg-accent/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1 mt-6"
                        >
                            Save Changes
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(formData).map(([key, value]) => (
                            allowedFields.includes(key) && (
                                <div 
                                    key={key} 
                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-white/10 pb-2"
                                >
                                    <span className="text-gray-400 text-sm min-w-[130px] capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                    </span>
                                    <span className="text-white text-sm">{value}</span>
                                </div>
                            )
                        ))}

                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full bg-accent/20 hover:bg-accent/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1 mt-6"
                        >
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyProfile;