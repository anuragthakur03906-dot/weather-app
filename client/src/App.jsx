import React, { useState, useCallback } from 'react';
import WeatherCard from './components/WeatherCard';
import SearchHistory from './components/SearchHistory';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';

// Custom Material-UI theme configuration
const theme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
          },
        },
      },
    },
  },
});

/**
 * Main App Component - Root component of the application
 * Manages layout and communication between WeatherCard and SearchHistory
 */
function App() {
  // State Management
  const [refreshHistory, setRefreshHistory] = useState(false);

  /**
   * Handle search completion - Trigger history refresh
   */
  const handleSearchComplete = () => {
    setRefreshHistory(prev => !prev);
  };

  /**
   * Handle city selection from history
   * Dispatches custom event to WeatherCard component
   * @param {string} city - City name to search
   */
  const handleCitySelect = useCallback((city) => {
    // Dispatch custom event for WeatherCard to listen to
    window.dispatchEvent(new CustomEvent('searchCity', { detail: city }));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
        {/* Responsive Layout - Stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-6xl w-full">
          {/* Main Weather Card - Takes remaining space */}
          <div className="flex-1">
            <WeatherCard 
              onSearchComplete={handleSearchComplete}
              key={refreshHistory} // Re-render when history refreshes
            />
          </div>
          
          {/* Search History Sidebar - Full width on mobile, fixed width on desktop */}
          <div className="lg:w-80 w-full">
            <SearchHistory onCitySelect={handleCitySelect} />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;