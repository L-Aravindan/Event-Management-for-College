const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const EventRequest = require('../models/EventRequest');
const Attendance = require('../models/Attendance'); // Added Attendance model
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware to ensure only admin can access certain routes
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only admin can perform this action.' });
    }
    next();
};

// Helper function to check if an event is expired
const isEventExpired = (eventDate, eventTime) => {
    try {
        const [hours, minutes] = eventTime.split(':');
        const eventDateTime = new Date(eventDate);
        eventDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        const currentDateTime = new Date();
        return currentDateTime > eventDateTime;
    } catch (error) {
        console.error('Error checking event expiry:', error);
        return false; // If there's an error parsing the date/time, assume not expired
    }
};

// Get all users (Protected route for admin)
router.get('/users', authMiddleware, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all event requests for a student (Protected route for admin)
router.get('/users/:studentId/event-requests', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { studentId } = req.params;
        const events = await Event.find({ 'applicants.studentId': studentId })
            .populate('facultyId', 'name email')
            .select('name date time venue applicants');

        const applications = events
            .filter(event => !isEventExpired(event.date, event.time)) // Filter out expired events
            .map(event => {
                const applicant = event.applicants.find(app => app.studentId.toString() === studentId);
                return {
                    eventId: event._id,
                    eventName: event.name,
                    date: event.date,
                    time: event.time,
                    venue: event.venue,
                    status: applicant.status,
                    isExpired: false // Explicitly mark as not expired
                };
            });

        res.json(applications);
    } catch (error) {
        console.error('Error fetching event requests:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Approve or Reject a student's event request (Protected route for admin)
router.put('/users/:studentId/event-requests/:eventId', authMiddleware, isAdmin, async (req, res) => {
    const { status } = req.body;

    try {
        const { studentId, eventId } = req.params;

        console.log(`Received request to update status for studentId: ${studentId}, eventId: ${eventId}, status: ${status}`);

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            console.error('Invalid status:', status);
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Find the event and update the specific applicant's status
        const event = await Event.findOneAndUpdate(
            {
                _id: eventId,
                'applicants.studentId': studentId
            },
            {
                $set: {
                    'applicants.$.status': status
                }
            },
            { new: true }
        );

        if (!event) {
            console.error('Event or applicant not found');
            return res.status(404).json({ error: 'Event or applicant not found' });
        }

        res.json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all events organized by a faculty (Protected route for admin)
router.get('/users/:facultyId/events', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { facultyId } = req.params;
        const events = await Event.find({ facultyId }).select('name date time venue description');
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a user by ID (Protected route for admin)
router.delete('/users/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all analytics data
router.get('/analytics', authMiddleware, isAdmin, async (req, res) => {
    try {
        // Get all users
        const students = await User.find({ role: 'student' });
        const faculty = await User.find({ role: 'faculty' });
        
        // Get all events
        const events = await Event.find();
        
        // Get all event requests/applications
        const applications = await Event.aggregate([
            { $unwind: '$applicants' },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    approved: {
                        $sum: {
                            $cond: [{ $eq: ['$applicants.status', 'accepted'] }, 1, 0]
                        }
                    },
                    rejected: {
                        $sum: {
                            $cond: [{ $eq: ['$applicants.status', 'rejected'] }, 1, 0]
                        }
                    },
                    pending: {
                        $sum: {
                            $cond: [{ $eq: ['$applicants.status', 'pending'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // Calculate upcoming events
        const currentDate = new Date();
        const upcomingEvents = events.filter(event => new Date(event.date) >= currentDate);

        // Prepare response
        const analyticsData = {
            totalEvents: events.length,
            upcomingEvents: upcomingEvents.length,
            totalApplications: applications[0]?.total || 0,
            approvedApplications: applications[0]?.approved || 0,
            rejectedApplications: applications[0]?.rejected || 0,
            pendingApplications: applications[0]?.pending || 0,
            totalStudents: students.length,
            totalFaculty: faculty.length
        };

        res.json(analyticsData);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a student's details (Protected route for admin)
router.get('/users/:studentId', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add this new route for updating student details
router.put('/users/:studentId', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { studentId } = req.params;
        const updateData = req.body;
        
        // Remove any sensitive fields that shouldn't be updated
        delete updateData.password;
        delete updateData.role;
        
        const student = await User.findByIdAndUpdate(
            studentId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Override student attendance for an event (Protected route for admin)
router.put('/attendance/override/:eventId/:studentId', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { eventId, studentId } = req.params;
        const { hasAttendance } = req.body;

        // Find existing attendance record
        let attendance = await Attendance.findOne({ 
            eventId, 
            studentId 
        });

        if (hasAttendance) {
            // Create attendance record if it doesn't exist and hasAttendance is true
            if (!attendance) {
                attendance = new Attendance({
                    studentId,
                    eventId
                });
                await attendance.save();
            }
        } else {
            // Remove attendance record if it exists and hasAttendance is false
            if (attendance) {
                await Attendance.findByIdAndDelete(attendance._id);
            }
        }

        res.json({ message: 'Attendance status updated successfully' });
    } catch (error) {
        console.error('Error overriding attendance:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all requests for a specific event
router.get('/events/:eventId/requests', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId)
            .populate('applicants.studentId', 'name registerNumber department');
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const requests = event.applicants.map(applicant => ({
            studentId: applicant.studentId,
            status: applicant.status
        }));

        res.json(requests);
    } catch (error) {
        console.error('Error fetching event requests:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;