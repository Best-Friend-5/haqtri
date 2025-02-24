const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  getArchitects, 
  getArchitectById, 
  createArchitectProfile, 
  updateArchitectProfile, 
  deleteArchitectProfile, 
  getArchitectsBySpecialty 
} = require('../controllers/architectController');

// Public routes (no authentication required)
// Get all architects with optional filtering (location, specialty, minRating)
router.get('/', getArchitects);

// Get a specific architect by ID
router.get('/:architectId', getArchitectById);

// Get architects by specialty
router.get('/specialty/:specialty', getArchitectsBySpecialty);

// Protected routes (require authentication)
// Create a new architect profile
router.post('/', authMiddleware, createArchitectProfile);

// Update an existing architect profile
router.put('/:architectId', authMiddleware, updateArchitectProfile);

// Delete an architect profile
router.delete('/:architectId', authMiddleware, deleteArchitectProfile);

module.exports = router;