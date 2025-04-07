import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUser, FaVideo, FaBell, FaCommentDots, FaTv, FaShoppingCart, FaChartLine, FaHotel, FaCog } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import Logo from './logo.png'; // Import the image (adjust path as needed)
import './Navbar.css';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const navItems = [
    { icon: <FaHome />, label: 'Home', path: '/' },
    { icon: <FaUser />, label: 'Profile', path: '/profile' }, // Added Profile
    { icon: <FaHotel />, label: 'Property', path: '/property' },
    { icon: <FaShoppingCart />, label: 'Marketplace', path: '/marketplace' }, // Replaced Bookmark
    { icon: <FaVideo />, label: 'Explore', path: '/explore' },
    { icon: <FaTv />, label: 'Live', path: '/live' },
    { icon: <FaCommentDots />, label: 'Messages', path: '/messages' },
    { icon: <FaBell />, label: 'Notifications', path: '/notifications' },
    { icon: <FaChartLine />, label: 'Analytics', path: '/analytics' },
    { icon: <FaCog />, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className={`navbar ${darkMode ? 'dark' : ''}`}>
      <div className="navbar-header">
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo" /> {/* Logo only, title removed */}
        </div>
      </div>

      <div className="nav-items">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="navbar-footer">
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'} 
          <span>Toggle Theme</span>
        </button>
        <button className="logout-btn">
          <FiLogOut className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;