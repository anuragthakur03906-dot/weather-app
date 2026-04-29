import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import toast from 'react-hot-toast';

/**
 * SearchHistory Component - Displays and manages search history
 * @param {Function} onCitySelect - Callback when a city is selected from history
 */
const SearchHistory = ({ onCitySelect }) => {
  // State Management
  const [history, setHistory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  // Fetch search history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  /**
   * Fetch search history from API
   */
  const fetchHistory = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/weather/history`);
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load search history');
    }
  };

  /**
   * Handle city click - Trigger search if not in delete mode
   * @param {string} city - City name to search
   */
  const handleCityClick = (city) => {
    if (!deleteMode && onCitySelect) {
      onCitySelect(city);
    }
  };

  /**
   * Handle checkbox selection for batch deletion
   * @param {string} itemId - ID of the item to select/deselect
   */
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  /**
   * Delete selected history items
   */
  const handleDeleteSelected = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Delete each selected item individually
      for (const id of selectedItems) {
        await axios.delete(`${API_URL}/weather/history/${id}`);
      }
      
      toast.success(`${selectedItems.length} item(s) deleted successfully`);
      setSelectedItems([]);
      setDeleteMode(false);
      await fetchHistory(); // Refresh history
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting items:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete items';
      toast.error(errorMsg);
    }
  };

  /**
   * Delete all search history
   */
  const handleDeleteAll = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.delete(`${API_URL}/weather/history`);
      
      toast.success('All history deleted successfully');
      setHistory([]);
      setSelectedItems([]);
      setDeleteMode(false);
      setDeleteAllDialogOpen(false);
    } catch (error) {
      console.error('Error deleting all history:', error);
      toast.error(error.response?.data?.message || 'Failed to delete all history');
    }
  };

  /**
   * Toggle delete mode on/off
   */
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedItems([]);
  };

  // Empty state UI
  if (history.length === 0) {
    return (
      <div className="glassmorphism p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <HistoryIcon sx={{ color: '#60A5FA' }} />
          <Typography variant="h6" className="text-white text-base sm:text-lg">
            Recent Searches
          </Typography>
        </div>
        <Typography variant="body2" className="text-gray-400 text-center py-4 text-sm sm:text-base">
          No search history yet. Search for a city to see it here!
        </Typography>
      </div>
    );
  }

  return (
    <div className="glassmorphism p-3 sm:p-4">
      {/* Header Section with Actions */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <HistoryIcon sx={{ color: '#60A5FA', fontSize: { xs: 20, sm: 24 } }} />
          <Typography variant="h6" className="text-white text-base sm:text-lg">
            Recent Searches
          </Typography>
          {history.length > 0 && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-gray-300">
              {history.length}
            </span>
          )}
        </div>
        
        <div className="flex gap-1">
          {!deleteMode ? (
            <IconButton 
              onClick={toggleDeleteMode}
              sx={{ color: '#ef4444', size: 'small' }}
              title="Delete mode"
              className="hover:bg-red-500/10"
            >
              <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          ) : (
            <>
              {selectedItems.length > 0 && (
                <IconButton 
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ color: '#ef4444' }}
                  title="Delete selected"
                  className="hover:bg-red-500/10"
                >
                  <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </IconButton>
              )}
              <IconButton 
                onClick={() => setDeleteAllDialogOpen(true)}
                sx={{ color: '#ef4444' }}
                title="Delete all"
                className="hover:bg-red-500/10"
              >
                <DeleteSweepIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
              <Button 
                onClick={toggleDeleteMode}
                size="small"
                sx={{ color: '#60A5FA', textTransform: 'none' }}
                className="text-xs sm:text-sm"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* History List - Responsive */}
      <List sx={{ maxHeight: { xs: 300, sm: 400 }, overflow: 'auto' }}>
        {history.map((item) => (
          <ListItem
            key={item._id}
            secondaryAction={
              !deleteMode ? (
                <IconButton 
                  edge="end" 
                  onClick={() => handleCityClick(item.city)}
                  sx={{ color: '#60A5FA' }}
                  className="hover:bg-blue-500/10"
                >
                  <SearchIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </IconButton>
              ) : (
                <Checkbox
                  edge="end"
                  checked={selectedItems.includes(item._id)}
                  onChange={() => handleSelectItem(item._id)}
                  sx={{ 
                    color: '#60A5FA',
                    '&.Mui-checked': {
                      color: '#60A5FA',
                    }
                  }}
                />
              )
            }
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
              },
              cursor: deleteMode ? 'default' : 'pointer',
              px: { xs: 1, sm: 2 },
            }}
            onClick={() => handleCityClick(item.city)}
          >
            <ListItemText
              primary={
                <Typography className="text-white font-medium text-sm sm:text-base truncate">
                  {item.city}
                </Typography>
              }
              secondary={
                <Typography variant="caption" className="text-gray-400 text-xs">
                  {new Date(item.searchedAt).toLocaleDateString()} at{' '}
                  {new Date(item.searchedAt).toLocaleTimeString()}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Delete Selected Confirmation Dialog - Theme Matched */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { 
            bgcolor: '#1a1a1a',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            margin: '16px',
            width: 'calc(100% - 32px)',
            maxWidth: '500px'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white',
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          pb: 1
        }}>
          <div className="flex items-center gap-2">
            <DeleteIcon sx={{ color: '#ef4444' }} />
            Delete Selected Items
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ 
            color: '#9ca3af',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Are you sure you want to delete <span className="text-red-400 font-semibold">{selectedItems.length}</span> selected item(s)?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ 
              color: '#60A5FA',
              '&:hover': { backgroundColor: 'rgba(96, 165, 250, 0.1)' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteSelected} 
            sx={{ 
              color: '#ef4444',
              '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Confirmation Dialog - Theme Matched */}
      <Dialog 
        open={deleteAllDialogOpen} 
        onClose={() => setDeleteAllDialogOpen(false)}
        PaperProps={{
          sx: { 
            bgcolor: '#1a1a1a',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            margin: '16px',
            width: 'calc(100% - 32px)',
            maxWidth: '500px'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white',
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          pb: 1
        }}>
          <div className="flex items-center gap-2">
            <DeleteSweepIcon sx={{ color: '#ef4444' }} />
            Delete All History
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ 
            color: '#9ca3af',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Are you sure you want to delete <span className="text-red-400 font-semibold">all</span> search history?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button 
            onClick={() => setDeleteAllDialogOpen(false)} 
            sx={{ 
              color: '#60A5FA',
              '&:hover': { backgroundColor: 'rgba(96, 165, 250, 0.1)' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAll} 
            sx={{ 
              color: '#ef4444',
              '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
            }}
          >
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SearchHistory;