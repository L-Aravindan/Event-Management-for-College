const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin'], // Example roles
        required: true,
    },
    registerNumber: { type: Number },
    classCoordinator: { type: String },
    branch: { type: String },
    department: { type: String },
    year: { type: String },
    section: { type: String },
    mobileNumber: { type: String },
    designation: { type: String }, // Add designation field
    officeRoom: { type: String }, // Add office room field
    contactNumber: { type: String }, // Add contact number field
}, { timestamps: true });

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Create and export the User model
module.exports = mongoose.model('User', userSchema);