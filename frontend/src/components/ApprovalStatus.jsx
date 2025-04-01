import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';
import defaultEventImage from '../assets/logo-sm.svg';

const ApprovalStatus = ({ onLogout }) => {
    const [applicationStatus, setApplicationStatus] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchApplicationStatus = async () => {
            try {
                const response = await apiClient.get(`/event-requests/applications/status/${user.id}`);
                setApplicationStatus(response.data);
            } catch (err) {
                console.error('Error fetching application status:', err);
                alert('Failed to fetch application status.');
            }
        };

        fetchApplicationStatus();
    }, [user.id]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-300';
            case 'accepted':
                return 'bg-green-500/20 text-green-300';
            case 'rejected':
                return 'bg-red-500/20 text-red-300';
            default:
                return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-hidden transform-gpu">
            <div className="max-w-7xl mx-auto bg-black/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 sm:p-6 animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
                    Application Status
                </h2>
                
                {applicationStatus.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 pr-2">
                        {applicationStatus.map((application) => (
                            <div 
                                key={application.eventId}
                                className="group bg-white/10 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                            >
                                <div className="relative h-48">
                                    <img 
                                        src={application.image || defaultEventImage}
                                        alt={application.eventName}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultEventImage;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                                
                                <div className="p-4 space-y-3">
                                    <h3 className="text-lg font-semibold text-white truncate">
                                        {application.eventName}
                                    </h3>
                                    
                                    <div className="flex flex-col gap-2">
                                        <p className="text-white/80 text-sm flex justify-between items-center">
                                            <span className="text-white/60">Date:</span>
                                            <span>{new Date(application.date).toLocaleDateString('en-GB')}</span>
                                        </p>
                                        
                                        <p className="text-white/80 text-sm flex justify-between items-center">
                                            <span className="text-white/60">Venue:</span>
                                            <span>{application.venue}</span>
                                        </p>
                                        
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-sm text-white/60">Status:</span>
                                            <span className={`
                                                px-3 py-1 rounded-full text-sm font-medium
                                                ${getStatusColor(application.status)}
                                            `}>
                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-white/60 text-lg">No applications found</p>
                        <p className="text-white/40 text-sm mt-2">Your event applications will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApprovalStatus;