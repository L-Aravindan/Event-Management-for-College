const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB Atlas connection error:', err));

const User = require('./models/User'); // Adjust the path to your User model

const hashAndUpdatePassword = async () => {
    const email = 'andrewroshan@gmail.com'; // Replace with the user's email
    const newPassword = 'andrew123'; // Replace with the new password

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        const result = await User.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        console.log('Password updated successfully:', result);
    } catch (err) {
        console.error('Error updating password:', err);
    } finally {
        mongoose.disconnect();
    }
};

hashAndUpdatePassword();