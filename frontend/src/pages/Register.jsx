import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';
import logo from '../assets/logo-sm.svg';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/auth/register', formData);
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            console.error('Error during registration:', error);
            setError(error.response?.data?.error || 'An unexpected error occurred.');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative">
            {/* Add background with blur effect */}
            <div className="absolute inset-0 bg-[#1a1a2e] -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
            </div>
            
            <div className="w-full max-w-md bg-black/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-8 animate-fadeIn">
                <div className="flex flex-col items-center mb-8">
                    <img 
                        src={logo} 
                        alt="Sathyabama Logo" 
                        className="h-28 w-auto mb-4" // Increased height from h-20 to h-28
                    />
                    <h2 className="text-3xl font-bold text-white">REGISTER</h2>
                </div>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                        />
                        <button
                            type="button"
                            onClick={handleTogglePassword}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white/70"
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                            paddingRight: '2.5rem'
                        }}
                    >
                        <option value="student" className="bg-gray-900 text-white">Student</option>
                        <option value="faculty" className="bg-gray-900 text-white">Faculty</option>
                        <option value="admin" className="bg-gray-900 text-white">Admin</option>
                    </select>

                    <button
                        type="submit"
                        className="w-full bg-accent/20 hover:bg-accent/30 text-white rounded-lg py-3 transition-all duration-300 hover:-translate-y-1"
                    >
                        Register
                    </button>
                </form>

                <p className="text-center mt-6 text-white/80">
                    Already have an account?{' '}
                    <Link 
                        to="/login" 
                        className="text-white hover:text-white/90 underline transition-colors"
                    >
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;