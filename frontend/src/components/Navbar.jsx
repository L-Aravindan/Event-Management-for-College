import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = ({ userType, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
        navigate('/login');
    };

    const getNavLinks = () => {
        switch (userType) {
            case 'student':
                return [
                    { to: '/student/dashboard', text: 'View Events' },
                    { to: '/student/approval-status', text: 'Approval Status' },
                    { to: '/student/events-participated', text: 'Events Participated' },
                    { to: '/student/profile', text: 'Profile' },
                    { to: '/student/calendar', text: 'Calendar' }
                ];
            case 'faculty':
                return [
                    { to: '/faculty/display-events', text: 'Display Events' },
                    { to: '/faculty/add-events', text: 'Add Events' },
                    { to: '/faculty/approve-requests', text: 'Approve Requests' },
                    { to: '/faculty/add-mentored-students', text: 'Add Mentored Students' },
                    { to: '/faculty/display-mentored-students', text: 'Display Mentored Students' },
                    { to: '/faculty/profile', text: 'Profile' }
                ];
            case 'admin':
                return [
                    { to: '/admin/dashboard', text: 'Dashboard' },
                    { to: '/admin/view-students', text: 'View Students' },
                    { to: '/admin/view-faculties', text: 'View Faculties' },
                    { to: '/admin/analytics', text: 'Analytics' },
                    { to: '/admin/calendar', text: 'Calendar' }
                ];
            default:
                return [];
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3">
            <div className="max-w-7xl mx-auto">
                {/* Desktop Menu */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img 
                            src={logo} 
                            alt="Logo" 
                            onClick={() => navigate(`/${userType}/dashboard`)}
                            className="h-6 sm:h-6 cursor-pointer transition-transform duration-300 hover:scale-105"
                        />
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        {getNavLinks().map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="px-3 py-2 text-white/90 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-300 text-sm"
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] rounded-full text-white text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                        <span className="hidden sm:inline">Logout</span>
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-300"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} pt-4`}>
                    <div className="flex flex-col space-y-2">
                        {getNavLinks().map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="px-3 py-2 text-white/90 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-300 text-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;