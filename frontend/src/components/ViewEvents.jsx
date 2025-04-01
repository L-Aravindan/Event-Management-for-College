import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';

const ViewEvents = () => {
    const [events, setEvents] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await apiClient.get('/events');
                setEvents(response.data);
            } catch (err) {
                console.error(err);
                alert('Failed to fetch events.');
            }
        };

        fetchEvents();
    }, []);

    const handleApply = async (eventId) => {
        try {
            await apiClient.post(`/event-requests/${eventId}/apply`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            alert('Application submitted successfully!');
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to apply for the event.');
        }
    };

    const isEventExpired = (eventDate, eventTime) => {
        const eventDateTime = new Date(`${eventDate}T${eventTime}`);
        const currentDateTime = new Date();
        return currentDateTime > eventDateTime;
    };

    return (
        <div>
            <h2>Available Events</h2>
            {events.length > 0 ? (
                <ul>
                    {events.map((event) => {
                        const hasApplied = event.applicants.some(
                            (applicant) => applicant.studentId.toString() === user.id
                        );

                        const expired = isEventExpired(event.date, event.time);

                        return (
                            <li key={event._id}>
                                <h3>{event.name}</h3>
                                <p>Date: {new Date(event.date).toLocaleDateString('en-GB')}</p>
                                <p>Time: {event.time}</p>
                                <p>Venue: {event.venue}</p>
                                <p>Description: {event.description}</p>
                                <p>Faculty: {event.facultyId?.name || 'Unknown'}</p>
                                <p style={{ 
                                    color: expired ? 'red' : 'green', 
                                    fontWeight: 'bold' 
                                }}>
                                    Status: {expired ? 'Expired' : 'Active'}
                                </p>
                                {!expired && !hasApplied && (
                                    <button 
                                        onClick={() => handleApply(event._id)}
                                        style={{
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            padding: '8px 16px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Apply
                                    </button>
                                )}
                                {hasApplied && <p>You have already applied.</p>}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p>No events found.</p>
            )}
        </div>
    );
};

export default ViewEvents;