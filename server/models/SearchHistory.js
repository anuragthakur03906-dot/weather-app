/**
 * Search History Model - MongoDB schema for storing user search history
 * Tracks all city searches performed by users
 */

const mongoose = require('mongoose');

/**
 * SearchHistory Schema Definition
 * Defines the structure of documents in the search_history collection
 */
const searchHistorySchema = new mongoose.Schema({
  /**
   * City Name - The searched city
   * @type {String}
   * @required
   * @trim - Removes whitespace from both ends
   */
  city: {
    type: String,
    required: true,
    trim: true
  },
  
  /**
   * Search Timestamp - When the city was searched
   * @type {Date}
   * @default - Automatically set to current date/time
   */
  searchedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Database Indexes for Performance
 * Creates index on searchedAt field for faster sorting queries
 * Sorted in descending order (-1) to show recent searches first
 */
searchHistorySchema.index({ searchedAt: -1 });

/**
 * Create and export the model
 * Model name: 'SearchHistory' -> Maps to 'searchhistories' collection in MongoDB
 */
module.exports = mongoose.model('SearchHistory', searchHistorySchema);