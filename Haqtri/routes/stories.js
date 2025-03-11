// C:\Users\Abz\Downloads\Haqtri\Haqtri\server\routes\stories.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { createStory } = require('../controllers/postController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { files: 1, fileSize: 5 * 1024 * 1024 }, // 5MB limit, single file
}).single('image');

router.post('/', authMiddleware, upload, createStory);

module.exports = router;