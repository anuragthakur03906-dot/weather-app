/**
 * Weather Routes - Defines all API endpoints for weather functionality
 * Handles routing for weather data, search history, and location services
 */

const express = require('express');
const { 
  getWeatherData,           // Get weather by city name
  getSearchHistory,         // Fetch search history from database
  deleteHistoryItem,        // Delete single history entry
  deleteAllHistory,         // Clear entire search history
  getCityFromCoordinates,   // Reverse geocoding (coordinates to city name)
  getCitySuggestions,       // Autocomplete suggestions for city names
  getWeatherByCoordinates   // Get weather directly using coordinates
} = require('../controllers/weatherController');

// Create router instance
const router = express.Router();

// ==================== WEATHER ROUTES ====================

/**
 * GET /api/weather/
 * @query {string} city - Name of the city to get weather for
 * @returns {Object} Weather data for the specified city
 * @example GET /api/weather/?city=London
 */
router.get('/', getWeatherData);

/**
 * GET /api/weather/history
 * @returns {Array} List of recent search history (limited to 10 items)
 * @example GET /api/weather/history
 */
router.get('/history', getSearchHistory);

/**
 * GET /api/weather/reverse
 * @query {number} lat - Latitude coordinate
 * @query {number} lon - Longitude coordinate
 * @returns {Object} City name and country from coordinates
 * @example GET /api/weather/reverse?lat=51.5074&lon=-0.1278
 */
router.get('/reverse', getCityFromCoordinates);

/**
 * GET /api/weather/suggestions
 * @query {string} query - Partial city name for autocomplete
 * @returns {Array} List of matching city suggestions
 * @example GET /api/weather/suggestions?query=Lon
 */
router.get('/suggestions', getCitySuggestions);

/**
 * GET /api/weather/coordinates
 * @query {number} lat - Latitude coordinate
 * @query {number} lon - Longitude coordinate
 * @returns {Object} Direct weather data for the coordinates
 * @example GET /api/weather/coordinates?lat=51.5074&lon=-0.1278
 */
router.get('/coordinates', getWeatherByCoordinates);

// ==================== HISTORY MANAGEMENT ROUTES ====================

/**
 * DELETE /api/weather/history/:id
 * @param {string} id - MongoDB document ID of history entry
 * @returns {Object} Success/failure message
 * @example DELETE /api/weather/history/65a1b2c3d4e5f6g7h8i9j0k1
 */
router.delete('/history/:id', deleteHistoryItem);

/**
 * DELETE /api/weather/history
 * @returns {Object} Success message confirming all history deleted
 * @example DELETE /api/weather/history
 */
router.delete('/history', deleteAllHistory);

module.exports = router;