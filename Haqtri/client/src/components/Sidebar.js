import React from 'react';
import { FaSearch, FaLeaf, FaWallet, FaChartLine } from 'react-icons/fa';

// Import the profile image at the top
import Profile1 from '../images/profpic.jpg'; // Adjust path as needed

import './Sidebar.css';

const Sidebar = ({ darkMode }) => {
  return (
    <div className={`sidebar ${darkMode ? 'dark' : ''}`}>
      {/* Search Bar */}
      <div className={`sidebar-search ${darkMode ? 'dark' : ''}`}>
        <FaSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Search ethical materials..." 
          className={`search-input ${darkMode ? 'dark' : ''}`}
        />
      </div>

      {/* User Profile */}
      <div className={`user-profile ${darkMode ? 'dark' : ''}`}>
        <img 
          src={Profile1} // Use imported image
          alt="Profile" 
          className="profile-image" 
        />
        <div className="profile-info">
          <h4>Ali Shariatian</h4>
          <p>@AliShariatian</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`quick-actions ${darkMode ? 'dark' : ''}`}>
        <h3>Quick Actions</h3>
        <button className={`action-btn ${darkMode ? 'dark' : ''}`}>
          <FaLeaf className="action-icon" />
          Start Ethical Build
        </button>
        <button className={`action-btn ${darkMode ? 'dark' : ''}`}>
          <FaWallet className="action-icon" />
          Land Trust Wallet
        </button>
        <button className={`action-btn ${darkMode ? 'dark' : ''}`}>
          <FaChartLine className="action-icon" />
          Leaderboard
        </button>
      </div>

      {/* Trending Projects */}
      <div className={`trending-projects ${darkMode ? 'dark' : ''}`}>
        <h3>Trending Projects 🔥</h3>
        <div className="project-card">
          <div className="project-info">
            <h4>Zero-Waste Cabin</h4>
            <p>1.2k ♡ Oregon Forest</p>
          </div>
          <span className="eco-badge">🌿 Eco Certified</span>
        </div>
        <div className="project-card">
          <div className="project-info">
            <h4>Urban Micro-Home</h4>
            <p>850 ♡ Tokyo</p>
          </div>
          <span className="eco-badge">🌱 Sustainable</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;