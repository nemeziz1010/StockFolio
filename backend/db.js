// backend/db.js
const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const MONGO_URI = 'mongodb://localhost:27017/stockNews'; 

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;