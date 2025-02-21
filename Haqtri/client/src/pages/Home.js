import React, { useState, useEffect } from 'react';
import { FaHeart, FaCommentDots, FaShare, FaBookmark, FaEdit, FaCamera } from 'react-icons/fa';

// Import all images at the top
import Profile1 from '../images/profpic.jpg'; // Post creator profile
import Profile3 from '../images/profpic2.jpg'; // Feed post profile
import Profile8 from '../images/house1.jpg'; // Your story profile
import Profile11 from '../images/house2.png'; // User 1 story profile
import Profile12 from '../images/house3.jpg'; // User 2 story profile
import Profile13 from '../images/house4.jpg'; // User 3 story profile
import Profile14 from '../images/house5.jpg'; // User 4 story profile
import Profile15 from '../images/house6.jpg'; // User 5 story profile
import Feed5 from '../images/house2.png'; // Post image 1
import Feed2 from '../images/house5.jpg'; // Post image 2

import './Home.css';

const Home = ({ darkMode }) => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'Adam Rose',
      location: 'Dubai',
      time: '15 MINUTES AGO',
      content: 'Check out my new sustainable home design! 🌿',
      images: [Feed5, Feed2], // Use imported images
      likes: 42,
      comments: 8,
      shares: 3,
    },
  ]);
  const [newPost, setNewPost] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingButton(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLike = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const newPostObject = {
      id: posts.length + 1,
      user: 'Current User',
      location: 'Your Location',
      time: 'JUST NOW',
      content: newPost,
      images: selectedImages,
      likes: 0,
      comments: 0,
      shares: 0,
    };

    setPosts([newPostObject, ...posts]);
    setNewPost('');
    setSelectedImages([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`home-container ${darkMode ? 'dark' : ''}`}>
      {/* Fixed Stories Section */}
      <div className="stories-container">
        <div className="stories">
          <div className="story">
            <div className="profile-photo new-story">
              <img src={Profile8} alt="Your story" />
              <div className="add-story">+</div>
            </div>
            <p className="name">Your Story</p>
          </div>
          {[Profile11, Profile12, Profile13, Profile14, Profile15].map((profileImg, i) => (
            <div className="story" key={i}>
              <div className="profile-photo">
                <img src={profileImg} alt={`User ${i + 1}`} />
              </div>
              <p className="name">User {i + 1}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Post Creator */}
      <form className="post-creator" onSubmit={handlePostSubmit}>
        <div className="post-author">
          <img src={Profile1} alt="Profile" className="profile-photo" />
          <div className="post-input-container">
            <input
              type="text"
              placeholder="What's on your mind?"
              className="post-input"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <div className="post-buttons">
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                id="image-upload"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 4) {
                    alert('Maximum 4 images allowed');
                    return;
                  }
                  setSelectedImages(files.map(file => URL.createObjectURL(file)));
                }}
              />
              <button
                type="button"
                className="add-image-btn"
                onClick={() => document.getElementById('image-upload').click()}
                aria-label="Add images"
              >
                <FaCamera />
              </button>
              <button
                type="submit"
                className="btn-post"
                disabled={!newPost.trim()}
                aria-label="Post your thought"
              >
                Post
              </button>
            </div>
          </div>
        </div>
        {selectedImages.length > 0 && (
          <div className="image-previews">
            {selectedImages.map((img, i) => (
              <img key={i} src={img} alt={`Preview ${i + 1}`} className="preview-img" />
            ))}
          </div>
        )}
      </form>

      {/* Feed Posts */}
      <div className="feeds">
        {posts.map(post => (
          <div className="feed-card" key={post.id}>
            <div className="post-header">
              <div className="post-user">
                <img src={Profile3} alt={post.user} className="profile-photo" />
                <div className="post-info">
                  <h3>{post.user}</h3>
                  <small>{post.location}, {post.time}</small>
                </div>
              </div>
              <button className="post-options">⋯</button>
            </div>
            <div className="post-content">
              <p>{post.content}</p>
              {post.images.length > 0 && (
                <div className="post-images">
                  {post.images.map((img, i) => (
                    <img key={i} src={img} alt={`${post.user}'s post image ${i + 1}`} />
                  ))}
                </div>
              )}
            </div>
            <div className="post-interactions">
              <div className="interaction-buttons">
                <button
                  className="interaction-btn"
                  onClick={() => handleLike(post.id)}
                  aria-label="Like this post"
                >
                  <FaHeart />
                  <span>{post.likes}</span>
                </button>
                <button className="interaction-btn" aria-label="Comment on this post">
                  <FaCommentDots />
                  <span>{post.comments}</span>
                </button>
                <button className="interaction-btn" aria-label="Share this post">
                  <FaShare />
                  <span>{post.shares}</span>
                </button>
              </div>
              <button className="bookmark-btn" aria-label="Bookmark this post">
                <FaBookmark />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Post Button */}
      {showFloatingButton && (
        <button
          className={`floating-post-btn ${darkMode ? 'dark' : ''}`}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
              document.querySelector('.post-input').focus();
            }, 300); // 300ms delay for smooth scroll
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