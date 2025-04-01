import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';
import '../styles/AdminAnalytics.css';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState({
        totalEvents: 0,
        totalApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        pendingApplications: 0,
        totalStudents: 0,
        totalFaculty: 0,
        upcomingEvents: 0
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await apiClient.get('/admin/analytics');
                setAnalytics(response.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            }
        };
        fetchAnalytics();
    }, []);

    const getPercentage = (value, total) => {
        return ((value / total) * 100 || 0).toFixed(1);
    };

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Overview Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-fadeIn hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-500/20 rounded-lg">
                                <span className="text-3xl">📅</span>
                            </div>
                            <div>
                                <h3 className="text-lg text-white/80 font-medium">Total Events</h3>
                                <p className="text-3xl font-bold text-white">{analytics.totalEvents}</p>
                                <p className="text-sm text-white/60">{analytics.upcomingEvents} upcoming</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-fadeIn [animation-delay:200ms] hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-purple-500/20 rounded-lg">
                                <span className="text-3xl">📝</span>
                            </div>
                            <div>
                                <h3 className="text-lg text-white/80 font-medium">Applications</h3>
                                <p className="text-3xl font-bold text-white">{analytics.totalApplications}</p>
                                <p className="text-sm text-white/60">Total submissions</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-fadeIn [animation-delay:400ms] hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-teal-500/20 rounded-lg">
                                <span className="text-3xl">👥</span>
                            </div>
                            <div>
                                <h3 className="text-lg text-white/80 font-medium">Total Users</h3>
                                <p className="text-3xl font-bold text-white">{analytics.totalStudents + analytics.totalFaculty}</p>
                                <p className="text-sm text-white/60">{analytics.totalStudents} students, {analytics.totalFaculty} faculty</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applications Status Section */}
                <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-fadeIn [animation-delay:600ms]">
                    <h3 className="text-xl text-white font-semibold mb-6">Application Status Distribution</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-white/80">Approved</span>
                                <span className="text-green-400">{getPercentage(analytics.approvedApplications, analytics.totalApplications)}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${getPercentage(analytics.approvedApplications, analytics.totalApplications)}%` }}
                                />
                            </div>
                            <p className="text-sm text-white/60">{analytics.approvedApplications} applications</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-white/80">Pending</span>
                                <span className="text-yellow-400">{getPercentage(analytics.pendingApplications, analytics.totalApplications)}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-yellow-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${getPercentage(analytics.pendingApplications, analytics.totalApplications)}%` }}
                                />
                            </div>
                            <p className="text-sm text-white/60">{analytics.pendingApplications} applications</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-white/80">Rejected</span>
                                <span className="text-red-400">{getPercentage(analytics.rejectedApplications, analytics.totalApplications)}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-red-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${getPercentage(analytics.rejectedApplications, analytics.totalApplications)}%` }}
                                />
                            </div>
                            <p className="text-sm text-white/60">{analytics.rejectedApplications} applications</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;