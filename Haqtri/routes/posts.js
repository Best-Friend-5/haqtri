// C:\Users\Abz\Downloads\Haqtri\Haqtri\server\routes\posts.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getPosts, createPost, likePost, commentPost, sharePost, bookmarkPost } = require('../controllers/postController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { files: 4, fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
}).fields([
  { name: 'images', maxCount: 4 },
  { name: 'content', maxCount: 1 },
  { name: 'visibility', maxCount: 1 },
]);

router.get('/', authMiddleware, getPosts);
router.post('/', authMiddleware, upload, createPost);
router.post('/:postId/like', authMiddleware, likePost);
router.post('/:postId/comment', authMiddleware, commentPost);
router.post('/:postId/share', authMiddleware, sharePost);
router.post('/:postId/bookmark', authMiddleware, bookmarkPost);

module.exports = router;