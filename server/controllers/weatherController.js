/**
 * Weather Controller - Handles all weather-related business logic
 * Contains functions for fetching weather data, managing history, and location services
 */

const axios = require('axios');           // HTTP client for API calls
const SearchHistory = require('../models/SearchHistory');  // Database model

/**
 * Get Weather Data by City Name
 * Fetches current weather data from OpenWeatherMap API
 * @param {Object} req - Express request object containing city query param
 * @param {Object} res - Express response object
 * @returns {Object} Weather data or error message
 */
const getWeatherData = async (req, res) => {
  try {
    // Extract city name from query parameters
    const { city } = req.query;
    
    // Validate city parameter
    if (!city) {
      return res.status(400).json({ 
        success: false, 
        message: 'City name is required' 
      });
    }

    // Build OpenWeatherMap API URL
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    
    console.log(`Fetching weather for: ${city}`);
    
    // Make API call to OpenWeatherMap
    const response = await axios.get(url);
    const data = response.data;

    // Save to search history (non-blocking - don't fail if DB error)
    try {
      const searchEntry = new SearchHistory({ city: data.name });
      await searchEntry.save();
      console.log(`Saved search: ${data.name}`);
    } catch (dbError) {
      // Log error but don't fail the request
      console.error('Error saving search history:', dbError.message);
    }

    // Format and return weather data
    const weatherInfo = {
      success: true,
      data: {
        city: data.name,                    // City name from API
        country: data.sys.country,          // Country code (e.g., GB, US, IN)
        temperature: Math.round(data.main.temp),      // Temperature in Celsius
        feelsLike: Math.round(data.main.feels_like),  // Feels-like temperature
        condition: data.weather[0].main,    // Main weather condition (e.g., Clear, Rain)
        description: data.weather[0].description,     // Detailed description
        humidity: data.main.humidity,       // Humidity percentage
        windSpeed: data.wind.speed,         // Wind speed in m/s
        localTime: new Date().toLocaleTimeString(),   // Server local time
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),  // Sunrise time
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),    // Sunset time
        icon: data.weather[0].icon          // Weather icon code
      }
    };

    res.json(weatherInfo);
  } catch (error) {
    // Handle specific API errors
    console.error('Weather API Error:', error.message);
    
    // City not found (404 from OpenWeatherMap)
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ 
        success: false, 
        message: 'City not found. Please check the city name.' 
      });
    }
    
    // Invalid API key (401 from OpenWeatherMap)
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid API key' 
      });
    }
    
    // Generic server error
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get Search History
 * Retrieves recent search history from database (last 10 entries)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} List of recent searches
 */
const getSearchHistory = async (req, res) => {
  try {
    // Fetch last 10 searches, newest first
    const history = await SearchHistory.find()
      .sort({ searchedAt: -1 })  // -1 = descending (newest first)
      .limit(10);
    
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('History fetch error:', error.message);
    // Return empty array on error to avoid breaking frontend
    res.json({ success: true, data: [] });
  }
};

/**
 * Delete Single History Item
 * Deletes a specific search history entry by ID
 * @param {Object} req - Express request object with id parameter
 * @param {Object} res - Express response object
 * @returns {Object} Success or error message
 */
const deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete document by ID
    const deletedItem = await SearchHistory.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'History item not found' 
      });
    }
    
    console.log(`Deleted history item: ${deletedItem.city}`);
    res.json({ 
      success: true, 
      message: 'History item deleted successfully' 
    });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting history item' 
    });
  }
};

/**
 * Delete All History
 * Clears entire search history collection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
const deleteAllHistory = async (req, res) => {
  try {
    // Delete all documents in the collection
    const result = await SearchHistory.deleteMany({});
    console.log(`Deleted ${result.deletedCount} history items`);
    
    res.json({ 
      success: true, 
      message: 'All history deleted successfully' 
    });
  } catch (error) {
    console.error('Delete all error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting all history' 
    });
  }
};

/**
 * Get Weather by Coordinates (Primary Location Method)
 * Fetches weather data directly using latitude and longitude
 * This is the most accurate method for current location
 * @param {Object} req - Express request object with lat, lon query params
 * @param {Object} res - Express response object
 * @returns {Object} Weather data for the coordinates
 */
const getWeatherByCoordinates = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    // Validate coordinates
    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    // Direct weather API by coordinates - no intermediate mapping needed
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    console.log(`📍 Fetching weather for coordinates: ${lat}, ${lon}`);
    const response = await axios.get(url);
    const data = response.data;

    // Format weather data (same structure as getWeatherData)
    const weatherInfo = {
      success: true,
      data: {
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        localTime: new Date().toLocaleTimeString(),
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
        icon: data.weather[0].icon
      }
    };

    res.json(weatherInfo);
  } catch (error) {
    console.error('Location weather error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Could not get weather for your location' 
    });
  }
};

/**
 * Reverse Geocoding - Get City Name from Coordinates
 * Converts latitude/longitude to city name (optional - for display only)
 * Not essential for weather fetching but useful for UI
 * @param {Object} req - Express request object with lat, lon query params
 * @param {Object} res - Express response object
 * @returns {Object} City and country names
 */
const getCityFromCoordinates = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    // OpenWeatherMap Geo API for reverse geocoding
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    if (data && data.length > 0) {
      res.json({ 
        success: true, 
        city: data[0].name,
        country: data[0].country
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Could not detect your city' 
      });
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error detecting location' 
    });
  }
};

/**
 * Get City Suggestions (Autocomplete)
 * Provides real-time city name suggestions as user types
 * Used by SearchBar component for autocomplete functionality
 * @param {Object} req - Express request object with query parameter
 * @param {Object} res - Express response object
 * @returns {Array} List of matching city suggestions (max 8)
 */
const getCitySuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    // Don't search on very short queries (minimum 2 characters)
    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    // OpenWeatherMap Geo API for direct geocoding (city search)
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=8&appid=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    // Format suggestions for frontend
    const suggestions = data.map(item => ({
      name: item.name,           // City name
      country: item.country,     // Country code
      state: item.state || '',   // State/province (if available)
      lat: item.lat,            // Latitude for potential future use
      lon: item.lon             // Longitude for potential future use
    }));
    
    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Suggestions error:', error.message);
    // Return empty array on error - don't break the search experience
    res.json({ success: true, data: [] });
  }
};

// Export all controller functions for use in routes
module.exports = { 
  getWeatherData, 
  getSearchHistory, 
  deleteHistoryItem, 
  deleteAllHistory,
  getCityFromCoordinates,
  getCitySuggestions,
  getWeatherByCoordinates
};