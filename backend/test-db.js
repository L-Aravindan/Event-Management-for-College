const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Atlas Database connected successfully');
    mongoose.disconnect();
}).catch(err => {
    console.error('Atlas Database connection failed:', err);
});