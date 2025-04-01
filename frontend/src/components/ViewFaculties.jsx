import React, { useEffect, useState, useRef } from 'react';
import apiClient from '../services/api';
import '../styles/ViewFaculties.css'; // Import the CSS file

const ViewFaculties = ({ onLogout }) => {
    const [faculties, setFaculties] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [facultyEvents, setFacultyEvents] = useState([]);
    const [showScrollButtons, setShowScrollButtons] = useState(false); // State to control button visibility
    const scrollContainerRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFaculties, setFilteredFaculties] = useState([]);

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await apiClient.get('/admin/users');
                const facultyList = response.data.filter(user => user.role === 'faculty');
                setFaculties(facultyList);
                setFilteredFaculties(facultyList);
            } catch (err) {
                console.error('Error fetching faculties:', err);
                alert('Failed to fetch faculties');
            }
        };
        fetchFaculties();
    }, []);

    useEffect(() => {
        // Check for overflow whenever the faculties list updates
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            setShowScrollButtons(container.scrollWidth > container.clientWidth);
        }
    }, [faculties]);

    const handleFacultyClick = async (faculty) => {
        setSelectedFaculty(faculty);
        try {
            const response = await apiClient.get(`/admin/users/${faculty._id}/events`);
            setFacultyEvents(response.data);
        } catch (err) {
            console.error('Error fetching faculty events:', err);
            alert('Failed to fetch faculty events');
        }
    };

    const scrollLeft = () => {
        scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    };

    const handleSearch = (e) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);
        
        if (searchValue) {
            const filtered = faculties.filter(faculty => 
                faculty.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                faculty.department?.toLowerCase().includes(searchValue.toLowerCase())
            );
            setFilteredFaculties(filtered);
        } else {
            setFilteredFaculties(faculties);
        }
    };

    return (
        <div className="view-faculties">
            <div className="max-w-7xl mx-auto bg-black/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 sm:p-6 md:p-8 animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
                    View Faculty Details
                </h2>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Search by name or department..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                        />
                    </div>
                </div>

                {/* Faculties Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Faculty List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-xl text-white font-semibold mb-4">Faculty List</h3>
                        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 pr-2">
                            {filteredFaculties.map((faculty) => (
                                <div
                                    key={faculty._id}
                                    onClick={() => handleFacultyClick(faculty)}
                                    className={`
                                        p-4 rounded-lg cursor-pointer transition-all duration-300 hover:-translate-y-1
                                        ${selectedFaculty?._id === faculty._id 
                                            ? 'bg-white/20 border border-white/30' 
                                            : 'bg-white/10 border border-white/10 hover:bg-white/15'
                                        }
                                    `}
                                >
                                    <h4 className="text-white font-medium">{faculty.name}</h4>
                                    <p className="text-white/60 text-sm">{faculty.department}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Faculty Events */}
                    <div className="lg:col-span-2">
                        {selectedFaculty ? (
                            <div className="space-y-4">
                                <h3 className="text-xl text-white font-semibold">
                                    {selectedFaculty.name}'s Events
                                </h3>
                                {facultyEvents.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                                        {facultyEvents.map((event) => (
                                            <div 
                                                key={event._id}
                                                className="bg-white/10 rounded-lg p-4 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                            >
                                                <h4 className="text-white font-medium mb-2">{event.name}</h4>
                                                <div className="space-y-1 text-sm">
                                                    <p className="flex justify-between">
                                                        <span className="text-white/60">Date:</span>
                                                        <span className="text-white">{new Date(event.date).toLocaleDateString('en-GB')}</span>
                                                    </p>
                                                    <p className="flex justify-between">
                                                        <span className="text-white/60">Time:</span>
                                                        <span className="text-white">{event.time}</span>
                                                    </p>
                                                    <p className="flex justify-between">
                                                        <span className="text-white/60">Venue:</span>
                                                        <span className="text-white">{event.venue}</span>
                                                    </p>
                                                    <p className="mt-2">
                                                        <span className="text-white/60">Description:</span>
                                                        <span className="text-white block mt-1">{event.description}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-white/60 bg-white/10 rounded-lg p-6">
                                        No events found for this faculty.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/60">
                                Select a faculty to view their events
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewFaculties;