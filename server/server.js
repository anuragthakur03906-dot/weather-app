/**
 * Main Server File - Entry point for the Weather App Backend
 * Sets up Express server, MongoDB connection, and middleware
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const weatherRoutes = require('./routes/weather');

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// ==================== MIDDLEWARE ====================
/**
 * CORS (Cross-Origin Resource Sharing) - Allows frontend to communicate with backend
 * Enables requests from different origins (e.g., React dev server on port 5173)
 */
app.use(cors());

/**
 * JSON Parser - Automatically parses incoming JSON requests
 * Makes req.body available in route handlers
 */
app.use(express.json());

// ==================== DATABASE CONNECTION ====================
/**
 * MongoDB Connection
 * Uses connection string from environment variables
 * Logs success or error status
 */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ==================== ROUTES ====================
/**
 * Weather API Routes
 * All routes will be prefixed with /api/weather
 * Example: http://localhost:5000/api/weather/city?city=London
 */
app.use('/api/weather', weatherRoutes);

// ==================== SERVER STARTUP ====================
/**
 * Start Express server on specified port
 * Default port is 5000 if not provided in environment variables
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/weather`);
});