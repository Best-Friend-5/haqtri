import React, { useState } from 'react';
import { 
  FaCog, FaUser, FaLock, FaBell, FaEye, FaGlobe, FaShieldAlt, FaQuestionCircle, 
  FaUpload, FaLanguage, FaHome, FaLeaf, FaSignOutAlt 
} from 'react-icons/fa';
import DefaultProfile from '../images/profpic.jpg'; // Imported at the top
import './Settings.css';

const Settings = ({ darkMode, toggleDarkMode }) => {
  // State for profile settings
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImg: DefaultProfile, // Using imported image; fallback to '/images/default-profile.jpg' if needed
    password: '',
    confirmPassword: '',
  });

  // State for other settings
  const [privacy, setPrivacy] = useState('Public');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    inApp: true,
  });
  const [language, setLanguage] = useState('English');
  const [fontSize, setFontSize] = useState('Medium');
  const [defaultPage, setDefaultPage] = useState('Home');
  const [sustainabilityPriority, setSustainabilityPriority] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessions, setSessions] = useState([]); // Placeholder for active sessions

  // Handler functions
  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, profileImg: imageUrl }));
    }
  };

  const handleSave = () => {
    console.log('Settings saved:', {
      profile,
      privacy,
      notifications,
      darkMode,
      language,
      fontSize,
      defaultPage,
      sustainabilityPriority,
      twoFactor,
      sessions,
    });
    alert('Settings saved successfully!');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deleted');
      alert('Account deleted successfully.');
    }
  };

  const handleLogoutSession = (sessionId) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    console.log(`Logged out session ${sessionId}`);
  };

  return (
    <div className={`settings-container ${darkMode ? 'dark' : ''}`}>
      <h2 className="settings-title">
        <FaCog className="cog-icon" /> Settings
      </h2>
      <div className="settings-grid">
        {/* Account Settings */}
        <div className="settings-card">
          <h3><FaUser /> Account Settings</h3>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Profile Picture</label>
            <div className="profile-pic-preview">
              <img src={profile.profileImg} alt="Profile" className="profile-photo" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                id="profile-pic-upload"
                style={{ display: 'none' }}
              />
              <button
                onClick={() => document.getElementById('profile-pic-upload').click()}
                aria-label="Upload new profile picture"
              >
                <FaUpload /> Upload New
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Change Password</label>
            <input
              type="password"
              placeholder="New Password"
              value={profile.password}
              onChange={(e) => handleProfileChange('password', e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={profile.confirmPassword}
              onChange={(e) => handleProfileChange('confirmPassword', e.target.value)}
            />
          </div>
          <button className="delete-btn" onClick={handleDeleteAccount}>Delete Account</button>
        </div>

        {/* Privacy Settings */}
        <div className="settings-card">
          <h3><FaEye /> Privacy Settings</h3>
          <div className="form-group">
            <label>Profile Visibility</label>
            <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
              <option value="Public">Public</option>
              <option value="Friends Only">Friends Only</option>
              <option value="Private">Private</option>
            </select>
          </div>
          <div className="form-group">
            <label>Data Sharing</label>
            <input type="checkbox" checked={true} disabled />
            <span>Share data for analytics (coming soon)</span>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="settings-card">
          <h3><FaBell /> Notification Preferences</h3>
          <div className="form-group">
            <label>Email Notifications</label>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications((prev) => ({ ...prev, email: e.target.checked }))}
            />
          </div>
          <div className="form-group">
            <label>Push Notifications</label>
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) => setNotifications((prev) => ({ ...prev, push: e.target.checked }))}
            />
          </div>
          <div className="form-group">
            <label>In-App Notifications</label>
            <input
              type="checkbox"
              checked={notifications.inApp}
              onChange={(e) => setNotifications((prev) => ({ ...prev, inApp: e.target.checked }))}
            />
          </div>
        </div>

        {/* Theme & Accessibility */}
        <div className="settings-card">
          <h3><FaGlobe /> Theme & Accessibility</h3>
          <div className="form-group">
            <label>Theme</label>
            <button
              className={`theme-btn ${darkMode ? 'active' : ''}`}
              onClick={toggleDarkMode}
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
          <div className="form-group">
            <label>Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>
          <div className="form-group">
            <label>Font Size</label>
            <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>
        </div>

        {/* Application Settings */}
        <div className="settings-card">
          <h3><FaHome /> Application Settings</h3>
          <div className="form-group">
            <label>Default Home Page</label>
            <select value={defaultPage} onChange={(e) => setDefaultPage(e.target.value)}>
              <option value="Home">Home</option>
              <option value="Explore">Explore</option>
              <option value="Properties">Properties</option>
            </select>
          </div>
          <div className="form-group">
            <label>Prioritize Eco-Friendly Properties</label>
            <input
              type="checkbox"
              checked={sustainabilityPriority}
              onChange={(e) => setSustainabilityPriority(e.target.checked)}
            />
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-card">
          <h3><FaShieldAlt /> Security Settings</h3>
          <div className="form-group">
            <label>Two-Factor Authentication</label>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => setTwoFactor(e.target.checked)}
            />
          </div>
          <div className="form-group">
            <label>Manage Sessions</label>
            <ul className="session-list">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <li key={session.id}>
                    <span>{session.device}</span>
                    <button onClick={() => handleLogoutSession(session.id)}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </li>
                ))
              ) : (
                <li>No active sessions</li>
              )}
            </ul>
          </div>
        </div>

        {/* Support & Feedback */}
        <div className="settings-card">
          <h3><FaQuestionCircle /> Support & Feedback</h3>
          <button className="support-btn">Visit Help Center</button>
          <button className="support-btn">Submit Feedback</button>
        </div>
      </div>
      <button className="save-btn" onClick={handleSave}>Save Settings</button>
    </div>
  );
};

export default Settings;