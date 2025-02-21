import React, { useState } from 'react';
import { FaBell, FaCheckCircle, FaUserPlus, FaComment } from 'react-icons/fa';
import './Notifications.css';

const Notifications = ({ darkMode }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'verification',
      message: 'Worker "Maria Gomez" has earned the "Eco-Warrior" badge for using zero-waste materials.',
      timestamp: '5 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'project',
      message: 'Your "Eco-Friendly Villa" project has a new milestone payment approved.',
      timestamp: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'social',
      message: 'Ali Shariatian commented on your post: "Amazing sustainable design!"',
      timestamp: '2 hours ago',
      read: true,
    },
    {
      id: 4,
      type: 'connection',
      message: 'New connection request from contractor "John Doe".',
      timestamp: 'Yesterday',
      read: false,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <div className={`notifications-container ${darkMode ? 'dark' : ''}`}>
      <h2 className="notifications-title">
        <FaBell className="bell-icon" /> Notifications
      </h2>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No new notifications</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-icon">
                {notification.type === 'verification' && <FaCheckCircle />}
                {notification.type === 'project' && <FaCheckCircle />}
                {notification.type === 'social' && <FaComment />}
                {notification.type === 'connection' && <FaUserPlus />}
              </div>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <small className="notification-timestamp">{notification.timestamp}</small>
              </div>
              {!notification.read && <span className="unread-dot"></span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;