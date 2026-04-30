import React from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import OpacityIcon from '@mui/icons-material/Opacity';
import AirIcon from '@mui/icons-material/Air';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

/**
 * WeatherInfo Component - Displays detailed weather information
 * @param {Object} data - Weather data object containing all weather information
 */
const WeatherInfo = ({ data }) => {
  /**
   * Get weather emoji icon based on condition
   * @param {string} condition - Weather condition (e.g., Clear, Clouds, Rain)
   * @returns {string} Emoji representing the weather condition
   */
  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear': return '☀️';
      case 'clouds': return '☁️';
      case 'rain': return '🌧️';
      case 'snow': return '❄️';
      case 'thunderstorm': return '⛈️';
      case 'drizzle': return '🌦️';
      case 'mist': 
      case 'haze': 
      case 'fog': return '🌫️';
      default: return '🌤️';
    }
  };

  /**
   * InfoItem Component - Reusable component for weather details
   * @param {Object} props - Component props
   * @param {Component} props.icon - MUI icon component
   * @param {string} props.label - Label for the info item
   * @param {string|number} props.value - Value to display
   * @param {string} props.unit - Unit of measurement
   */
  const InfoItem = ({ icon: Icon, label, value, unit }) => (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
      <Icon sx={{ color: '#a78bfa', fontSize: { xs: 22, sm: 28 } }} />
      <div className="flex-1 min-w-0">
        <Typography variant="caption" className="text-gray-300 block text-xs sm:text-sm">
          {label}
        </Typography>
        <Typography variant="body1" className="text-white font-semibold text-sm sm:text-base truncate">
          {value} {unit}
        </Typography>
      </div>
    </div>
  );

  return (
    <div className="mt-4 sm:mt-6">
      {/* Main Weather Display */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
          <LocationOnIcon sx={{ color: '#a78bfa', fontSize: { xs: 20, sm: 24 } }} />
          <Typography variant="h4" className="text-white font-bold text-xl sm:text-2xl md:text-3xl">
            {data.city}, {data.country}
          </Typography>
        </div>
        
        <div className="mb-3 sm:mb-4">
          <Typography variant="h1" className="text-5xl sm:text-6xl md:text-7xl font-bold text-white">
            {data.temperature}°C
          </Typography>
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            <span className="text-2xl sm:text-3xl">{getWeatherIcon(data.condition)}</span>
            <Typography variant="h6" className="text-gray-200 text-base sm:text-lg capitalize">
              {data.condition} - {data.description}
            </Typography>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-1">
            <ThermostatIcon sx={{ color: '#fbbf24', fontSize: { xs: 18, sm: 20 } }} />
            <Typography className="text-gray-200 text-sm sm:text-base">
              Feels like {data.feelsLike}°C
            </Typography>
          </div>
        </div>
      </div>

      <Divider sx={{ my: 2, sm: { my: 3 }, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* Weather Details Grid - Responsive Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <InfoItem icon={OpacityIcon} label="Humidity" value={data.humidity} unit="%" />
        <InfoItem icon={AirIcon} label="Wind Speed" value={data.windSpeed} unit="m/s" />
        <InfoItem icon={AccessTimeIcon} label="Local Time" value={data.localTime} unit="" />
        <InfoItem icon={WbTwilightIcon} label="Sunrise" value={data.sunrise} unit="" />
        <InfoItem icon={WbTwilightIcon} label="Sunset" value={data.sunset} unit="" />
      </div>

      {/* Weather Tip - Dynamic based on temperature */}
      <div className="mt-4 sm:mt-6 p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-center">
        <Typography variant="caption" className="text-gray-300 text-xs sm:text-sm">
           {data.temperature > 30 ? "🥵 It's very hot! Stay hydrated and avoid direct sunlight." :
               data.temperature > 25 ? "🌞 It's warm outside! Stay hydrated." :
               data.temperature < 10 ? "🧥 It's cold! Don't forget your jacket." : 
               data.temperature < 0 ? "❄️ Freezing weather! Bundle up warmly." :
               "😊 Perfect weather to go outside!"}
        </Typography>
      </div>
    </div>
  );
};

export default WeatherInfo;