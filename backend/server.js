require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const eventRequestRoutes = require('./routes/eventRequests');
const attendanceRoutes = require('./routes/attendance');
const mentorshipRoutes = require('./routes/mentorship');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user'); 
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection failed:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-requests', eventRequestRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/mentorships', mentorshipRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes); // Ensure this line is present

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));