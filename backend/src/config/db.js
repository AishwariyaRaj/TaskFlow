const mongoose = require('mongoose');
const logger = console;

async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI is required');
  try {
    await mongoose.connect(uri);
    logger.log('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error', err);
    // Remove process.exit(1) to prevent crashing the Vercel worker
  }
}

module.exports = connectDB;
