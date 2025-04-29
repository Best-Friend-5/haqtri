import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaBookmark, FaEnvelope, FaStar, FaCheckCircle, FaList, FaTh, FaDownload, FaArchive, FaTag } from 'react-icons/fa';
import axios from 'axios';
import './MyProperties.css';

const MyProperties = ({ darkMode }) => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    subcategory: [],
    priceMin: '',
    priceMax: '',
    location: '',
    sortBy: 'purchaseDate',
    searchQuery: '',
  });
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({ totalValue: 0, count: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch purchased listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5001/api/marketplace/purchased?page=${page}&limit=12`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const newListings = response.data.listings;
        setListings((prev) => (page === 1 ? newListings : [...prev, ...newListings]));
        setHasMore(response.data.hasMore);
        setStats({
          totalValue: response.data.totalValue,
          count: response.data.totalCount,
        });
        applyFilters(page === 1 ? newListings : [...listings, ...newListings]);
      } catch (err) {
        setError('Failed to load listings. Please try again.');
      }
      setLoading(false);
    };
    fetchListings();
  }, [page]);

  // Apply filters and search
  const applyFilters = (data = listings) => {
    let result = [...data];
    const { category, subcategory, priceMin, priceMax, location, sortBy, searchQuery } = filters;

    if (category !== 'all') {
      result = result.filter((listing) => listing.type === category);
    }
    if (subcategory.length > 0) {
      result = result.filter((listing) => subcategory.includes(listing.subtype));
    }
    if (priceMin) {
      result = result.filter((listing) => listing.price >= parseFloat(priceMin));
    }
    if (priceMax) {
      result = result.filter((listing) => listing.price <= parseFloat(priceMax));
    }
    if (location) {
      result = result.filter((listing) => listing.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (searchQuery) {
      result = result.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortBy) {
      result.sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'purchaseDate') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
    }
    setFilteredListings(result);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (type === 'checkbox') {
        newFilters.subcategory = checked
          ? [...newFilters.subcategory, value]
          : newFilters.subcategory.filter((sub) => sub !== value);
      } else {
        newFilters[name] = value;
      }
      return newFilters;
    });
    applyFilters();
  };

  // Handle search
  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
    applyFilters();
  };

  // Toggle bookmark
  const handleToggleBookmark = async (id) => {
    try {
      await axios.post(
        'http://localhost:5001/api/bookmarks',
        { postId: id },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id ? { ...listing, isBookmarked: !listing.isBookmarked } : listing
        )
      );
      applyFilters();
    } catch (err) {
      setError('Failed to update bookmark.');
    }
  };

  // Contact seller
  const handleContact = async (id) => {
    try {
      await axios.post(
        'http://localhost:5001/api/messages',
        { listingId: id, content: 'Interested in this listing.' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Message sent to seller.');
    } catch (err) {
      setError('Failed to send message.');
    }
  };

  // Export inventory
  const handleExport = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/marketplace/export', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export inventory.');
    }
  };

  // Manage listing (resale, archive, support)
  const handleManageListing = async (id, action) => {
    try {
      if (action === 'resale') {
        await axios.post(
          'http://localhost:5001/api/marketplace/submit',
          { id, status: 'pending' },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        alert('Listing marked for resale.');
      } else if (action === 'archive') {
        await axios.post(
          'http://localhost:5001/api/marketplace/archive',
          { id },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setListings((prev) => prev.filter((listing) => listing.id !== id));
        applyFilters();
        alert('Listing archived.');
      } else if (action === 'support') {
        await axios.post(
          'http://localhost:5001/api/support',
          { listingId: id, issue: 'Support request' },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        alert('Support request submitted.');
      }
    } catch (err) {
      setError(`Failed to ${action} listing.`);
    }
  };

  // Load more
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className={`mp-my-properties ${darkMode ? 'dark' : ''}`}>
      <div className="mp-marketplace-header">
        <div className="mp-marketplace-search">
          <FaSearch className="mp-search-icon" />
          <input
            type="text"
            placeholder="Search your properties..."
            value={filters.searchQuery}
            onChange={handleSearch}
            aria-label="Search purchased listings"
          />
        </div>
        <button className="mp-filter-icon" onClick={() => document.querySelector('.mp-marketplace-filters').classList.toggle('expanded')}>
          <FaFilter />
        </button>
      </div>

      <div className="mp-marketplace-filters">
        <h3>Filter Properties</h3>
        <div className="mp-filter-group">
          <label>Category</label>
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="Properties">Properties</option>
            <option value="Land">Land</option>
            <option value="Materials">Materials</option>
            <option value="Labor">Labor</option>
          </select>
        </div>
        <div className="mp-filter-group">
          <label>Subcategory</label>
          <div className="mp-subcategory-checkboxes">
            {['Villas', 'Apartments', 'Residential Plots', 'Steel', 'Carpenters'].map((sub) => (
              <label key={sub} className="mp-subcategory-label">
                <input
                  type="checkbox"
                  name="subcategory"
                  value={sub}
                  checked={filters.subcategory.includes(sub)}
                  onChange={handleFilterChange}
                />
                {sub}
              </label>
            ))}
          </div>
        </div>
        <div className="mp-filter-group mp-price-range">
          <div className="mp-price-inputs">
            <input
              type="number"
              name="priceMin"
              placeholder="Min Price (AED)"
              value={filters.priceMin}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="priceMax"
              placeholder="Max Price (AED)"
              value={filters.priceMax}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className="mp-filter-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            placeholder="e.g., Dubai Marina"
            value={filters.location}
            onChange={handleFilterChange}
          />
        </div>
        <div className="mp-filter-group">
          <label>Sort By</label>
          <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
            <option value="purchaseDate">Purchase Date</option>
            <option value="price">Price</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      <div className="mp-marketplace-content">
        <div className="mp-stats">
          <h2>My Properties</h2>
          <p>Total Assets: {stats.count} | Total Value: AED {stats.totalValue.toLocaleString()}</p>
          <button className="mp-btn-secondary" onClick={handleExport}>
            <FaDownload /> Export Inventory
          </button>
        </div>
        <div className="mp-view-toggle">
          <button
            className={`mp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <FaTh />
          </button>
          <button
            className={`mp-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <FaList />
          </button>
        </div>
        {error && <p className="mp-marketplace-error">{error}</p>}
        {loading && (
          <div className="mp-loading-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="mp-skeleton-card" />
            ))}
          </div>
        )}
        <div className={`mp-listing-${viewMode}`}>
          {filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <div
                key={listing.id}
                className={`mp-marketplace-card ${viewMode}`}
                onClick={() => setSelectedListing(listing)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedListing(listing)}
              >
                <div className="mp-marketplace-card-images">
                  <img
                    src={listing.images?.[0] || '/images/placeholder.jpg'}
                    alt={listing.title}
                    onError={(e) => (e.target.src = '/images/placeholder.jpg')}
                  />
                  {listing.verified && <span className="mp-badge"><FaCheckCircle /> Verified</span>}
                  <button
                    className="mp-card-save"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(listing.id);
                    }}
                    aria-label={listing.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    <FaBookmark className={listing.isBookmarked ? 'active' : ''} />
                  </button>
                </div>
                <div className="mp-marketplace-card-details">
                  <h3>{listing.title}</h3>
                  <p className="mp-card-location">{listing.location}</p>
                  <p className="mp-card-price">AED {listing.price.toLocaleString()}</p>
                  <p className="mp-card-specs">{listing.details?.specs || 'No specs'}</p>
                  <div className="mp-card-rating">
                    <FaStar /> {listing.rating || 'N/A'}
                  </div>
                  {viewMode === 'list' && (
                    <div className="mp-card-actions">
                      <button
                        className="mp-btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManageListing(listing.id, 'resale');
                        }}
                      >
                        <FaTag /> Mark for Resale
                      </button>
                      <button
                        className="mp-btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManageListing(listing.id, 'archive');
                        }}
                      >
                        <FaArchive /> Archive
                      </button>
                      <button
                        className="mp-btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManageListing(listing.id, 'support');
                        }}
                      >
                        <FaEnvelope /> Request Support
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="mp-no-results">No properties found.</p>
          )}
        </div>
        {hasMore && !loading && (
          <button className="mp-load-more" onClick={handleLoadMore}>
            Load More
          </button>
        )}
      </div>

      {selectedListing && (
        <div className="mp-marketplace-modal">
          <div className="mp-modal-content">
            <button
              className="mp-modal-close"
              onClick={() => setSelectedListing(null)}
              aria-label="Close modal"
            >
              &times;
            </button>
            <div className="mp-media-gallery">
              <div className="mp-gallery-slider">
                <img
                  src={selectedListing.images?.[0] || '/images/placeholder.jpg'}
                  alt={selectedListing.title}
                  onError={(e) => (e.target.src = '/images/placeholder.jpg')}
                />
              </div>
            </div>
            <div className="mp-modal-details">
              <h2>{selectedListing.title}</h2>
              <p className="mp-modal-location">{selectedListing.location}</p>
              <p className="mp-modal-price">AED {selectedListing.price.toLocaleString()}</p>
              <p className="mp-modal-description">{selectedListing.description}</p>
              <p className="mp-modal-specs">{selectedListing.details?.specs || 'No specs'}</p>
              <div className="mp-seller-info">
                <p>Owner: {selectedListing.owner}</p>
                <div className="mp-star">{selectedListing.rating ? `${selectedListing.rating} / 5` : 'N/A'}</div>
                <button
                  className="mp-btn-secondary"
                  onClick={() => handleContact(selectedListing.id)}
                >
                  <FaEnvelope /> Message Owner
                </button>
              </div>
              <div className="mp-modal-actions">
                <button
                  className="mp-btn-primary"
                  onClick={() => handleManageListing(selectedListing.id, 'resale')}
                >
                  Mark for Resale
                </button>
                <button
                  className="mp-btn-secondary"
                  onClick={() => handleManageListing(selectedListing.id, 'archive')}
                >
                  Archive
                </button>
                <button
                  className="mp-btn-secondary"
                  onClick={() => handleManageListing(selectedListing.id, 'support')}
                >
                  Request Support
                </button>
              </div>
              <p className="mp-trust-features">All transactions are secured via escrow.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProperties;