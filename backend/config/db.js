const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        await mongoose.connect(mongoURI);
        console.log("mongodb connected");
    } catch (e) {
        console.log("mongodb not connected", e.message);
    }
}

module.exports = connectDB;
