const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to student
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // Link to event
    timestamp: { type: Date, default: Date.now }, // Timestamp of attendance
});

module.exports = mongoose.model('Attendance', attendanceSchema);