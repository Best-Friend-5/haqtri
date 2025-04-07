import React, { useState, useEffect } from 'react';
import { FaHeart, FaCommentDots, FaShare, FaBookmark, FaCamera } from 'react-icons/fa';
import axios from 'axios';

import Profile3 from '../images/profpic2.jpg';
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
  const [selectedStory, setSelectedStory] = useState(null);

  const API_BASE_URL = 'http://localhost:5001/api';
  const SERVER_BASE_URL = 'http://localhost:5001';
  const token = localStorage.getItem('token');

  const generateAvatar = (name) => {
    const effectiveName = name || 'Guest';
    const firstLetter = effectiveName.charAt(0).toUpperCase();
    const canvas = document.createElement('canvas');
    canvas.width = 70;
    canvas.height = 70;
    const ctx = canvas.getContext('2d');
    const colors = ['#4A8B6F', '#CC7357', '#2A3F54', '#D4AF37'];
    const colorIndex = firstLetter.charCodeAt(0) % colors.length;
    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(0, 0, 70, 70);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(firstLetter, 35, 40);
    const avatarUrl = canvas.toDataURL();
    console.log(`Generated avatar for "${effectiveName}": ${avatarUrl.substring(0, 30)}...`);
    return avatarUrl;
  };

  const getProfilePictureUrl = (profilePictureUrl, name) => {
    if (!profilePictureUrl || profilePictureUrl === '/images/profpic2.jpg') {
      return generateAvatar(name || 'Guest');
    }
    if (!profilePictureUrl.startsWith('http')) {
      const fullUrl = `${SERVER_BASE_URL}${profilePictureUrl}`;
      console.log(`Constructed URL for "${name}": ${fullUrl}`);
      return fullUrl;
    }
    console.log(`Using provided URL for "${name}": ${profilePictureUrl}`);
    return profilePictureUrl;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('fetchUserData:', JSON.stringify(response.data, null, 2));
        setUser(response.data);
      } catch (err) {
        console.error('fetchUserData error:', err.response?.data || err.message);
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
        console.log('fetchPosts:', JSON.stringify(response.data, null, 2));
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
            ? mediaPath.map(img => (img.startsWith('http') ? img : `${SERVER_BASE_URL}${img}`))
            : [];
          return {
            ...post,
            media_path: normalizedMediaPath,
            user_image: getProfilePictureUrl(post.user_image, post.user),
          };
        });
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
        console.log('fetchStories raw response:', JSON.stringify(response.data, null, 2));
        let transformedStories = response.data.map(story => ({
          id: story.id,
          image: getProfilePictureUrl(
            story.isOwn ? (story.image || story.image_profile) : (story.image_profile || story.image),
            user?.first_name || story.name
          ),
          name: story.name || 'Guest',
          isOwn: story.isOwn,
          storyCount: story.storyCount || 1,
        }));
        // Ensure "Your Story" placeholder if no own story exists
        const hasOwnStory = transformedStories.some(story => story.isOwn);
        if (!hasOwnStory && user) {
          transformedStories.unshift({
            id: 0,
            image: getProfilePictureUrl(user.profile_picture_url, user.first_name),
            name: user.first_name || 'Guest',
            isOwn: true,
            storyCount: 1,
          });
        }
        console.log('transformedStories:', JSON.stringify(transformedStories, null, 2));
        setStories(transformedStories);
      } catch (err) {
        console.error('Fetch stories error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch stories');
        setStories([{ id: 0, image: generateAvatar('Guest'), name: 'Your Story', isOwn: true, storyCount: 1 }]);
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
      const newPostData = {
        ...response.data.post,
        media_path: (response.data.post.media_path || []).map(img => (img.startsWith('http') ? img : `${SERVER_BASE_URL}${img}`)),
        user_image: getProfilePictureUrl(response.data.post.user_image, response.data.post.user),
      };
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
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/users/stories`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Story response:', JSON.stringify(response.data, null, 2));
      const newStory = {
        id: response.data.story.id,
        image: getProfilePictureUrl(response.data.story.image, user?.first_name || response.data.story.name),
        name: user?.first_name || response.data.story.name,
        isOwn: true,
        storyCount: 1,
      };
      setStories([newStory, ...stories.filter(story => !story.isOwn)]);
    } catch (err) {
      console.error('Story error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to add story');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStory = (story) => {
    setSelectedStory(story);
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
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

  const currentUserStory = stories.find(story => story.isOwn);
  console.log('currentUserStory:', currentUserStory || 'undefined');
  const yourStoryImage = currentUserStory && currentUserStory.image
    ? getProfilePictureUrl(currentUserStory.image, user?.first_name || currentUserStory.name)
    : getProfilePictureUrl(user?.profile_picture_url, user?.first_name);
  console.log('yourStoryImage:', yourStoryImage || 'undefined');

  return (
    <div className={`home-main-container ${darkMode ? 'home-dark' : ''}`}>
      {/* Stories Section */}
      <div className="home-stories-container">
        <div className="home-stories">
          {/* Your Story Bubble */}
          <div className="home-story" onClick={() => currentUserStory && handleViewStory(currentUserStory)}>
            <div className="home-profile-photo home-new-story">
              <img 
                src={yourStoryImage} 
                alt="Your story" 
                onError={(e) => {
                  console.error('Your Story image failed to load:', e);
                  e.target.src = generateAvatar(user?.first_name || 'Guest');
                }}
              />
              <button 
                className="home-add-story-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('home-story-upload').click();
                }}
              >
                <FaCamera />
              </button>
              <input
                type="file"
                accept="image/*"
                id="home-story-upload"
                onChange={handleAddStory}
                style={{ display: 'none' }}
              />
            </div>
            <p className="home-name">Your Story</p>
          </div>

          {/* Other Stories or Placeholders */}
          {stories.filter(story => !story.isOwn).length > 0 ? (
            stories.filter(story => !story.isOwn).map(story => (
              <div className="home-story" key={story.id} onClick={() => handleViewStory(story)}>
                <div className="home-profile-photo">
                  <img src={story.image} alt={story.name} />
                </div>
                <p className="home-name">{story.name}</p>
              </div>
            ))
          ) : (
            [...Array(3)].map((_, index) => (
              <div className="home-story placeholder-story" key={`placeholder-${index}`}>
                <div className="home-profile-photo">
                  <div className="home-story-placeholder-inner">
                    <span>+</span>
                  </div>
                </div>
                <p className="home-name">Follow users</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Post Creator */}
      <form className="home-post-creator" onSubmit={handlePostSubmit}>
        <div className="home-post-author">
          <img 
            src={getProfilePictureUrl(user?.profile_picture_url, user?.first_name)} 
            alt="Profile" 
            className="home-profile-photo" 
          />
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
                <img src={post.user_image} alt={post.user || 'Guest'} className="home-profile-photo" />
                <div className="home-post-info">
                  <h3>{post.user || 'Guest'}</h3>
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

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="home-story-modal" onClick={handleCloseStory}>
          <div className="home-story-modal-content">
            <img src={selectedStory.image} alt={selectedStory.name} />
            <p>{selectedStory.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;