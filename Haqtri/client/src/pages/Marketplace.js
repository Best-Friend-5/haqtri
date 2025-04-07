import React, { useState, useEffect } from 'react';
import { FaHome, FaLandmark, FaTools, FaUserTie, FaShoppingCart, FaSearch, FaFilter, FaFileUpload, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import './Marketplace.css';

const Marketplace = ({ darkMode }) => {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState({ pending: [], verified: [], purchased: [] });
  const [newListing, setNewListing] = useState({
    type: 'house',
    title: '',
    description: '',
    price: '',
    location: '',
    images: [],
    documents: [],
    details: { bedrooms: '', bathrooms: '', area: '', materials: '', certifications: '', experience: '' },
  });
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('verified');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5001/api';
  const SERVER_BASE_URL = 'http://localhost:5001';
  const token = localStorage.getItem('token');

  // Fetch User and Listings
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        if (!response.data.isVerified) setError('Only verified users can access the marketplace');
      } catch (err) {
        setError('Failed to fetch user data. Please sign in.');
        setUser(null);
      }
    };

    const fetchListings = async () => {
      setLoading(true);
      try {
        const [pendingRes, verifiedRes, purchasedRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/marketplace/pending`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/marketplace/verified`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/marketplace/purchased`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const transform = (data) => data.map(listing => ({
          ...listing,
          images: listing.images.map(img => img.startsWith('http') ? img : `${SERVER_BASE_URL}${img}`),
          documents: listing.documents.map(doc => `${SERVER_BASE_URL}${doc}`),
        }));
        setListings({
          pending: transform(pendingRes.data),
          verified: transform(verifiedRes.data),
          purchased: transform(purchasedRes.data),
        });
      } catch (err) {
        console.error('Fetch listings error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch listings');
        setListings(mockListings);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
      fetchListings();
    } else {
      setError('Please sign in to view the marketplace');
    }
  }, [token]);

  // Handle Listing Submission
  const handleListingSubmit = async (e) => {
    e.preventDefault();
    if (!user?.isVerified) {
      setError('Only verified users can submit listings');
      return;
    }
    if (!newListing.title.trim() || !newListing.price || !newListing.documents.length) {
      setError('Title, price, and at least one document are required');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('type', newListing.type);
    formData.append('title', newListing.title);
    formData.append('description', newListing.description);
    formData.append('price', newListing.price);
    formData.append('location', newListing.location);
    formData.append('details', JSON.stringify(newListing.details));
    newListing.images.forEach((img) => formData.append('images', img));
    newListing.documents.forEach((doc) => formData.append('documents', doc));

    try {
      const response = await axios.post(`${API_BASE_URL}/marketplace/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const newListingData = {
        ...response.data.listing,
        images: response.data.listing.images.map(img => img.startsWith('http') ? img : `${SERVER_BASE_URL}${img}`),
        documents: response.data.listing.documents.map(doc => `${SERVER_BASE_URL}${doc}`),
      };
      setListings(prev => ({ ...prev, pending: [newListingData, ...prev.pending] }));
      setNewListing({
        type: 'house',
        title: '',
        description: '',
        price: '',
        location: '',
        images: [],
        documents: [],
        details: { bedrooms: '', bathrooms: '', area: '', materials: '', certifications: '', experience: '' },
      });
      setError('Listing submitted for verification');
    } catch (err) {
      console.error('Submit listing error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to submit listing');
    } finally {
      setLoading(false);
    }
  };

  // Handle Purchase (Placeholder)
  const handlePurchase = async (listingId) => {
    if (!user?.isVerified) {
      setError('Only verified users can purchase listings');
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/marketplace/purchase/${listingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const purchasedListing = listings.verified.find(l => l.id === listingId);
      setListings(prev => ({
        ...prev,
        verified: prev.verified.filter(l => l.id !== listingId),
        purchased: [purchasedListing, ...prev.purchased],
      }));
      setError('Purchase successful');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to purchase listing');
    }
  };

  // Filter and Search Logic
  const filteredListings = listings[activeTab]
    .filter(listing => filter === 'all' || listing.type === filter)
    .filter(listing => listing.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      listing.description.toLowerCase().includes(searchQuery.toLowerCase()));

  // Mock Data
  const mockListings = {
    pending: [
      { id: 1, type: 'house', title: 'Pending Villa', description: 'Awaiting verification', price: 500000, location: 'Dubai', images: ['/images/house1.jpg'], documents: ['/docs/deed.pdf'], details: { bedrooms: '3', bathrooms: '2', area: '2000 sqft' } },
    ],
    verified: [
      { id: 2, type: 'land', title: 'Prime Plot', description: '5-acre land', price: 200000, location: 'Sharjah', images: ['/images/land1.jpg'], documents: ['/docs/title.pdf'], details: { area: '5 acres' } },
      { id: 3, type: 'material', title: 'Steel Beams', description: '10 tons', price: 10000, location: 'Abu Dhabi', images: ['/images/material1.jpg'], documents: ['/docs/invoice.pdf'], details: { materials: 'Steel' } },
      { id: 4, type: 'worker', title: 'Skilled Carpenter', description: '10 years exp', price: 50, location: 'Dubai', images: ['/images/worker1.jpg'], documents: ['/docs/cert.pdf'], details: { experience: '10 years', certifications: 'Carpentry Cert' } },
    ],
    purchased: [],
  };

  return (
    <div className={`marketplace-page ${darkMode ? 'dark' : ''}`}>
      <header className="marketplace-header">
        <h1>Haqtri Marketplace</h1>
        <div className="marketplace-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="marketplace-tabs">
        <button onClick={() => setActiveTab('verified')} className={activeTab === 'verified' ? 'active' : ''}>
          Verified Listings
        </button>
        <button onClick={() => setActiveTab('pending')} className={activeTab === 'pending' ? 'active' : ''}>
          Pending Listings
        </button>
        <button onClick={() => setActiveTab('purchased')} className={activeTab === 'purchased' ? 'active' : ''}>
          Purchased Listings
        </button>
      </div>

      {/* Filters */}
      <div className="marketplace-filters">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>
          <FaShoppingCart /> All
        </button>
        <button onClick={() => setFilter('house')} className={filter === 'house' ? 'active' : ''}>
          <FaHome /> Houses
        </button>
        <button onClick={() => setFilter('land')} className={filter === 'land' ? 'active' : ''}>
          <FaLandmark /> Land
        </button>
        <button onClick={() => setFilter('material')} className={filter === 'material' ? 'active' : ''}>
          <FaTools /> Materials
        </button>
        <button onClick={() => setFilter('worker')} className={filter === 'worker' ? 'active' : ''}>
          <FaUserTie /> Workers
        </button>
      </div>

      {/* Listing Form */}
      {user?.isVerified && (
        <form className="marketplace-form" onSubmit={handleListingSubmit}>
          <h2>Submit a New Listing</h2>
          <select value={newListing.type} onChange={(e) => setNewListing({ ...newListing, type: e.target.value })}>
            <option value="house">House</option>
            <option value="land">Land</option>
            <option value="material">Building Material</option>
            <option value="worker">Worker</option>
          </select>
          <input type="text" placeholder="Title" value={newListing.title} onChange={(e) => setNewListing({ ...newListing, title: e.target.value })} />
          <textarea placeholder="Description" value={newListing.description} onChange={(e) => setNewListing({ ...newListing, description: e.target.value })} />
          <input type="number" placeholder="Price (AED)" value={newListing.price} onChange={(e) => setNewListing({ ...newListing, price: e.target.value })} />
          <input type="text" placeholder="Location" value={newListing.location} onChange={(e) => setNewListing({ ...newListing, location: e.target.value })} />
          
          {/* Detailed Fields */}
          {newListing.type === 'house' && (
            <div className="marketplace-details">
              <input type="number" placeholder="Bedrooms" value={newListing.details.bedrooms} onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, bedrooms: e.target.value } })} />
              <input type="number" placeholder="Bathrooms" value={newListing.details.bathrooms} onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, bathrooms: e.target.value } })} />
              <input type="text" placeholder="Area (sqft)" value={newListing.details.area} onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, area: e.target.value } })} />
            </div>
          )}
          {newListing.type === 'land' && (
            <div className="marketplace-details">
              <input type="text" placeholder="Area (acres/sqft)" value={newListing.details.area} onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, area: e.target.value } })} />
            </div>
          )}
          {newListing.type === 'material' && (
            <div className="marketplace-details">
              <input type="text" placeholder="Materials (e.g., Steel)" value={newListing.details.materials} onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, materials: e.target.value } })} />
            </div>
          )}
          {newListing.type === 'worker' && (
            <div className="marketplace-details">
              <input type="text" placeholder="Experience (years)" value={newListing.details.experience} onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, experience: e.target.value } })} />
              <input type="text" placeholder="Certifications" value={newListing.details.certifications} onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, certifications: e.target.value } })} />
            </div>
          )}

          <input type="file" accept="image/*" multiple onChange={(e) => setNewListing({ ...newListing, images: Array.from(e.target.files).slice(0, 4) })} />
          <input type="file" accept=".pdf,.doc,.docx" multiple onChange={(e) => setNewListing({ ...newListing, documents: Array.from(e.target.files) })} />
          <button type="submit" disabled={loading || !newListing.title.trim() || !newListing.price || !newListing.documents.length}>
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>
          {error && <p className="marketplace-error">{error}</p>}
        </form>
      )}

      {/* Listings Display */}
      <div className="marketplace-listings">
        {loading && <p>Loading listings...</p>}
        {!loading && filteredListings.length === 0 && <p>No listings found.</p>}
        {filteredListings.map((listing) => (
          <div key={listing.id} className="marketplace-card">
            <div className="marketplace-card-images">
              {listing.images.length > 0 ? (
                <img src={listing.images[0]} alt={listing.title} />
              ) : (
                <div className="marketplace-placeholder">No Image</div>
              )}
            </div>
            <div className="marketplace-card-details">
              <h3>{listing.title}</h3>
              <p>{listing.description}</p>
              <p><strong>Price:</strong> AED {listing.price}</p>
              <p><strong>Location:</strong> {listing.location}</p>
              <p><strong>Type:</strong> {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}</p>
              {listing.details.bedrooms && <p><strong>Bedrooms:</strong> {listing.details.bedrooms}</p>}
              {listing.details.bathrooms && <p><strong>Bathrooms:</strong> {listing.details.bathrooms}</p>}
              {listing.details.area && <p><strong>Area:</strong> {listing.details.area}</p>}
              {listing.details.materials && <p><strong>Materials:</strong> {listing.details.materials}</p>}
              {listing.details.experience && <p><strong>Experience:</strong> {listing.details.experience}</p>}
              {listing.details.certifications && <p><strong>Certifications:</strong> {listing.details.certifications}</p>}
              {activeTab === 'verified' && (
                <button className="marketplace-contact-btn" onClick={() => handlePurchase(listing.id)}>
                  Purchase
                </button>
              )}
              {activeTab === 'pending' && <p className="marketplace-status">Awaiting Verification</p>}
              {activeTab === 'purchased' && <p className="marketplace-status"><FaCheckCircle /> Purchased</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;