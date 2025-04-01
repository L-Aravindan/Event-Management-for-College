const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const applicantSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'approved'],
        default: 'pending'
    }
});

const eventSchema = new Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    club: { type: String, required: true },
    venue: { type: String, required: true },
    description: { type: String, required: true },
    image: { 
        type: String, 
        default: null 
    },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    applicants: [applicantSchema],
    attendanceCode: { type: String },
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    status: { 
        type: String, 
        enum: ['Attendance Open', 'Attendance Closed', 'Scheduled'], 
        default: 'Scheduled' 
    },
});

module.exports = mongoose.model('Event', eventSchema);