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
app.use(cors({
    origin: ['http://localhost:5173', 'https://event-management-for-college.vercel.app'],
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-requests', eventRequestRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/mentorships', mentorshipRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes); // Ensure this line is present

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));