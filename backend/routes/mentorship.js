const express = require('express');
const Mentorship = require('../models/Mentorship');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Middleware to ensure only faculty can manage mentorship
const isFaculty = (req, res, next) => {
    if (req.user.role !== 'faculty') {
        return res.status(403).json({ error: 'Access denied. Only faculty can perform this action.' });
    }
    next();
};

// Middleware to ensure only admin can view all mentorships
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only admin can perform this action.' });
    }
    next();
};

// 1. Add a Student to Faculty's Mentorship List (Protected route for faculty)
router.post('/', authMiddleware, isFaculty, async (req, res) => {
    const { registerNumber, purpose, duration } = req.body;

    try {
        // Check if the student exists
        const student = await User.findOne({ registerNumber });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Check if the student is already in the mentorship list
        const existingMentorship = await Mentorship.findOne({
            facultyId: req.user.id,
            registerNumber,
        });
        if (existingMentorship) {
            return res.status(400).json({ error: 'This student is already in your mentorship list' });
        }

        // Create a new mentorship record
        const newMentorship = new Mentorship({
            facultyId: req.user.id,
            studentId: student._id,
            registerNumber,
            name: student.name, // Retrieve the student's name
            purpose,
            duration,
        });

        await newMentorship.save();
        res.status(201).json(newMentorship);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. Remove a Student from Faculty's Mentorship List (Protected route for faculty)
router.delete('/:id', authMiddleware, isFaculty, async (req, res) => {
    try {
        const mentorship = await Mentorship.findById(req.params.id);
        if (!mentorship) {
            return res.status(404).json({ error: 'Mentorship not found' });
        }

        // Ensure the faculty owns the mentorship record
        if (mentorship.facultyId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You are not authorized to remove this student' });
        }

        await mentorship.remove();
        res.json({ message: 'Student removed from mentorship list successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. Get Faculty's Mentorship List (Protected route for faculty)
router.get('/', authMiddleware, isFaculty, async (req, res) => {
    try {
        const mentorships = await Mentorship.find({ facultyId: req.user.id })
            .populate('studentId', 'name email');

        res.json(mentorships);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch mentorship list' });
    }
});

// 4. Get All Mentorship Details (Protected route for admin)
router.get('/admin', authMiddleware, isAdmin, async (req, res) => {
    try {
        const mentorships = await Mentorship.find()
            .populate('facultyId', 'name email')
            .populate('studentId', 'name email');

        res.json(mentorships);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch mentorship details' });
    }
});

module.exports = router;