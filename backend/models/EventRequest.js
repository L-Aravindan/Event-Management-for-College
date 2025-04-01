const mongoose = require('mongoose');

const eventRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to student
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // Link to event
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Request status
});

module.exports = mongoose.model('EventRequest', eventRequestSchema);