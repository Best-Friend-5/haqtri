const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  getProperties, 
  getPropertyById, 
  createProperty, 
  updateProperty, 
  deleteProperty, 
  addInventory, 
  getConstructionProjects, 
  createConstructionProject 
} = require('../controllers/propertyController');

// Public routes (no authentication required)
// Get all properties with optional filtering (location, size, ownerId)
router.get('/', getProperties);

// Get a specific property by ID
router.get('/:propertyId', getPropertyById);

// Get construction projects for a specific property
router.get('/:propertyId/projects', getConstructionProjects);

// Protected routes (require authentication)
// Create a new property
router.post('/', authMiddleware, createProperty);

// Update an existing property
router.put('/:propertyId', authMiddleware, updateProperty);

// Delete a property
router.delete('/:propertyId', authMiddleware, deleteProperty);

// Add inventory to a property
router.post('/:propertyId/inventory', authMiddleware, addInventory);

// Create a construction project for a property
router.post('/:propertyId/projects', authMiddleware, createConstructionProject);

module.exports = router;