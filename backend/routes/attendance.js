const express = require('express');
const Attendance = require('../models/Attendance');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Middleware to ensure only students can access this route
const isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Access denied. Only students can perform this action.' });
    }
    next();
};

// Get attendance records for a student (Protected route for students)
router.get('/', authMiddleware, isStudent, async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find({ studentId: req.user.id })
            .populate({
                path: 'eventId',
                populate: [
                    {
                        path: 'facultyId',
                        select: 'name'
                    }
                ],
                match: { _id: { $exists: true } } // Ensure only records with valid events are returned
            })
            .sort({ timestamp: -1 });

        // Filter out records without populated events
        const validAttendanceRecords = attendanceRecords.filter(record => record.eventId);

        console.log('Attendance Records:', {
            totalRecords: attendanceRecords.length,
            validRecords: validAttendanceRecords.length
        });

        res.status(200).json(validAttendanceRecords);
    } catch (error) {
        console.error('Error fetching attendance records:', {
            message: error.message,
            stack: error.stack,
            userId: req.user.id
        });
        res.status(500).json({ 
            error: 'Failed to fetch attendance records',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;