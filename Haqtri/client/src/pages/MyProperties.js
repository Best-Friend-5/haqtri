import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaPlus, FaSort, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import './MyProperties.css';

const MyProperties = ({ darkMode }) => {
  const [purchases, setPurchases] = useState([]);
  const [listings, setListings] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [activeTab, setActiveTab] = useState('purchases');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'Properties',
    location: 'Dubai',
  });
  const [filters, setFilters] = useState({
    category: 'all',
    searchQuery: '',
  });
  const [sortBy, setSortBy] = useState('date-desc');

  // Placeholder data
  const placeholderPurchases = [
    {
      id: '1',
      listing: {
        id: '1',
        title: 'Luxury Villa in Dubai Marina',
        price: 4500000,
        description: 'Spacious villa with sea view',
        category: 'Properties',
        location: 'Dubai',
        image: '/images/property1.jpg',
        user: 'Ali Shariatian',
      },
      purchaseDate: new Date('2025-04-15'),
      status: 'Completed',
    },
    {
      id: '2',
      listing: {
        id: '2',
        title: 'Eco-Friendly Concrete Blocks',
        price: 5000,
        description: 'Sustainable building materials',
        category: 'Materials',
        location: 'Sharjah',
        image: '/images/property3.jpg',
        user: 'Lili Rose',
      },
      purchaseDate: new Date('2025-03-20'),
      status: 'Pending',
    },
  ];

  const placeholderListings = [
    {
      id: '3',
      title: 'Prime Land in Al Reem Island',
      price: 12000000,
      description: 'Ideal for development',
      category: 'Land',
      location: 'Abu Dhabi',
      image: '/images/property2.jpg',
      user: 'You',
    },
    {
      id: '4',
      title: 'Skilled Construction Crew',
      price: 10000,
      description: 'Experienced labor for hire',
      category: 'Labor',
      location: 'Dubai',
      image: '/images/property4.jpg',
      user: 'You',
    },
  ];

  // Category options
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'Properties', label: 'Properties' },
    { id: 'Land', label: 'Land' },
    { id: 'Materials', label: 'Materials' },
    { id: 'Labor', label: 'Labor' },
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch purchases
        const purchasesResponse = await axios.get('http://localhost:5001/api/purchases?page=1&limit=12', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setPurchases(purchasesResponse.data.purchases);

        // Fetch user listings
        const listingsResponse = await axios.get(
          `http://localhost:5001/api/listings?userId=${localStorage.getItem('userId')}&page=1&limit=12`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setListings(listingsResponse.data.listings);

        applyFilters(purchasesResponse.data.purchases, listingsResponse.data.listings);
      } catch (err) {
        setError('Unable to load data. Showing sample content.');
        setPurchases(placeholderPurchases);
        setListings(placeholderListings);
        setFilteredPurchases(placeholderPurchases);
        setFilteredListings(placeholderListings);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Apply filters and sorting
  const applyFilters = (purchasesData = purchases, listingsData = listings) => {
    let filteredPurchases = [...purchasesData];
    let filteredListings = [...listingsData];
    const { category, searchQuery } = filters;

    // Filter by category
    if (category !== 'all') {
      filteredPurchases = filteredPurchases.filter((purchase) => purchase.listing.category === category);
      filteredListings = filteredListings.filter((listing) => listing.category === category);
    }

    // Filter by search query
    if (searchQuery) {
      filteredPurchases = filteredPurchases.filter(
        (purchase) =>
          purchase.listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          purchase.listing.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
      filteredListings = filteredListings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    const sortFn = (a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt);
      } else if (sortBy === 'date-asc') {
        return new Date(a.purchaseDate || a.createdAt) - new Date(b.purchaseDate || b.createdAt);
      } else if (sortBy === 'price-asc') {
        return (a.listing?.price || a.price) - (b.listing?.price || b.price);
      } else if (sortBy === 'price-desc') {
        return (b.listing?.price || b.price) - (a.listing?.price || a.price);
      }
      return 0;
    };

    filteredPurchases.sort(sortFn);
    filteredListings.sort(sortFn);

    setFilteredPurchases(filteredPurchases);
    setFilteredListings(filteredListings);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    applyFilters();
  };

  // Handle search
  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
    applyFilters();
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    applyFilters();
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle create listing
  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category) {
      setError('Title, price, and category are required.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5001/api/listings',
        { ...formData, price: Number(formData.price), image: '/images/property1.jpg' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const newListing = { ...response.data.listing, user: 'You' };
      setListings([newListing, ...listings]);
      setFilteredListings([newListing, ...filteredListings]);
      setShowCreateModal(false);
      setFormData({ title: '', price: '', description: '', category: 'Properties', location: 'Dubai' });
      setError('');
    } catch (err) {
      setError('Failed to create listing. Added to sample content.');
      const newListing = {
        id: Date.now().toString(),
        ...formData,
        price: Number(formData.price),
        image: '/images/property1.jpg',
        user: 'You',
      };
      setListings([newListing, ...listings]);
      setFilteredListings([newListing, ...filteredListings]);
      setShowCreateModal(false);
      setFormData({ title: '', price: '', description: '', category: 'Properties', location: 'Dubai' });
    }
  };

  // Render content
  const renderContent = () => {
    const data = activeTab === 'purchases' ? filteredPurchases : filteredListings;
    return (
      <div className="mp-properties-grid">
        {loading && (
          <div className="mp-loading">
            <FaSpinner className="mp-spinner" />
          </div>
        )}
        {error && <p className="mp-properties-error">{error}</p>}
        {data.length ? (
          data.map((item) => (
            <div key={item.id} className="mp-listing-card" role="button" tabIndex={0}>
              <div className="mp-listing-image">
                <img src={item.listing?.image || item.image} alt={item.listing?.title || item.title} />
              </div>
              <div className="mp-listing-details">
                <h3>{item.listing?.title || item.title}</h3>
                <p className="mp-listing-price">AED {(item.listing?.price || item.price).toLocaleString()}</p>
                <p className="mp-listing-location">{item.listing?.location || item.location}</p>
                <p className="mp-listing-category">{item.listing?.category || item.category}</p>
                {activeTab === 'purchases' ? (
                  <>
                    <p className="mp-listing-user">Seller: {item.listing.user}</p>
                    <p className="mp-listing-status">Status: {item.status}</p>
                    <p className="mp-listing-date">
                      Purchased: {new Date(item.purchaseDate).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <p className="mp-listing-description">{item.description || 'No description'}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No {activeTab === 'purchases' ? 'purchases' : 'listings'} found.</p>
        )}
      </div>
    );
  };

  return (
    <div className={`mp-properties ${darkMode ? 'dark' : ''}`}>
      <h2>My Transactions</h2>
      <div className="mp-properties-header">
        <div className="mp-properties-search">
          <FaSearch className="mp-search-icon" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'purchases' ? 'purchases' : 'listings'}...`}
            value={filters.searchQuery}
            onChange={handleSearch}
            aria-label={`Search ${activeTab}`}
          />
        </div>
        <button
          className="mp-filter-icon"
          onClick={() => document.querySelector('.mp-properties-filters').classList.toggle('expanded')}
        >
          <FaFilter />
        </button>
        {activeTab === 'listings' && (
          <button className="mp-btn-primary" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Create Listing
          </button>
        )}
      </div>

      <div className="mp-properties-tabs">
        <button
          className={`mp-tab ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          Purchased Items
        </button>
        <button
          className={`mp-tab ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          My Listings
        </button>
      </div>

      <div className="mp-properties-filters">
        <h3>Filter {activeTab === 'purchases' ? 'Purchases' : 'Listings'}</h3>
        <div className="mp-filter-group">
          <label>Category</label>
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mp-filter-group">
          <label>Sort By</label>
          <select name="sortBy" value={sortBy} onChange={handleSortChange}>
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>
      </div>

      {showCreateModal && (
        <div className="mp-create-modal">
          <div className="mp-modal-content">
            <button
              className="mp-modal-close"
              onClick={() => setShowCreateModal(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <h3>Create New Listing</h3>
            <form onSubmit={handleCreateListing}>
              <div className="mp-form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="mp-form-group">
                <label>Price (AED)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="mp-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>
              <div className="mp-form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleFormChange}>
                  {categories.slice(1).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mp-form-group">
                <label>Location</label>
                <select name="location" value={formData.location} onChange={handleFormChange}>
                  {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'].map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="mp-btn-primary">
                <FaPlus /> Create
              </button>
            </form>
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default MyProperties;