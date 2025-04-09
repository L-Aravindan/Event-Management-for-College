const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to faculty
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to student
    registerNumber: { type: Number, required: true }, // Register Number
    name: { type: String, required: true }, // Student Name
    purpose: { type: String, required: true }, // Purpose
    fromDate: { type: Date, required: true }, // Start Date
    toDate: { type: Date, required: true } // End Date
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);