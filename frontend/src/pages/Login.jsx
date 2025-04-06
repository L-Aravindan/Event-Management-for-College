import React, { useState } from 'react';
import apiClient from '../services/api';
import { setAuthToken } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo-sm.svg';
import { playLoginSound } from '../assets/sounds/ps4-login.js';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'student',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/login', formData);
            const token = response.data.token;
            const user = response.data.user;

            if (!token || !user) {
                throw new Error('Token not received from server.');
            }

            playLoginSound();

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setAuthToken(token);

            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            if (decodedToken.role !== formData.role) {
                alert(`Role mismatch. Expected ${formData.role}, but got ${decodedToken.role}.`);
                localStorage.removeItem('token');
                return;
            }

            onLogin(decodedToken.role);

            switch (decodedToken.role) {
                case 'student':
                    navigate('/student/dashboard');
                    break;
                case 'faculty':
                    navigate('/faculty/display-events');
                    break;
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data.error) {
                alert(error.response.data.error);
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
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
                    <h2 className="text-3xl font-bold text-white">LOGIN</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 appearance-none" // Added appearance-none
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
                        Login
                    </button>
                </form>

                <p className="text-center mt-6 text-white/80">
                    Don't have an account?{' '}
                    <Link 
                        to="/register" 
                        className="text-white hover:text-white/90 underline transition-colors"
                    >
                        Register here
                    </Link>
                </p>
            </div>

            {isLoading && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="bg-black/50 p-8 rounded-xl flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
                        <p className="text-white font-medium">Logging in...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;