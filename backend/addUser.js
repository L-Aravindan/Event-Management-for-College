const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust the path to your User model

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/OD-new', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const addUser = async () => {
    const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123', // This will be hashed
        role: 'student' // Can be 'student', 'faculty', or 'admin'
    };

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create a new user
        const newUser = new User({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role
        });

        // Save the user to the database
        await newUser.save();
        console.log('User added successfully:', newUser);
    } catch (err) {
        console.error('Error adding user:', err);
    } finally {
        mongoose.disconnect();
    }
};

addUser();