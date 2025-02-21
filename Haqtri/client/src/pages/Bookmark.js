import React, { useState } from 'react';
import { FaBookmark, FaHeart, FaCommentDots, FaShare } from 'react-icons/fa';

// Import images from Home.js for consistency
import Profile1 from '../images/profpic3.jpg'; // User profile
import Profile3 from '../images/profpic2.jpg'; // User profile
import Feed5 from '../images/house4.jpg';     // Post image
import Feed2 from '../images/house5.jpg';     // Post image
import Feed3 from '../images/house2.png';     // Post image

import './Bookmark.css';

const Bookmark = ({ darkMode }) => {
  const [bookmarks, setBookmarks] = useState([
    {
      id: 1,
      user: 'Lili Rose',
      location: 'Dubai',
      time: '15 MINUTES AGO',
      content: 'Check out my new sustainable home design! 🌿',
      images: [Feed5, Feed2],
      likes: 42,
      comments: 8,
      shares: 3,
      profileImg: Profile3,
      isBookmarked: true,
    },
    {
      id: 2,
      user: 'Ali Shariatian',
      location: 'California',
      time: '2 HOURS AGO',
      content: 'Just finished a zero-waste loft project. Thoughts?',
      images: [Feed3],
      likes: 25,
      comments: 5,
      shares: 2,
      profileImg: Profile1,
      isBookmarked: true,
    },
  ]);

  const handleLike = (id) => {
    setBookmarks((prevBookmarks) =>
      prevBookmarks.map((bookmark) =>
        bookmark.id === id ? { ...bookmark, likes: bookmark.likes + 1 } : bookmark
      )
    );
  };

  const handleToggleBookmark = (id) => {
    setBookmarks((prevBookmarks) =>
      prevBookmarks.map((bookmark) =>
        bookmark.id === id ? { ...bookmark, isBookmarked: !bookmark.isBookmarked } : bookmark
      )
    );
  };

  return (
    <div className={`bookmark-container ${darkMode ? 'dark' : ''}`}>
      <h2 className="bookmark-title">
        <FaBookmark className="bookmark-icon" /> Bookmarks
      </h2>
      <div className="bookmark-feed">
        {bookmarks.filter((bookmark) => bookmark.isBookmarked).length === 0 ? (
          <p className="no-bookmarks">No bookmarked items yet</p>
        ) : (
          bookmarks
            .filter((bookmark) => bookmark.isBookmarked)
            .map((bookmark) => (
              <div key={bookmark.id} className="bookmark-card">
                <div className="post-header">
                  <div className="post-user">
                    <img src={bookmark.profileImg} alt={bookmark.user} className="profile-photo" />
                    <div className="post-info">
                      <h3>{bookmark.user}</h3>
                      <small>{bookmark.location}, {bookmark.time}</small>
                    </div>
                  </div>
                  <button className="post-options">⋯</button>
                </div>
                <div className="post-content">
                  <p>{bookmark.content}</p>
                  {bookmark.images.length > 0 && (
                    <div className="post-images">
                      {bookmark.images.map((img, i) => (
                        <img key={i} src={img} alt={`${bookmark.user}'s post image ${i + 1}`} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="post-interactions">
                  <div className="interaction-buttons">
                    <button
                      className="interaction-btn"
                      onClick={() => handleLike(bookmark.id)}
                      aria-label="Like this post"
                    >
                      <FaHeart />
                      <span>{bookmark.likes}</span>
                    </button>
                    <button className="interaction-btn" aria-label="Comment on this post">
                      <FaCommentDots />
                      <span>{bookmark.comments}</span>
                    </button>
                    <button className="interaction-btn" aria-label="Share this post">
                      <FaShare />
                      <span>{bookmark.shares}</span>
                    </button>
                  </div>
                  <button
                    className="bookmark-btn active"
                    onClick={() => handleToggleBookmark(bookmark.id)}
                    aria-label="Remove from bookmarks"
                  >
                    <FaBookmark />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Bookmark;