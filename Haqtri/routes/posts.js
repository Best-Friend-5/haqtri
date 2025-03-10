// server/routes/posts.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getPosts, createPost, likePost, commentPost, sharePost, bookmarkPost } = require('../controllers/postController');

router.get('/', authMiddleware, getPosts);
router.post('/', authMiddleware, createPost);
router.post('/:postId/like', authMiddleware, likePost);
router.post('/:postId/comment', authMiddleware, commentPost);
router.post('/:postId/share', authMiddleware, sharePost);
router.post('/:postId/bookmark', authMiddleware, bookmarkPost);

module.exports = router;