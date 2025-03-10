// server/controllers/postController.js
const { Posts, User, Likes, Comments, Bookmark, Stories } = require('../models');
const multer = require('multer');
const path = require('path');

const API_BASE_URL = 'http://localhost:5001'; // Updated to match server port

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage }).array('images', 4);

const getPosts = async (req, res) => {
  try {
    const posts = await Posts.findAll({
      where: { visibility: 'public' },
      include: [
        { 
          model: User, 
          attributes: ['first_name', 'last_name', 'profile_picture_url', 'verified', 'country_code'], 
          as: 'user' 
        },
        { model: Likes, as: 'postLikes' },
      ],
      order: [['created_at', 'DESC']],
    });

    const formattedPosts = posts.map(post => ({
      post_id: post.post_id,
      user: `${post.user.first_name} ${post.user.last_name}`,
      user_image: post.user.profile_picture_url ? `${API_BASE_URL}${post.user.profile_picture_url}` : '/images/profpic2.jpg',
      verified: post.user.verified,
      country_code: post.user.country_code,
      location: post.location || post.user.city || 'Unknown',
      time: post.created_at,
      content: post.content,
      media_path: post.media_path ? JSON.parse(post.media_path) : [],
      likes: post.likes || 0,
      comments: post.comments || 0,
      shares: post.shares || 0,
    }));
    res.status(200).json(formattedPosts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: err.message });
  }
};

const createPost = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: 'Image upload failed' });

    try {
      const { content, location, visibility } = req.body;
      const images = req.files ? req.files.map(file => `${API_BASE_URL}/uploads/${file.filename}`) : [];

      const user = await User.findByPk(req.user.id);
      const post = await Posts.create({
        user_id: req.user.id,
        content,
        media_path: images.length ? JSON.stringify(images) : null,
        location: location || user.city || 'Unknown',
        visibility: visibility || 'public',
        created_at: new Date(),
        likes: 0,
        comments: 0,
        shares: 0,
      });

      res.status(201).json({
        post: {
          post_id: post.post_id,
          user: `${user.first_name} ${user.last_name}`,
          user_image: user.profile_picture_url ? `${API_BASE_URL}${user.profile_picture_url}` : '/images/profpic2.jpg',
          verified: user.verified,
          country_code: user.country_code,
          location: post.location,
          time: post.created_at,
          content: post.content,
          media_path: images,
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
        },
      });
    } catch (err) {
      console.error('Error creating post:', err);
      res.status(500).json({ message: err.message });
    }
  });
};

const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Posts.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const like = await Likes.findOne({ where: { user_id: req.user.id, entity_type: 'post', entity_id: postId } });
    if (like) {
      await like.destroy();
      post.likes = Math.max(0, post.likes - 1);
    } else {
      await Likes.create({ user_id: req.user.id, entity_type: 'post', entity_id: postId });
      post.likes += 1;
    }
    await post.save();
    res.status(200).json({ likes: post.likes });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ message: err.message });
  }
};

const commentPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const post = await Posts.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const user = await User.findByPk(req.user.id);
    await Comments.create({
      user_id: req.user.id,
      post_id: postId,
      content,
      created_at: new Date(),
    });
    post.comments += 1;
    await post.save();
    res.status(200).json({ 
      comments: post.comments,
      commenter: `${user.first_name} ${user.last_name}`,
      commenter_image: user.profile_picture_url || '/images/profpic2.jpg'
    });
  } catch (err) {
    console.error('Error commenting on post:', err);
    res.status(500).json({ message: err.message });
  }
};

const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Posts.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.shares += 1;
    await post.save();
    res.status(200).json({ shares: post.shares });
  } catch (err) {
    console.error('Error sharing post:', err);
    res.status(500).json({ message: err.message });
  }
};

const bookmarkPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const bookmark = await Bookmark.findOne({ where: { user_id: req.user.id, post_id: postId } });
    if (bookmark) {
      await bookmark.destroy();
    } else {
      await Bookmark.create({ user_id: req.user.id, post_id: postId });
    }
    res.status(200).json({ message: bookmark ? 'Bookmark removed' : 'Bookmark added' });
  } catch (err) {
    console.error('Error bookmarking post:', err);
    res.status(500).json({ message: err.message });
  }
};

const getStories = async (req, res) => {
  try {
    const stories = await Stories.findAll({
      include: [{ 
        model: User, 
        attributes: ['first_name', 'last_name', 'profile_picture_url', 'verified'], 
        as: 'user' 
      }],
      order: [['created_at', 'DESC']],
      limit: 6,
    });

    const formattedStories = stories.map(story => ({
      id: story.story_id,
      image: `${API_BASE_URL}${story.image_path}`,
      name: `${story.user.first_name} ${story.user.last_name}`,
      image_profile: story.user.profile_picture_url ? `${API_BASE_URL}${story.user.profile_picture_url}` : '/images/profpic2.jpg',
      verified: story.user.verified,
      isOwn: story.user_id === req.user.id,
    }));

    if (!stories.some(story => story.user_id === req.user.id)) {
      const user = await User.findByPk(req.user.id);
      formattedStories.unshift({ 
        id: 0, 
        image: user.profile_picture_url ? `${API_BASE_URL}${user.profile_picture_url}` : '/images/profpic2.jpg', 
        name: 'Your Story', 
        verified: user.verified,
        isOwn: true 
      });
    }
    res.status(200).json(formattedStories);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ message: err.message });
  }
};

const createStory = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: 'Image upload failed' });
    try {
      const image = req.files && req.files[0] ? `/uploads/${req.files[0].filename}` : null;
      if (!image) return res.status(400).json({ message: 'Image required' });

      const user = await User.findByPk(req.user.id);
      const story = await Stories.create({
        user_id: req.user.id,
        image_path: image,
        created_at: new Date(),
      });

      res.status(201).json({
        story: {
          id: story.story_id,
          image: `${API_BASE_URL}${image}`,
          name: `${user.first_name} ${user.last_name}`,
          image_profile: user.profile_picture_url ? `${API_BASE_URL}${user.profile_picture_url}` : '/images/profpic2.jpg',
          verified: user.verified,
          isOwn: true,
        },
      });
    } catch (err) {
      console.error('Error creating story:', err);
      res.status(500).json({ message: err.message });
    }
  });
};

module.exports = { getPosts, createPost, likePost, commentPost, sharePost, bookmarkPost, getStories, createStory };