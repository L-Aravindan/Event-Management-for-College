import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';
import '../styles/ApproveRequests.css'; // Import the CSS file

const ApproveRequests = ({ onLogout }) => {
    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await apiClient.get('/event-requests');
                console.log('Fetched requests:', response.data);
                setRequests(response.data);
            } catch (err) {
                console.error('Error fetching requests:', err);
                alert('Failed to fetch requests');
            }
        };
        fetchRequests();
    }, []);

    const handleApproveReject = async (eventId, studentId, status) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in to approve or reject a request.');
                return;
            }
            await apiClient.put(`/event-requests/${eventId}/applicants/${studentId}`, { status }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            alert('Request updated successfully');

            // Refresh the requests list
            const response = await apiClient.get('/event-requests', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(response.data);
        } catch (err) {
            console.error('Error updating request:', err);
            alert(err.response?.data?.error || 'Failed to update request');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
            case 'accepted':
                return 'bg-green-500/20 text-green-300 border border-green-500/30';
            case 'approved':
                    return 'bg-green-500/20 text-green-300 border border-green-500/30';
            case 'rejected':
                return 'bg-red-500/20 text-red-300 border border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
        }
    };

    const filteredRequests = requests.filter(request => 
        request.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-hidden transform-gpu">
            <div className="max-w-7xl mx-auto bg-black/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 sm:p-6 md:p-8 animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
                    Approve/Reject Student Requests
                </h2>

                <div className="mb-6">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Search by student name or event..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {filteredRequests.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 pr-2">
                        {filteredRequests.map((request) => (
                            <div 
                                key={request._id}
                                className="bg-white/10 rounded-lg p-4 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <h3 className="text-lg font-semibold text-white mb-3">
                                    {request.eventName}
                                </h3>
                                <div className="space-y-2 text-sm text-white/80">
                                    <p>Student: {request.studentId.name}</p>
                                    <p>Email: {request.studentId.email}</p>
                                    <div className={`
                                        inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium
                                        ${getStatusStyle(request.status)}
                                    `}>
                                        <span className="text-white/60 mr-2">Status:</span>
                                        <span className={`
                                            inline-block w-2 h-2 rounded-full mr-2
                                            ${request.status === 'pending' ? 'bg-yellow-400' : ''}
                                            ${request.status === 'accepted' ? 'bg-green-400' : ''}
                                            ${request.status === 'rejected' ? 'bg-red-400' : ''}
                                        `}></span>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </div>
                                </div>
                                {request.status === 'pending' && (
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => handleApproveReject(request.eventId, request.studentId._id, 'accepted')}
                                            className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-white rounded-lg transition-all duration-300 hover:-translate-y-1"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleApproveReject(request.eventId, request.studentId._id, 'rejected')}
                                            className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-all duration-300 hover:-translate-y-1"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-white/60 bg-white/10 rounded-lg p-6">
                        {searchTerm ? 'No matching requests found.' : 'No pending requests found.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApproveRequests;