const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { createStory } = require('../controllers/postController');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save uploaded files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using the current timestamp and original filename
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Configure multer upload middleware
const upload = multer({
  storage,
  limits: { 
    files: 1, // Allow only one file per request
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Validate file type (only allow images)
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Only image files are allowed!'), false); // Reject the file
    }
  },
}).single('image'); // Accept a single file with the field name 'image'

// POST /api/users/stories - Create a new story
router.post('/', authMiddleware, (req, res, next) => {
  // Use the upload middleware to handle file upload
  upload(req, res, (err) => {
    if (err) {
      // Handle multer errors (e.g., file size exceeded, invalid file type)
      return res.status(400).json({ message: err.message });
    }
    // If no file is uploaded, return an error
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }
    // Proceed to the createStory controller
    next();
  });
}, createStory);

module.exports = router;