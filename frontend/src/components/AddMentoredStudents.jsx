import React, { useState } from 'react';
import apiClient from '../services/api';
import '../styles/AddMentoredStudents.css'; // Import the CSS file

const AddMentoredStudents = ({ onLogout }) => {
    const [formData, setFormData] = useState({
        registerNumber: '',
        purpose: '',
        duration: '',
    });
    const [studentExists, setStudentExists] = useState(true);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const checkRegisterNumber = async (registerNumber) => {
        try {
            const response = await apiClient.get(`/users/check-register/${registerNumber}`);
            setStudentExists(response.data.exists);
        } catch (err) {
            console.error('Error checking register number:', err);
            setStudentExists(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!studentExists) {
            alert('Student with this register number does not exist.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in to add a mentored student.');
                return;
            }
            await apiClient.post('/mentorships', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Student added to mentorship list');
        } catch (err) {
            alert('Failed to add student');
        }
    };

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-hidden transform-gpu">
            <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 sm:p-6 md:p-8 animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
                    Add Mentored Student
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <input
                            type="number"
                            name="registerNumber"
                            placeholder="Register Number"
                            value={formData.registerNumber}
                            onChange={(e) => {
                                handleChange(e);
                                checkRegisterNumber(e.target.value);
                            }}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                        />
                        {!studentExists && (
                            <p className="text-red-400 text-sm pl-1">
                                Student with this register number does not exist
                            </p>
                        )}
                    </div>

                    <input
                        type="text"
                        name="purpose"
                        placeholder="Purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                    />

                    <input
                        type="date"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
                    />

                    <button
                        type="submit"
                        className="w-full bg-white/20 hover:bg-white/30 text-white rounded-lg py-3 px-4 transition-all duration-300 hover:-translate-y-1 mt-6"
                    >
                        Add Student
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMentoredStudents;