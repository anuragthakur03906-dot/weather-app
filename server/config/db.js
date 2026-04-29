/**
 * Database Configuration Module
 * Handles MongoDB connection setup and management
 * Provides reusable connection function
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Database
 * Uses connection string from environment variables
 * Implements modern connection options (deprecated options removed)
 * @returns {Promise} Mongoose connection object
 */
const connectDB = async () => {
  try {
    // Establish MongoDB connection using Mongoose
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Note: useNewUrlParser and useUnifiedTopology are now default in Mongoose 6+
      // No need to specify them explicitly
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    // Log detailed error information
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // Exit process with failure code
    // This prevents the app from running without database connection
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB (for graceful shutdown)
 * Used when closing the application
 * @returns {Promise} Disconnection result
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('MongoDB Disconnection Error:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };