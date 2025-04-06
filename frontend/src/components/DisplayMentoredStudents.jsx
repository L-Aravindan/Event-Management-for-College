import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';
import '../styles/DisplayMentoredStudents.css'; 

const DisplayMentoredStudents = ({ onLogout }) => {
    const [students, setStudents] = useState([]);
    const [searchRegisterNumber, setSearchRegisterNumber] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await apiClient.get('/mentorships', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStudents(response.data);
                setFilteredStudents(response.data);
            } catch (err) {
                console.error(err);
                alert('Failed to fetch mentored students.');
            }
        };
        fetchStudents();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchRegisterNumber) {
            const filtered = students.filter(student => 
                student.registerNumber?.toString().includes(searchRegisterNumber)
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(students);
        }
    };

    const clearSearch = () => {
        setSearchRegisterNumber('');
        setFilteredStudents(students);
    };

    const getStatus = (duration) => {
        const endDate = new Date(duration);
        const currentDate = new Date();
        return currentDate > endDate ? 'Completed' : 'Ongoing';
    };

    return (
        <div className="p-4 h-[calc(100vh-80px)] overflow-hidden transform-gpu">
            <div className="max-w-7xl mx-auto bg-black/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 sm:p-6 md:p-8 animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
                    Mentored Students
                </h2>

                <div className="mb-6">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Search by Register Number"
                            value={searchRegisterNumber}
                            onChange={(e) => setSearchRegisterNumber(e.target.value)}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                        />
                        {searchRegisterNumber && (
                            <button
                                onClick={clearSearch}
                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {filteredStudents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 pr-2">
                        {filteredStudents.map((student) => (
                            <div
                                key={student._id}
                                className="bg-white/10 rounded-lg p-4 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="space-y-2 text-sm text-white/80">
                                    <p className="flex justify-between">
                                        <span className="text-white/60">Register Number:</span>
                                        <span>{student.registerNumber}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-white/60">Name:</span>
                                        <span>{student.name}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-white/60">Purpose:</span>
                                        <span>{student.purpose}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-white/60">Duration:</span>
                                        <span>{new Date(student.duration).toLocaleDateString('en-GB')}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-white/60">Status:</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                            getStatus(student.duration) === 'Completed' 
                                                ? 'bg-green-500/20 text-green-300'
                                                : 'bg-yellow-500/20 text-yellow-300'
                                        }`}>
                                            {getStatus(student.duration)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-white/60 bg-white/10 rounded-lg p-6">
                        No mentored students found
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplayMentoredStudents;