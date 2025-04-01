const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust the path to your User model
const authMiddleware = require('../middleware/auth'); // Middleware to verify JWT token


// GET /me - Fetch the currently logged-in user's details
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // Find the user by ID from the decoded token
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send the user details
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


// PUT /me - Update the currently logged-in user's details
router.put('/me', authMiddleware, async (req, res) => {
    try {
        // Find the user by ID from the decoded token
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check user role and update accordingly
        if (user.role === 'student') {
            const { registerNumber, classCoordinator, branch, department, year, mobileNumber } = req.body;
            
            // Update student details
            user.registerNumber = registerNumber || user.registerNumber;
            user.classCoordinator = classCoordinator || user.classCoordinator;
            user.branch = branch || user.branch;
            user.department = department || user.department;
            user.year = year || user.year;
            user.section = req.body.section || user.section;
            user.mobileNumber = mobileNumber || user.mobileNumber;
        } 
        else if (user.role === 'faculty') {
            const { designation, department, contactNumber, officeRoom } = req.body;
            
            // Update faculty details
            user.designation = designation || user.designation;
            user.department = department || user.department;
            user.contactNumber = contactNumber || user.contactNumber;
            user.officeRoom = officeRoom || user.officeRoom;
        }

        await user.save();

        // Send the updated user details
        res.json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/check-register/:registerNumber', async (req, res) => {
    try {
        const user = await User.findOne({ 
            registerNumber: req.params.registerNumber,
            role: 'student'
        });
        res.json({ exists: !!user });
    } catch (error) {
        console.error('Error checking register number:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;