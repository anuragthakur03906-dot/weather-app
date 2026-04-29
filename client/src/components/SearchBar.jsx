import React, { useState, useEffect, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

/**
 * SearchBar Component - Handles city search with autocomplete suggestions
 * @param {Function} onSearch - Callback function when search is performed
 * @param {boolean} loading - Loading state for search
 * @param {Function} setWeatherData - Function to set weather data directly
 */
const SearchBar = ({ onSearch, loading, setWeatherData }) => {
  // State Management
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);

  /**
   * Fetch city suggestions from API based on search text
   * @param {string} searchText - Text to search for city suggestions
   */
  const fetchSuggestions = async (searchText) => {
    if (searchText.length < 2) {
      setSuggestions([]);
      return;
    }

    setSuggestionsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/weather/suggestions`, {
        params: { query: searchText }
      });
      
      if (response.data.success && response.data.data) {
        setSuggestions(response.data.data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (city.trim()) {
        fetchSuggestions(city.trim());
      } else {
        setSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [city]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  /**
   * Handle suggestion click - Set city and trigger search
   * @param {Object} suggestion - Selected city suggestion object
   */
  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch(suggestion.name);
  };

  /**
   * Handle form submission - Search for entered city
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      setShowSuggestions(false);
      onSearch(city.trim());
    }
  };

  /**
   * Get weather data for user's current location
   * Uses browser's geolocation API
   */
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log(`Got location: ${latitude}, ${longitude}`);
          
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          
          // Direct weather fetch by coordinates
          const response = await fetch(
            `${API_URL}/weather/coordinates?lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data.success && data.data) {
            console.log(`Weather for your location: ${data.data.city}`);
            if (setWeatherData) {
              setWeatherData(data.data);
            } else if (onSearch) {
              onSearch(data.data.city);
            }
          } else {
            alert('Could not get weather for your location. Please try again.');
          }
        } catch (error) {
          console.error('Location error:', error);
          alert('Error detecting your location. Please try again.');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationLoading(false);
        
        let message = 'Unable to get your location. ';
        if (error.code === 1) {
          message += 'Please allow location access.';
        } else if (error.code === 2) {
          message += 'Location unavailable.';
        } else if (error.code === 3) {
          message += 'Request timed out.';
        }
        alert(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          {/* Search Input Field */}
          <input
            type="text"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            disabled={loading || locationLoading}
            placeholder="Search city (e.g., London, Mumbai, New York)..."
            className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-white/20 focus:border-blue-400 focus:outline-none transition-all disabled:opacity-50 text-sm sm:text-base"
            style={{ paddingRight: '90px' }}
          />
          
          {/* Action Buttons Container */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            {/* Location Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={loading || locationLoading}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white disabled:opacity-50"
              title="Use my current location"
            >
              {locationLoading ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : (
                <LocationOnIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
              )}
            </button>
            
            {/* Search Button */}
            <button
              type="submit"
              disabled={loading || !city.trim()}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white disabled:opacity-50"
              title="Search city"
            >
              {suggestionsLoading ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : (
                <SearchIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown - Responsive */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute z-10 w-full mt-1 max-h-60 sm:max-h-80 overflow-auto rounded-lg shadow-lg"
          style={{
            backgroundColor: 'rgba(32, 32, 43, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.name}-${suggestion.country}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer transition-colors ${
                selectedIndex === index ? 'bg-blue-500/30' : 'hover:bg-white/10'
              }`}
            >
              <LocationCityIcon sx={{ color: '#60A5FA', fontSize: { xs: 18, sm: 20 } }} />
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm sm:text-base truncate">
                  {suggestion.name}
                  {suggestion.state && (
                    <span className="text-gray-300 ml-1 text-xs sm:text-sm">({suggestion.state})</span>
                  )}
                </div>
                <div className="text-gray-400 text-xs sm:text-sm truncate">{suggestion.country}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;