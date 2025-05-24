import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaList, FaBookmark, FaTv, FaSave, FaCamera } from 'react-icons/fa';
import axios from 'axios';
import './Profile.css';

const Profile = ({ darkMode }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', profileImg: '' });
  const [listings, setListings] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [streams, setStreams] = useState([]);
  const [activeTab, setActiveTab] = useState('listings');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Placeholder data for API failure
  const placeholderUser = {
    id: '1',
    username: 'Sample User',
    email: 'user@example.com',
    profileImg: '/images/profpic.jpg',
  };

  const placeholderListings = [
    {
      id: '1',
      title: 'Luxury Villa in Dubai Marina',
      price: 4500000,
      description: 'Spacious villa with sea view',
      category: 'Properties',
      user: 'Sample User',
    },
  ];

  const placeholderBookmarks = [
    {
      id: '1',
      listing: {
        id: '2',
        title: 'Prime Land in Al Reem Island',
        price: 12000000,
        description: 'Ideal for development',
        category: 'Land',
        user: 'Hassan Al-Mansoori',
      },
    },
  ];

  const placeholderStreams = [
    {
      id: '1',
      title: 'Live Property Tour: Dubai Marina Villa',
      streamer: 'Sample User',
      profileImg: '/images/profpic.jpg',
      isLive: false,
      category: 'Properties',
    },
  ];

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/users/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(response.data);
        setFormData({
          username: response.data.username,
          email: response.data.email,
          profileImg: response.data.profileImg || '/images/profpic.jpg',
        });
        setImagePreview(response.data.profileImg || '/images/profpic.jpg');
      } catch (err) {
        setError('Failed to load profile. Showing sample data.');
        setUser(placeholderUser);
        setFormData({
          username: placeholderUser.username,
          email: placeholderUser.email,
          profileImg: placeholderUser.profileImg,
        });
        setImagePreview(placeholderUser.profileImg);
      }
    };
    fetchProfile();
  }, []);

  // Fetch user data (listings, bookmarks, streams)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch listings
        const listingsResponse = await axios.get(
          `http://localhost:5001/api/listings?userId=${user?.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setListings(listingsResponse.data.listings);

        // Fetch bookmarks
        const bookmarksResponse = await axios.get('http://localhost:5001/api/bookmarks', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setBookmarks(bookmarksResponse.data.bookmarks);

        // Fetch streams
        const streamsResponse = await axios.get(
          `http://localhost:5001/api/streams?userId=${user?.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setStreams(streamsResponse.data.streams);
      } catch (err) {
        setError('Failed to load data. Showing sample data.');
        setListings(placeholderListings);
        setBookmarks(placeholderBookmarks);
        setStreams(placeholderStreams);
      }
    };
    if (user?.id) fetchUserData();
  }, [user?.id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImg: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        'http://localhost:5001/api/users/profile',
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUser(response.data.user);
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'listings':
        return (
          <div className="mp-profile-table">
            <h3>My Listings</h3>
            {listings.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price (AED)</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td>{listing.title}</td>
                      <td>{listing.category}</td>
                      <td>{listing.price.toLocaleString()}</td>
                      <td>{listing.description || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No listings found.</p>
            )}
          </div>
        );
      case 'bookmarks':
        return (
          <div className="mp-profile-table">
            <h3>Bookmarked Listings</h3>
            {bookmarks.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price (AED)</th>
                    <th>Seller</th>
                  </tr>
                </thead>
                <tbody>
                  {bookmarks.map((bookmark) => (
                    <tr key={bookmark.id}>
                      <td>{bookmark.listing.title}</td>
                      <td>{bookmark.listing.category}</td>
                      <td>{bookmark.listing.price.toLocaleString()}</td>
                      <td>{bookmark.listing.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No bookmarks found.</p>
            )}
          </div>
        );
      case 'streams':
        return (
          <div className="mp-profile-table">
            <h3>My Streams</h3>
            {streams.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {streams.map((stream) => (
                    <tr key={stream.id}>
                      <td>{stream.title}</td>
                      <td>{stream.category}</td>
                      <td>{stream.isLive ? 'Live' : 'Ended'}</td>
                      <td>{new Date(stream.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No streams found.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`mp-profile ${darkMode ? 'dark' : ''}`}>
      <h2>Profile</h2>
      {error && <p className="mp-profile-error">{error}</p>}
      {user ? (
        <div className="mp-profile-content">
          <div className="mp-profile-header">
            <div className="mp-profile-image">
              <img src={imagePreview} alt={user.username} />
              {isEditing && (
                <label className="mp-image-upload">
                  <FaCamera />
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                </label>
              )}
            </div>
            {isEditing ? (
              <form className="mp-profile-form" onSubmit={handleUpdateProfile}>
                <div className="mp-form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mp-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mp-form-actions">
                  <button type="submit" className="mp-btn-primary">
                    <FaSave /> Save
                  </button>
                  <button
                    type="button"
                    className="mp-btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mp-profile-details">
                <h3>{user.username}</h3>
                <p>{user.email}</p>
                <button
                  className="mp-btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit /> Edit Profile
                </button>
              </div>
            )}
          </div>
          <div className="mp-profile-tabs">
            <button
              className={`mp-tab ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => setActiveTab('listings')}
            >
              <FaList /> Listings
            </button>
            <button
              className={`mp-tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              <FaBookmark /> Bookmarks
            </button>
            <button
              className={`mp-tab ${activeTab === 'streams' ? 'active' : ''}`}
              onClick={() => setActiveTab('streams')}
            >
              <FaTv /> Streams
            </button>
          </div>
          {renderTabContent()}
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;