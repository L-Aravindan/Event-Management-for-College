const express = require('express');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/cloudinary');
const router = express.Router();

// Middleware to ensure only faculty can access certain routes
const isFaculty = (req, res, next) => {
    console.log('isFaculty Middleware - User Details:', {
        userId: req.user?.id,
        userRole: req.user?.role
    });

    if (!req.user) {
        console.warn('No user object in request');
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'faculty') {
        console.warn(`Access denied. User ${req.user.id} with role ${req.user.role} attempted faculty-only action`);
        return res.status(403).json({ 
            error: 'Access denied. Only faculty can perform this action.',
            userDetails: {
                id: req.user.id,
                role: req.user.role
            }
        });
    }
    next();
};

// Middleware to ensure only students can access certain routes
const isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Access denied. Only students can perform this action.' });
    }
    next();
};

// Middleware to ensure only admin can delete events
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only admin can perform this action.' });
    }
    next();
};

// Middleware to ensure either faculty or admin can access certain routes
const isFacultyOrAdmin = (req, res, next) => {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only faculty or admin can perform this action.' });
    }
    next();
};

// Create a new event with image upload (Protected route for faculty)
router.post('/', authMiddleware, isFaculty,upload.single('image'), async (req, res) => {
            const { name, date, time, venue, description, club } = req.body;
            
            // Validate required fields
            if (!name || !date || !time || !venue || !description || !club) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            try{
            const newEvent = new Event({
                name,
                date: new Date(date),
                time,
                venue,
                description,
                club,
                facultyId: req.user.id,
                image: req.file ? req.file.path : null
            });

            const savedEvent = await newEvent.save();
            console.log('Event created with image:', savedEvent.image);
            res.status(201).json(savedEvent);
            
        } catch (error) {
            console.error('Event creation error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

// Get all events (Public or Protected route)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const events = await Event.find().populate('facultyId', 'name email');
        console.log('Events being sent to client:', events);
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Get a single event by ID
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('facultyId', 'name');
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update an event with image (Protected route for faculty and admin)
router.put('/:id', authMiddleware, isFacultyOrAdmin, upload.single('image'), async (req, res) => {
    const { name, date, time, venue, description } = req.body;

    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Allow both the original faculty and admin to update the event
        if (req.user.role !== 'admin' && event.facultyId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You are not authorized to update this event' });
        }

        event.name = name || event.name;
        event.date = date ? new Date(date) : event.date;
        event.time = time || event.time;
        event.venue = venue || event.venue;
        event.description = description || event.description;
        if (req.file) {
            event.image = req.file.path;
        }

        await event.save();
        res.json(event);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete an event (Protected route for faculty and admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id; // ID of the logged-in user

        // Find the event by ID
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if the logged-in user is the creator of the event or an admin
        if (event.facultyId.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to delete this event' });
        }

        // Delete the event
        await Event.findByIdAndDelete(eventId);

        // Send success response
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Generate attendance code (Protected route for faculty)
router.post('/:id/generate-attendance', authMiddleware, isFaculty, async (req, res) => {
    try {
        const eventId = req.params.id;
        const { latitude, longitude } = req.body;

        // Validate input
        if (!latitude || !longitude) {
            console.warn(`Invalid coordinates: Latitude: ${latitude}, Longitude: ${longitude}`);
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        // Additional logging for debugging
        console.log('Request User Details:', {
            userId: req.user.id,
            userRole: req.user.role
        });

        const event = await Event.findById(eventId);
        if (!event) {
            console.warn(`Event not found: ${eventId}`);
            return res.status(404).json({ error: 'Event not found' });
        }

        // Log additional debugging information
        console.log(`Generate Attendance Request:
            Event ID: ${eventId}
            User ID: ${req.user.id}
            User Role: ${req.user.role}
            Event Faculty ID: ${event.facultyId}
            Coordinates: (${latitude}, ${longitude})
        `);

        // Ensure the faculty owns the event
        if (event.facultyId.toString() !== req.user.id) {
            console.warn(`Unauthorized attendance generation attempt:
                User ID: ${req.user.id}
                Event Faculty ID: ${event.facultyId}
                Event Details: ${JSON.stringify(event, null, 2)}
            `);
            return res.status(403).json({ 
                error: 'You are not authorized to generate an attendance code for this event',
                details: {
                    requestUserId: req.user.id,
                    eventFacultyId: event.facultyId.toString()
                }
            });
        }

        // Sanitize applicants to remove any invalid statuses
        if (event.applicants && event.applicants.length > 0) {
            event.applicants = event.applicants.map(applicant => {
                // Normalize status to match allowed values
                if (applicant.status === 'approved') {
                    applicant.status = 'accepted';
                }
                return applicant;
            });
        }

        // Generate a random alphanumeric code
        const attendanceCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Update the event with the attendance code and coordinates
        event.attendanceCode = attendanceCode;
        event.coordinates = { latitude, longitude };
        event.status = 'Attendance Open';
        
        await event.save();

        console.log(`Attendance code generated for event ${eventId}`);
        res.json({ attendanceCode });
    } catch (error) {
        console.error('Error generating attendance code:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            requestBody: req.body,
            requestParams: req.params,
            requestUser: req.user
        });

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errorMessages 
            });
        }

        res.status(500).json({ 
            error: 'Server error', 
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                stack: error.stack
            } : undefined 
        });
    }
});

// Verify attendance (Protected route for students)
router.post('/:id/verify-attendance', authMiddleware, isStudent, async (req, res) => {
    try {
        const eventId = req.params.id;
        const { attendanceCode, latitude, longitude } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if the attendance code matches
        if (event.attendanceCode !== attendanceCode) {
            return res.status(400).json({ error: 'Invalid attendance code' });
        }

        // Calculate the distance between the student's location and the event location
        const distance = getDistance(event.coordinates.latitude, event.coordinates.longitude, latitude, longitude);

        // Check if the student is within the allowed proximity (e.g., 50–200 meters)
        if (distance > 200) {
            return res.status(400).json({ error: 'You are not within the allowed proximity to mark attendance' });
        }

        // Record the student's attendance
        const attendance = new Attendance({
            studentId: req.user.id,
            eventId: event._id
        });
        await attendance.save();

        res.json({ message: 'Attendance recorded successfully' });
    } catch (error) {
        console.error('Error verifying attendance:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper function to calculate the distance between two coordinates
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    //Haversine Formula
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

module.exports = router;