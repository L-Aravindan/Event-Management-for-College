const express = require('express');
const EventRequest = require('../models/EventRequest');
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware to ensure only students can submit requests
const isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Access denied. Only students can perform this action.' });
    }
    next();
};

// Middleware to ensure only faculty can approve/reject requests
const isFaculty = (req, res, next) => {
    if (req.user.role !== 'faculty') {
        return res.status(403).json({ error: 'Access denied. Only faculty can perform this action.' });
    }
    next();
};

// 1. Submit an event request (Protected route for students)
// POST /api/events/:eventId/apply - Apply for an event
router.post('/:eventId/apply', authMiddleware, isStudent, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const studentId = req.user.id;

        console.log(`Applying for event: ${eventId} by student: ${studentId}`);

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            console.error('Event not found');
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if the student has already applied
        const existingApplication = event.applicants.find(
            (applicant) => applicant.studentId.toString() === studentId
        );
        if (existingApplication) {
            console.error('Student has already applied for this event');
            return res.status(400).json({ error: 'You have already applied for this event' });
        }

        // Add the student to the applicants list
        event.applicants.push({ studentId, status: 'pending' });
        await event.save();

        console.log('Application submitted successfully');
        res.status(200).json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error applying for event:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/applications/status/:studentId - Fetch application status for a student
router.get('/applications/status/:studentId', authMiddleware, isStudent, async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Find all events where the student has applied
        const events = await Event.find({ 'applicants.studentId': studentId })
            .populate('facultyId', 'name email')
            .select('name date time venue image applicants');

        // Extract the application status for the student
        const applications = events.map(event => {
            const applicant = event.applicants.find(app => app.studentId.toString() === studentId);
            return {
                eventId: event._id,
                eventName: event.name,
                date: event.date,
                time: event.time,
                venue: event.venue,
                image: event.image,
                status: applicant.status,
            };
        });

        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching application status:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/applications/accepted/:studentId - Fetch accepted events for a student
router.get('/applications/accepted/:studentId', authMiddleware, isStudent, async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Find all events where the student's application was accepted
        const events = await Event.find({
            'applicants.studentId': studentId,
            'applicants.status': 'accepted',
        })
            .populate('facultyId', 'name email')
            .select('name date time venue');

        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching accepted events:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. Get all event requests for a faculty member (Protected route for faculty)
// GET /event-requests - Fetch all event requests for approval
router.get('/', authMiddleware,isFaculty, async (req, res) => {
    try {
        const facultyId = req.user.id; // ID of the logged-in faculty

        // Find all events created by the faculty
        const events = await Event.find({ facultyId }).populate('applicants.studentId', 'name email');

        // Extract all applicants from the events
        const requests = events.flatMap((event) =>
            event.applicants.map((applicant) => ({
                _id: `${event._id}-${applicant.studentId._id}`, // Unique ID for each request
                eventId: event._id,
                eventName: event.name,
                studentId: applicant.studentId,
                status: applicant.status,
            }))
        );

        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. Approve or Reject an event request (Protected route for faculty)
router.put('/:eventId/applicants/:studentId', authMiddleware, isFaculty, async (req, res) => {
    const { status } = req.body;

    try {
        const { eventId, studentId } = req.params;

        // Validate status
        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Ensure the faculty owns the event
        if (event.facultyId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You are not authorized to modify this request' });
        }

        // Find and update the applicant's status
        const applicant = event.applicants.find(
            app => app.studentId.toString() === studentId
        );

        if (!applicant) {
            return res.status(404).json({ error: 'Applicant not found' });
        }

        applicant.status = status;
        await event.save();

        res.json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;