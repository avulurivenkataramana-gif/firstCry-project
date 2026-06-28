const mongoose = require('mongoose');

let isMockDB = false;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/curriculum_planner';
    console.log(`Connecting to MongoDB at: ${mongoURI}...`);
    
    // Set connection timeout to 3 seconds for fast fallback if DB is not running
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    
    console.log('MongoDB Connected successfully!');
    isMockDB = false;
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: MongoDB connection failed in production mode. Exiting process...');
      process.exit(1);
    }
    console.log('WARNING: Falling back to in-memory Mock Database for temporary data persistence.');
    isMockDB = true;
  }
};

const checkIsMock = () => isMockDB;

module.exports = {
  connectDB,
  checkIsMock
};
