import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';
import '../styles/CalendarView.css';

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayEvents, setSelectedDayEvents] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await apiClient.get('/events');
                setEvents(response.data);
            } catch (err) {
                console.error('Error fetching events:', err);
                alert('Failed to fetch events');
            }
        };
        fetchEvents();
    }, []);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handleDayClick = (dayEvents) => {
        if (dayEvents.length > 0) {
            setSelectedDayEvents(dayEvents);
        }
    };

    const closePopup = () => {
        setSelectedDayEvents(null);
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDayOfMonth = getFirstDayOfMonth(currentDate);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getDate() === day && 
                       eventDate.getMonth() === currentDate.getMonth() &&
                       eventDate.getFullYear() === currentDate.getFullYear();
            });

            days.push(
                <div 
                    key={day} 
                    className={`calendar-day ${dayEvents.length > 0 ? 'has-events' : ''}`}
                    onClick={() => handleDayClick(dayEvents)}
                >
                    <div className="date">{day}</div>
                    <div className="events-list">
                        {dayEvents.slice(0, 2).map((event, index) => (
                            <div key={index} className="event-item">
                                {event.name}
                            </div>
                        ))}
                        {dayEvents.length > 2 && (
                            <div className="more-events">
                                +{dayEvents.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const navigateMonth = (direction) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    return (
        <div className="calendar-view">
            <div className="calendar-header">
                <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <div className="calendar-nav">
                    <button onClick={() => navigateMonth(-1)}>&lt;</button>
                    <button onClick={() => setCurrentDate(new Date())}>Today</button>
                    <button onClick={() => navigateMonth(1)}>&gt;</button>
                </div>
            </div>
            <div className="calendar-days-header">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>
            <div className="calendar-grid">
                {renderCalendar()}
            </div>
            
            {selectedDayEvents && (
                <div className="popup-overlay" onClick={closePopup}>
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <div className="popup-header">
                            <h3>Events on {selectedDayEvents[0]?.date ? new Date(selectedDayEvents[0].date).toLocaleDateString() : ''}</h3>
                            <button className="close-button" onClick={closePopup}>&times;</button>
                        </div>
                        <div className="popup-events">
                            {selectedDayEvents.map((event, index) => (
                                <div key={index} className="popup-event-item">
                                    <h4>{event.name}</h4>
                                    <p>Time: {event.time}</p>
                                    <p>{event.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView; 