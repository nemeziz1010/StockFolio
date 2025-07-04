const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // It's better practice to use process.env, but your hardcoded URI will also work.
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stockNews');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // THIS IS THE CRITICAL CHANGE: We must return the client promise for the session store.
    return conn.connection.getClient();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
