import React, { useState, useEffect } from 'react';
import { FaHeart, FaCommentDots, FaShare, FaBookmark, FaEdit, FaCamera } from 'react-icons/fa';
import axios from 'axios';

import Profile3 from '../images/profpic2.jpg';
import Profile8 from '../images/house1.jpg';
import Feed5 from '../images/house2.png';
import Feed2 from '../images/house5.jpg';

import './Home.css';

const Home = ({ darkMode }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stories, setStories] = useState([]);

  const API_BASE_URL = 'http://localhost:5001/api';
  const SERVER_BASE_URL = 'http://localhost:5001';
  const token = localStorage.getItem('token');

  // Function to generate a letter-based avatar
  const generateAvatar = (name) => {
    if (!name) return Profile3; // Fallback if no name
    const firstLetter = name.charAt(0).toUpperCase();
    const canvas = document.createElement('canvas');
    canvas.width = 70;
    canvas.height = 70;
    const ctx = canvas.getContext('2d');
    
    // Background color based on letter (simple hash)
    const colors = ['#4A8B6F', '#CC7357', '#2A3F54', '#D4AF37'];
    const colorIndex = firstLetter.charCodeAt(0) % colors.length;
    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(0, 0, 70, 70);
    
    // Letter
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(firstLetter, 35, 40);
    
    return canvas.toDataURL();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user data');
        setUser({ first_name: 'Guest', last_name: '' });
      }
    };

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('fetchPosts raw response:', JSON.stringify(response.data, null, 2));
        const transformedPosts = response.data.map(post => {
          let mediaPath = post.media_path;
          if (typeof mediaPath === 'string') {
            try {
              mediaPath = JSON.parse(mediaPath);
            } catch (e) {
              console.error(`Error parsing media_path for post ${post.post_id}:`, e);
              mediaPath = [];
            }
          }
          const normalizedMediaPath = Array.isArray(mediaPath)
            ? mediaPath.map(img => `${SERVER_BASE_URL}${img}`)
            : [];
          console.log(`Post ${post.post_id} transformed media_path:`, normalizedMediaPath);
          return {
            ...post,
            media_path: normalizedMediaPath,
            user_image: post.user_image || generateAvatar(post.user.split(' ')[0]),
          };
        });
        console.log('Setting posts:', JSON.stringify(transformedPosts, null, 2));
        setPosts(transformedPosts);
      } catch (err) {
        console.error('Fetch posts error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch posts');
        setPosts([
          {
            post_id: 1,
            user: 'Adam Rose',
            user_image: generateAvatar('Adam'),
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
        setStories([{ id: 0, image: Profile8, name: 'Your Story', isOwn: true }]);
      }
    };

    if (token) {
      fetchUserData();
      fetchPosts();
      fetchStories();
    } else {
      setError('Please sign in to view this page');
      setUser({ first_name: 'Guest', last_name: '' });
    }

    const handleScroll = () => setShowFloatingButton(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [token]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || loading) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('content', newPost);
    formData.append('visibility', 'public');
    selectedImages.forEach((img) => formData.append('images', img));

    try {
      const response = await axios.post(`${API_BASE_URL}/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Post response:', JSON.stringify(response.data, null, 2));
      const newPostData = {
        ...response.data.post,
        media_path: (response.data.post.media_path || []).map(img => `${SERVER_BASE_URL}${img}`),
        user_image: response.data.post.user_image || generateAvatar(response.data.post.user.split(' ')[0]),
      };
      console.log('New post transformed media_path:', newPostData.media_path);
      setPosts([newPostData, ...posts]);
      setNewPost('');
      setSelectedImages([]);
    } catch (err) {
      console.error('Post error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStory = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/users/stories`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setStories([response.data.story, ...stories]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add story');
    }
  };

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

  const handleComment = async (postId, comment) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/posts/${postId}/comment`, { content: comment }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.map(post => 
        post.post_id === postId ? { ...post, comments: response.data.comments } : post
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to comment');
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

  return (
    <div className={`home-main-container ${darkMode ? 'home-dark' : ''}`}>
      {/* Stories Section */}
      <div className="home-stories-container">
        <div className="home-stories">
          <div className="home-story">
            <div className="home-profile-photo home-new-story">
              <img src={user?.profile_picture_url || generateAvatar(user?.first_name)} alt="Your story" />
              <div className="home-add-story">
                <input
                  type="file"
                  accept="image/*"
                  id="home-story-upload"
                  onChange={handleAddStory}
                  style={{ display: 'none' }}
                />
                <label htmlFor="home-story-upload">+</label>
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
          <img src={user?.profile_picture_url || generateAvatar(user?.first_name)} alt="Profile" className="home-profile-photo" />
          <div className="home-post-input-container">
            <input
              type="text"
              placeholder={`What's on your mind, ${user?.first_name || 'Guest'}?`}
              className="home-post-input"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <div className="home-post-buttons">
              <input
                type="file"
                accept="image/*"
                multiple
                id="home-image-upload"
                style={{ display: 'none' }}
                onChange={(e) => setSelectedImages(Array.from(e.target.files).slice(0, 4))}
              />
              <button type="button" className="home-add-image-btn" onClick={() => document.getElementById('home-image-upload').click()}>
                <FaCamera />
              </button>
              <button type="submit" className="home-btn-post" disabled={!newPost.trim() || loading}>
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
        {selectedImages.length > 0 && (
          <div className="home-image-previews">
            {selectedImages.map((img, i) => (
              <img key={i} src={URL.createObjectURL(img)} alt={`Preview ${i}`} className="home-preview-img" />
            ))}
          </div>
        )}
        {error && <p className="home-error">{error}</p>}
      </form>

      {/* Posts Feed */}
      <div className="home-feeds">
        {posts.map(post => (
          <div className="home-feed-card" key={post.post_id}>
            <div className="home-post-header">
              <div className="home-post-user">
                <img src={post.user_image} alt={post.user} className="home-profile-photo" />
                <div className="home-post-info">
                  <h3>{post.user}</h3>
                  <small>{post.location}, {post.time}</small>
                </div>
              </div>
              <button className="home-post-options">⋯</button>
            </div>
            <div className="home-post-content">
              <p>{post.content}</p>
              {post.media_path?.length > 0 && (
                <div className="home-post-images">
                  {post.media_path.map((img, i) => (
                    <img 
                      key={i} 
                      src={img} 
                      alt={`Post ${i}`} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = Feed5;
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="home-post-interactions">
              <button onClick={() => handleLike(post.post_id)} className="home-interaction-btn">
                <FaHeart /> {post.likes}
              </button>
              <button onClick={() => handleComment(post.post_id, prompt('Enter comment:'))} className="home-interaction-btn">
                <FaCommentDots /> {post.comments}
              </button>
              <button onClick={() => handleShare(post.post_id)} className="home-interaction-btn">
                <FaShare /> {post.shares}
              </button>
              <button onClick={() => handleBookmark(post.post_id)} className="home-bookmark-btn">
                <FaBookmark />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;