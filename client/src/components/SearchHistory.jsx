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

const SearchHistory = ({ onCitySelect }) => {
  const [history, setHistory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

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

  const handleCityClick = (city) => {
    if (!deleteMode && onCitySelect) {
      onCitySelect(city);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      for (const id of selectedItems) {
        await axios.delete(`${API_URL}/weather/history/${id}`);
      }

      toast.success(`${selectedItems.length} item(s) deleted successfully`);
      setSelectedItems([]);
      setDeleteMode(false);
      await fetchHistory();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting items:', error);
      toast.error('Failed to delete items');
    }
  };

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
      toast.error('Failed to delete all history');
    }
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedItems([]);
  };

  // Empty State
  if (history.length === 0) {
    return (
      <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <HistoryIcon sx={{ color: '#a78bfa' }} />
          <Typography className="text-white">Recent Searches</Typography>
        </div>
        <Typography className="text-gray-400 text-center py-4">
          No search history yet
        </Typography>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HistoryIcon sx={{ color: '#a78bfa' }} />
          <Typography className="text-white">Recent Searches</Typography>
        </div>

        <div className="flex gap-1">
          {!deleteMode ? (
            <IconButton onClick={toggleDeleteMode} sx={{ color: '#f87171' }} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          ) : (
            <>
              {selectedItems.length > 0 && (
                <IconButton onClick={() => setDeleteDialogOpen(true)} sx={{ color: '#f87171' }} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton onClick={() => setDeleteAllDialogOpen(true)} sx={{ color: '#f87171' }} size="small">
                <DeleteSweepIcon fontSize="small" />
              </IconButton>
              <Button onClick={toggleDeleteMode} sx={{ color: '#a78bfa', textTransform: 'none', fontSize: '0.75rem' }}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* List */}
      <List sx={{ maxHeight: 350, overflow: 'auto' }}>
        {history.map((item) => (
          <ListItem
            key={item._id}
            onClick={() => handleCityClick(item.city)}
            sx={{
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1 },
              cursor: 'pointer',
              borderRadius: 1,
              mb: 0.5
            }}
            secondaryAction={
              !deleteMode ? (
                <IconButton onClick={() => handleCityClick(item.city)} sx={{ color: '#a78bfa' }} size="small">
                  <SearchIcon fontSize="small" />
                </IconButton>
              ) : (
                <Checkbox
                  checked={selectedItems.includes(item._id)}
                  onChange={() => handleSelectItem(item._id)}
                  sx={{ 
                    color: '#a78bfa',
                    '&.Mui-checked': { color: '#a78bfa' }
                  }}
                  size="small"
                />
              )
            }
          >
            <ListItemText
              primary={<span className="text-white text-sm">{item.city}</span>}
              secondary={
                <span className="text-gray-400 text-xs">
                  {new Date(item.searchedAt).toLocaleString()}
                </span>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Delete Selected Dialog - Themed */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontSize: '1.1rem' }}>
          Delete Selected Items
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#d1d5db' }}>
            Are you sure you want to delete <span style={{ color: '#f87171' }}>{selectedItems.length}</span> selected item(s)?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#a78bfa' }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteSelected} sx={{ color: '#f87171' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Dialog - Themed */}
      <Dialog
        open={deleteAllDialogOpen}
        onClose={() => setDeleteAllDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontSize: '1.1rem' }}>
          Delete All History
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#d1d5db' }}>
            Are you sure you want to delete <span style={{ color: '#f87171' }}>all</span> search history?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllDialogOpen(false)} sx={{ color: '#a78bfa' }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAll} sx={{ color: '#f87171' }}>
            Delete All
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default SearchHistory;