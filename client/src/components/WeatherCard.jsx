import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import SearchBar from './SearchBar';
import WeatherInfo from './WeatherInfo';
import CircularProgress from '@mui/material/CircularProgress';
import WeatherLogo from './WeatherLogo';


/**
 * WeatherCard Component - Main weather display component
 * @param {Function} onSearchComplete - Callback when search completes successfully
 * @param {number} searchTrigger - Trigger value to force search refresh
 */
const WeatherCard = ({ onSearchComplete, searchTrigger }) => {
  // State Management
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen for custom search events from history component
  useEffect(() => {
    const handleCustomSearch = (event) => {
      if (event.detail) {
        fetchWeather(event.detail);
      }
    };

    window.addEventListener('searchCity', handleCustomSearch);
    return () => window.removeEventListener('searchCity', handleCustomSearch);
  }, []);

  /**
   * Fetch weather data for a specific city
   * @param {string} city - City name to fetch weather for
   */
  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/weather`, { params: { city } });

      if (response.data.success) {
        setWeatherData(response.data.data);
        toast.success(`☁️ Weather data for ${response.data.data.city} loaded!`);
        if (onSearchComplete) onSearchComplete();
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch weather data';
      setError(errorMessage);
      toast.error(errorMessage);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glassmorphism p-4 sm:p-6 md:p-8 transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
          },
          duration: 3000,
        }}
      />

      {/* Header Section */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <WeatherLogo size="medium" animation="pulse" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Weather App
          </h1>
        </div>
        <p className="text-gray-300 mt-2 text-sm sm:text-base">
          Get real-time weather updates for any city
        </p>
      </div>

      {/* Search Bar Component */}
      <SearchBar
        onSearch={fetchWeather}
        loading={loading}
        setWeatherData={setWeatherData}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <CircularProgress sx={{ color: 'white' }} />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-6 sm:py-8">
          <div className="text-red-400 bg-red-400/10 rounded-lg p-3 sm:p-4">
            <p className="font-semibold text-sm sm:text-base">⚠️ {error}</p>
            <p className="text-xs sm:text-sm mt-2">Please try searching for another city</p>
          </div>
        </div>
      )}

      {/* Weather Data Display */}
      {weatherData && !loading && !error && (
        <WeatherInfo data={weatherData} />
      )}
    </div>
  );
};

export default WeatherCard;