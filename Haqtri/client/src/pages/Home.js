// C:\Users\Abz\Downloads\Haqtri\Haqtri\client\src\pages\Home.js
import React, { useState, useEffect } from 'react';
import { FaHeart, FaCommentDots, FaShare, FaBookmark, FaEdit, FaCamera } from 'react-icons/fa';
import axios from 'axios';

// Import images
import Profile1 from '../images/profpic.jpg'; // Default post creator profile
import Profile3 from '../images/profpic2.jpg'; // Default feed post profile
import Profile8 from '../images/house1.jpg'; // Default story profile
import Profile11 from '../images/house2.png';
import Profile12 from '../images/house3.jpg';
import Profile13 from '../images/house4.jpg';
import Profile14 from '../images/house5.jpg';
import Profile15 from '../images/house6.jpg';
import Feed5 from '../images/house2.png';
import Feed2 from '../images/house5.jpg';

import './Home.css';

const Home = ({ darkMode }) => {
  const [user, setUser] = useState(null); // Logged-in user data
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stories, setStories] = useState([]);

  const API_BASE_URL = 'http://localhost:5001/api'; // Match your server port
  const token = localStorage.getItem('token');

  // Fetch user data, posts, and stories on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user data');
        setUser({ first_name: 'Guest', last_name: '', profile_picture_url: Profile1 });
      }
    };

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch posts');
        setPosts([
          {
            post_id: 1,
            user: 'Adam Rose',
            user_image: Profile3,
            location: 'Dubai',
            time: '15 MINUTES AGO',
            content: 'Check out my new sustainable home design! 🌿',
            media_path: [Feed5, Feed2],
            likes: 42,
            comments: 8,
            shares: 3,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    const fetchStories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/stories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStories(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch stories');
        setStories([
          { id: 0, image: Profile8, name: 'Your Story', isOwn: true },
          { id: 1, image: Profile11, name: 'User 1' }, // Fixed syntax error
          { id: 2, image: Profile12, name: 'User 2' },
          { id: 3, image: Profile13, name: 'User 3' },
          { id: 4, image: Profile14, name: 'User 4' },
          { id: 5, image: Profile15, name: 'User 5' },
        ]);
      }
    };

    if (token) {
      fetchUserData();
      fetchPosts();
      fetchStories();
    } else {
      setError('Please sign in to view this page');
      setUser({ first_name: 'Guest', last_name: '', profile_picture_url: Profile1 });
    }

    const handleScroll = () => setShowFloatingButton(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [token]);

  // Interaction handlers
  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.map(post =>
        post.post_id === postId ? { ...post, likes: response.data.likes } : post
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to like post');
    }
  };

  const handleComment = async (postId, commentText) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/posts/${postId}/comment`, { content: commentText }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.map(post =>
        post.post_id === postId ? { ...post, comments: response.data.comments } : post
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleShare = async (postId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/posts/${postId}/share`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.map(post =>
        post.post_id === postId ? { ...post, shares: response.data.shares } : post
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share post');
    }
  };

  const handleBookmark = async (postId) => {
    try {
      await axios.post(`${API_BASE_URL}/posts/${postId}/bookmark`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to bookmark post');
    }
  };

  // Post submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', newPost);
      formData.append('location', 'Your Location'); // Could fetch from user data
      formData.append('visibility', 'public');
      selectedImages.forEach((file, index) => formData.append(`images[${index}]`, file));

      const response = await axios.post(`${API_BASE_URL}/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setPosts([response.data.post, ...posts]);
      setNewPost('');
      setSelectedImages([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  // Add story
  const handleAddStory = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${API_BASE_URL}/users/stories`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setStories([response.data.story, ...stories.filter(story => !story.isOwn)]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add story');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className={`home-main-container ${darkMode ? 'home-dark' : ''}`}>
      {/* Welcome Header */}

      {/* Stories Section */}
      <div className="home-stories-container">
        <div className="home-stories">
          <div className="home-story">
            <div className="home-profile-photo home-new-story">
              <img src={user.profile_picture_url || Profile8} alt="Your story" />
              <div className="home-add-story">
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="home-story-upload"
                  onChange={handleAddStory}
                  disabled={loading}
                />
                <label htmlFor="home-story-upload" className="home-add-story-label">+</label>
              </div>
            </div>
            <p className="home-name">Your Story</p>
          </div>
          {stories.filter(story => !story.isOwn).map(story => (
            <div className="home-story" key={story.id}>
              <div className="home-profile-photo">
                <img src={story.image || Profile3} alt={story.name} />
              </div>
              <p className="home-name">{story.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Post Creator */}
      <form className="home-post-creator" onSubmit={handlePostSubmit}>
        <div className="home-post-author">
          <img src={user.profile_picture_url || Profile1} alt="Profile" className="home-profile-photo" />
          <div className="home-post-input-container">
            <input
              type="text"
              placeholder={`What's on your mind, ${user.first_name}?`}
              className="home-post-input"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              disabled={loading}
            />
            <div className="home-post-buttons">
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                id="home-image-upload"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 4) {
                    alert('Maximum 4 images allowed');
                    return;
                  }
                  setSelectedImages(files);
                }}
                disabled={loading}
              />
              <button
                type="button"
                className="home-add-image-btn"
                onClick={() => document.getElementById('home-image-upload').click()}
                aria-label="Add images"
                disabled={loading}
              >
                <FaCamera />
              </button>
              <button
                type="submit"
                className="home-btn-post"
                disabled={!newPost.trim() || loading}
                aria-label="Post your thought"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
        {selectedImages.length > 0 && (
          <div className="home-image-previews">
            {selectedImages.map((img, i) => (
              <img key={i} src={URL.createObjectURL(img)} alt={`Preview ${i + 1}`} className="home-preview-img" />
            ))}
          </div>
        )}
        {error && <p className="home-error">{error}</p>}
      </form>

      {/* Feed Posts */}
      <div className="home-feeds">
        {loading && !posts.length ? (
          <p>Loading posts...</p>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <div className="home-feed-card" key={post.post_id}>
              <div className="home-post-header">
                <div className="home-post-user">
                  <img src={post.user_image || Profile3} alt={post.user} className="home-profile-photo" />
                  <div className="home-post-info">
                    <h3>{post.user}</h3>
                    <small>{post.location || 'Unknown'}, {post.time || new Date(post.created_at).toLocaleString()}</small>
                  </div>
                </div>
                <button className="home-post-options">⋯</button>
              </div>
              <div className="home-post-content">
                <p>{post.content}</p>
                {post.media_path && post.media_path.length > 0 && (
                  <div className="home-post-images">
                    {post.media_path.map((img, i) => (
                      <img key={i} src={img} alt={`${post.user}'s post image ${i + 1}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="home-post-interactions">
                <div className="home-interaction-buttons">
                  <button
                    className="home-interaction-btn"
                    onClick={() => handleLike(post.post_id)}
                    aria-label="Like this post"
                  >
                    <FaHeart />
                    <span>{post.likes || 0}</span>
                  </button>
                  <button
                    className="home-interaction-btn"
                    onClick={() => {
                      const comment = prompt('Enter your comment:');
                      if (comment) handleComment(post.post_id, comment);
                    }}
                    aria-label="Comment on this post"
                  >
                    <FaCommentDots />
                    <span>{post.comments || 0}</span>
                  </button>
                  <button
                    className="home-interaction-btn"
                    onClick={() => handleShare(post.post_id)}
                    aria-label="Share this post"
                  >
                    <FaShare />
                    <span>{post.shares || 0}</span>
                  </button>
                </div>
                <button
                  className="home-bookmark-btn"
                  onClick={() => handleBookmark(post.post_id)}
                  aria-label="Bookmark this post"
                >
                  <FaBookmark />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>

      {/* Floating Post Button */}
      {showFloatingButton && (
        <button
          className={`home-floating-post-btn ${darkMode ? 'home-dark' : ''}`}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => document.querySelector('.home-post-input').focus(), 300);
          }}
          aria-label="Go to post input"
        >
          <FaEdit />
        </button>
      )}
    </div>
  );
};

export default Home;     