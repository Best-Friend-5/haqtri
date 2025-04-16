import React, { useState, useEffect, useCallback } from 'react';
import {
  FaHome, FaLandmark, FaTools, FaUserTie, FaSearch, FaFilter, FaCheckCircle,
  FaMap, FaStar, FaArrowLeft, FaArrowRight, FaEnvelope, FaFlag, FaHeart
} from 'react-icons/fa';
import axios from 'axios';
import villa1 from '../images/villa1.jpg';
import villa2 from '../images/villa2.jpg';
import apartment1 from '../images/apartment1.jpg';
import townhouse1 from '../images/townhouse1.jpg';
import penthouse1 from '../images/penthouse1.jpg';
import penthouse2 from '../images/penthouse2.jpg';
import land1 from '../images/land1.jpg';
import land2 from '../images/land2.jpg';
import plot1 from '../images/plot1.jpg';
import plot2 from '../images/plot2.jpg';
import steel1 from '../images/steel1.jpg';
import cement1 from '../images/cement1.jpg';
import wood1 from '../images/wood1.jpg';
import glass1 from '../images/glass1.jpg';
import carpenter1 from '../images/carpenter1.jpg';
import electrician1 from '../images/electrician1.jpg';
import plumber1 from '../images/plumber1.jpg';
import mason1 from '../images/mason1.jpg';
import villa3 from '../images/villa3.jpg';
import apartment2 from '../images/apartment2.jpg';
import land3 from '../images/land3.jpg';
import steel2 from '../images/steel2.jpg';
import carpenter2 from '../images/carpenter2.jpg';
import electrician2 from '../images/electrician2.jpg';
import './Marketplace.css';

const Marketplace = ({ darkMode }) => {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState({ pending: [], verified: [], purchased: [], featured: [] });
  const [newListing, setNewListing] = useState({
    type: 'property',
    subtype: '',
    title: '',
    description: '',
    price: '',
    location: '',
    images: [],
    documents: [],
    details: { bedrooms: '', bathrooms: '', area: '', materials: '', certifications: '', experience: '' },
    keywords: '',
  });
  const [filter, setFilter] = useState({ category: 'all', subcategories: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('featured');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedListing, setSelectedListing] = useState(null);
  const [savedFilters, setSavedFilters] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [page, setPage] = useState(1);
  const listingsPerPage = 12;

  const API_BASE_URL = 'http://localhost:5001/api';
  const SERVER_BASE_URL = 'http://localhost:5001';
  const token = localStorage.getItem('token');

  const categories = [
    { id: 'property', name: 'Properties', icon: <FaHome />, subcategories: ['Villas', 'Apartments', 'Townhouses', 'Penthouses'] },
    { id: 'land', name: 'Land', icon: <FaLandmark />, subcategories: ['Residential Plots', 'Commercial Plots', 'Agricultural Land'] },
    { id: 'material', name: 'Construction Materials', icon: <FaTools />, subcategories: ['Steel', 'Cement', 'Wood', 'Glass'] },
    { id: 'labor', name: 'Labor Services', icon: <FaUserTie />, subcategories: ['Carpenters', 'Electricians', 'Plumbers', 'Masons'] },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        if (!response.data.isVerified) setError('Only verified users can access the marketplace.');
      } catch (err) {
        setError('Failed to fetch user data. Please sign in.');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchListings = async () => {
      setLoading(true);
      try {
        const [pendingRes, verifiedRes, purchasedRes, featuredRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/marketplace/pending`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/marketplace/verified`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/marketplace/purchased`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/marketplace/featured`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const transform = (data) =>
          data.map((listing) => ({
            ...listing,
            images: listing.images.map((img) => (img.startsWith('http') ? img : `${SERVER_BASE_URL}${img}`)),
            documents: listing.documents.map((doc) => `${SERVER_BASE_URL}${doc}`),
          }));
        setListings({
          pending: transform(pendingRes.data),
          verified: transform(verifiedRes.data),
          purchased: transform(purchasedRes.data),
          featured: transform(featuredRes.data),
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch listings.');
        setListings(mockListings);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
      fetchListings();
    } else {
      setError('Please sign in to view the marketplace.');
    }
  }, [token]);

  const handleListingSubmit = async (e) => {
    e.preventDefault();
    if (!user?.isVerified) {
      setError('Only verified users can submit listings.');
      return;
    }
    const formData = new FormData();
    Object.entries(newListing).forEach(([key, value]) => {
      if (key === 'details') formData.append(key, JSON.stringify(value));
      else if (key === 'images' || key === 'documents') value.forEach((file) => formData.append(key, file));
      else formData.append(key, value);
    });

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/marketplace/submit`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      const newListingData = {
        ...response.data.listing,
        images: response.data.listing.images.map((img) => `${SERVER_BASE_URL}${img}`),
        documents: response.data.listing.documents.map((doc) => `${SERVER_BASE_URL}${doc}`),
      };
      setListings((prev) => ({ ...prev, pending: [newListingData, ...prev.pending] }));
      setNewListing({
        type: 'property',
        subtype: '',
        title: '',
        description: '',
        price: '',
        location: '',
        images: [],
        documents: [],
        details: { bedrooms: '', bathrooms: '', area: '', materials: '', certifications: '', experience: '' },
        keywords: '',
      });
      setError('Listing submitted for verification.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit listing.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (listingId) => {
    if (!user?.isVerified) {
      setError('Only verified users can purchase listings.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/marketplace/purchase/${listingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings((prev) => ({
        ...prev,
        verified: prev.verified.filter((l) => l.id !== listingId),
        purchased: [...prev.purchased, response.data.listing],
      }));
      setError('Purchase successful!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to purchase listing.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (listingId) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/bookmarks`, { post_id: listingId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setError('Listing saved!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save listing.');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSeller = async (listingId) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/messages`, { listing_id: listingId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setError('Message sent to seller!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (listingId) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/reports`, { listing_id: listingId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setError('Listing reported.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report listing.');
    } finally {
      setLoading(false);
    }
  };

  const scrollCategories = (direction) => {
    const container = document.querySelector('.mp-marketplace-tabs');
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredListings = listings[activeTab]
    .filter((listing) => filter.category === 'all' || listing.type === filter.category)
    .filter((listing) => filter.subcategories.length === 0 || filter.subcategories.includes(listing.subtype))
    .filter(
      (listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.keywords?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((listing) => listing.price >= priceRange[0] && listing.price <= priceRange[1]);

  const paginatedListings = filteredListings.slice(0, page * listingsPerPage);

  const mockListings = {
    pending: [
      {
        id: 1,
        type: 'property',
        subtype: 'Villas',
        title: 'Luxury Beachfront Villa',
        description: 'Spacious villa with sea views',
        price: 1200000,
        location: 'Dubai Marina',
        images: [villa1],
        documents: ['/docs/deed1.pdf'],
        details: { bedrooms: '4', bathrooms: '3', area: '3000 sqft' },
        keywords: 'villa luxury beachfront',
      },
      {
        id: 2,
        type: 'land',
        subtype: 'Residential Plots',
        title: 'Residential Plot in Al Barsha',
        description: 'Prime land for development',
        price: 350000,
        location: 'Al Barsha',
        images: [land1],
        documents: ['/docs/title1.pdf'],
        details: { area: '4 acres' },
        keywords: 'land residential plot',
      },
      {
        id: 3,
        type: 'material',
        subtype: 'Steel',
        title: 'High-Grade Steel Beams',
        description: 'Durable steel for construction',
        price: 15000,
        location: 'Jebel Ali',
        images: [steel1],
        documents: ['/docs/invoice1.pdf'],
        details: { materials: 'Steel', certifications: 'ISO 9001' },
        keywords: 'steel construction',
      },
      {
        id: 4,
        type: 'labor',
        subtype: 'Carpenters',
        title: 'Expert Carpenter Team',
        description: 'Skilled carpenters for hire',
        price: 75,
        location: 'Deira',
        images: [carpenter1],
        documents: ['/docs/cert1.pdf'],
        details: { experience: '12 years', certifications: 'Carpentry Cert' },
        keywords: 'carpenter skilled',
      },
      {
        id: 5,
        type: 'property',
        subtype: 'Apartments',
        title: 'Downtown Apartment',
        description: 'Modern apartment near Burj Khalifa',
        price: 800000,
        location: 'Downtown Dubai',
        images: [apartment1],
        documents: ['/docs/deed2.pdf'],
        details: { bedrooms: '2', bathrooms: '2', area: '1500 sqft' },
        keywords: 'apartment luxury downtown',
      },
      {
        id: 6,
        type: 'land',
        subtype: 'Commercial Plots',
        title: 'Commercial Plot in Business Bay',
        description: 'Ideal for office development',
        price: 600000,
        location: 'Business Bay',
        images: [plot1],
        documents: ['/docs/title2.pdf'],
        details: { area: '6 acres' },
        keywords: 'land commercial plot',
      },
    ],
    verified: [
      {
        id: 7,
        type: 'property',
        subtype: 'Townhouses',
        title: 'Modern Townhouse in Jumeirah',
        description: 'Family-friendly townhouse',
        price: 950000,
        location: 'Jumeirah',
        images: [townhouse1],
        documents: ['/docs/deed3.pdf'],
        details: { bedrooms: '3', bathrooms: '3', area: '2500 sqft' },
        keywords: 'townhouse family jumeirah',
      },
      {
        id: 8,
        type: 'land',
        subtype: 'Agricultural Land',
        title: 'Fertile Land in Al Ain',
        description: 'Perfect for farming',
        price: 200000,
        location: 'Al Ain',
        images: [land2],
        documents: ['/docs/title3.pdf'],
        details: { area: '10 acres' },
        keywords: 'land agricultural',
      },
      {
        id: 9,
        type: 'material',
        subtype: 'Cement',
        title: 'Premium Cement Bags',
        description: 'High-quality cement supply',
        price: 5000,
        location: 'Sharjah',
        images: [cement1],
        documents: ['/docs/invoice2.pdf'],
        details: { materials: 'Cement', certifications: 'ISO 14001' },
        keywords: 'cement construction',
      },
      {
        id: 10,
        type: 'labor',
        subtype: 'Electricians',
        title: 'Certified Electrician',
        description: 'Expert electrical services',
        price: 60,
        location: 'Abu Dhabi',
        images: [electrician1],
        documents: ['/docs/cert2.pdf'],
        details: { experience: '8 years', certifications: 'Electrical Cert' },
        keywords: 'electrician skilled',
      },
      {
        id: 11,
        type: 'property',
        subtype: 'Penthouses',
        title: 'Skyline Penthouse',
        description: 'Luxury penthouse with city views',
        price: 2000000,
        location: 'Sheikh Zayed Road',
        images: [penthouse1],
        documents: ['/docs/deed4.pdf'],
        details: { bedrooms: '5', bathrooms: '4', area: '4000 sqft' },
        keywords: 'penthouse luxury skyline',
      },
      {
        id: 12,
        type: 'material',
        subtype: 'Wood',
        title: 'Oak Timber Supply',
        description: 'Premium wood for interiors',
        price: 8000,
        location: 'Ajman',
        images: [wood1],
        documents: ['/docs/invoice3.pdf'],
        details: { materials: 'Oak Wood', certifications: 'FSC Certified' },
        keywords: 'wood interior',
      },
    ],
    purchased: [
      {
        id: 13,
        type: 'property',
        subtype: 'Villas',
        title: 'Palm Jumeirah Villa',
        description: 'Exclusive villa on the Palm',
        price: 2500000,
        location: 'Palm Jumeirah',
        images: [villa2],
        documents: ['/docs/deed5.pdf'],
        details: { bedrooms: '6', bathrooms: '5', area: '6000 sqft' },
        keywords: 'villa luxury palm',
      },
      {
        id: 14,
        type: 'land',
        subtype: 'Residential Plots',
        title: 'Plot in Emirates Hills',
        description: 'Prestigious residential land',
        price: 450000,
        location: 'Emirates Hills',
        images: [plot2],
        documents: ['/docs/title4.pdf'],
        details: { area: '5 acres' },
        keywords: 'land residential emirates',
      },
      {
        id: 15,
        type: 'material',
        subtype: 'Glass',
        title: 'Tempered Glass Panels',
        description: 'High-strength glass for facades',
        price: 12000,
        location: 'Ras Al Khaimah',
        images: [glass1],
        documents: ['/docs/invoice4.pdf'],
        details: { materials: 'Tempered Glass', certifications: 'ISO 9001' },
        keywords: 'glass facade',
      },
      {
        id: 16,
        type: 'labor',
        subtype: 'Plumbers',
        title: 'Professional Plumber',
        description: 'Reliable plumbing services',
        price: 55,
        location: 'Al Quoz',
        images: [plumber1],
        documents: ['/docs/cert3.pdf'],
        details: { experience: '10 years', certifications: 'Plumbing Cert' },
        keywords: 'plumber skilled',
      },
      {
        id: 17,
        type: 'property',
        subtype: 'Apartments',
        title: 'Marina View Apartment',
        description: 'Cozy apartment with marina views',
        price: 700000,
        location: 'Dubai Marina',
        images: [apartment2],
        documents: ['/docs/deed6.pdf'],
        details: { bedrooms: '1', bathrooms: '1', area: '1000 sqft' },
        keywords: 'apartment marina',
      },
      {
        id: 18,
        type: 'labor',
        subtype: 'Masons',
        title: 'Skilled Mason Crew',
        description: 'Expert masonry services',
        price: 70,
        location: 'Umm Al Quwain',
        images: [mason1],
        documents: ['/docs/cert4.pdf'],
        details: { experience: '15 years', certifications: 'Masonry Cert' },
        keywords: 'mason skilled',
      },
    ],
    featured: [
      {
        id: 19,
        type: 'property',
        subtype: 'Penthouses',
        title: 'Burj Al Arab Penthouse',
        description: 'Iconic luxury penthouse',
        price: 3000000,
        location: 'Umm Suqeim',
        images: [penthouse2],
        documents: ['/docs/deed7.pdf'],
        details: { bedrooms: '4', bathrooms: '4', area: '5000 sqft' },
        keywords: 'penthouse luxury burj',
      },
      {
        id: 20,
        type: 'land',
        subtype: 'Commercial Plots',
        title: 'Downtown Commercial Plot',
        description: 'Prime location for business',
        price: 800000,
        location: 'Downtown Dubai',
        images: [land3],
        documents: ['/docs/title5.pdf'],
        details: { area: '8 acres' },
        keywords: 'land commercial downtown',
      },
      {
        id: 21,
        type: 'material',
        subtype: 'Steel',
        title: 'Reinforced Steel Bars',
        description: 'Top-quality steel for structures',
        price: 20000,
        location: 'Dubai Industrial City',
        images: [steel2],
        documents: ['/docs/invoice5.pdf'],
        details: { materials: 'Steel', certifications: 'ISO 9001' },
        keywords: 'steel construction',
      },
      {
        id: 22,
        type: 'labor',
        subtype: 'Carpenters',
        title: 'Master Carpenter',
        description: 'Craftsmanship for interiors',
        price: 80,
        location: 'Jumeirah',
        images: [carpenter2],
        documents: ['/docs/cert5.pdf'],
        details: { experience: '20 years', certifications: 'Master Carpentry Cert' },
        keywords: 'carpenter luxury',
      },
      {
        id: 23,
        type: 'property',
        subtype: 'Villas',
        title: 'Golf Course Villa',
        description: 'Villa with golf course views',
        price: 1800000,
        location: 'Emirates Hills',
        images: [villa3],
        documents: ['/docs/deed8.pdf'],
        details: { bedrooms: '5', bathrooms: '4', area: '4500 sqft' },
        keywords: 'villa luxury golf',
      },
      {
        id: 24,
        type: 'labor',
        subtype: 'Electricians',
        title: 'Advanced Electrician',
        description: 'Smart home installations',
        price: 65,
        location: 'Business Bay',
        images: [electrician2],
        documents: ['/docs/cert6.pdf'],
        details: { experience: '9 years', certifications: 'Smart Home Cert' },
        keywords: 'electrician smart home',
      },
    ],
  };

  return (
    <div className={`mp-marketplace-page ${darkMode ? 'dark' : ''}`} aria-label="Marketplace">
      <header className="mp-marketplace-header">
        <div className="mp-marketplace-search">
          <FaSearch className="mp-search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by title, location, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search listings"
          />
          <FaFilter
            className="mp-filter-icon"
            onClick={() => document.querySelector('.mp-marketplace-filters').classList.toggle('expanded')}
            aria-label="Toggle filters"
          />
        </div>
      </header>

      <div className="mp-marketplace-tabs-wrapper">
        <button className="mp-tab-nav mp-tab-prev" onClick={() => scrollCategories('left')} aria-label="Scroll categories left">
          <FaArrowLeft />
        </button>
        <div className="mp-marketplace-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={activeTab === cat.id ? 'active' : ''}
              aria-current={activeTab === cat.id ? 'true' : 'false'}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
        <button className="mp-tab-nav mp-tab-next" onClick={() => scrollCategories('right')} aria-label="Scroll categories right">
          <FaArrowRight />
        </button>
      </div>

      <div className="mp-marketplace-filters">
        <h3>Refine Your Search</h3>
        <div className="mp-filter-group">
          <label htmlFor="category-select">Category</label>
          <select
            id="category-select"
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            aria-label="Select category"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {filter.category !== 'all' && (
          <div className="mp-filter-group mp-subcategories">
            <label>Subcategories</label>
            <div className="mp-subcategory-checkboxes">
              {categories
                .find((cat) => cat.id === filter.category)
                ?.subcategories.map((sub) => (
                  <label key={sub} className="mp-subcategory-label">
                    <input
                      type="checkbox"
                      value={sub}
                      checked={filter.subcategories.includes(sub)}
                      onChange={(e) => {
                        const subcats = e.target.checked
                          ? [...filter.subcategories, sub]
                          : filter.subcategories.filter((s) => s !== sub);
                        setFilter({ ...filter, subcategories: subcats });
                      }}
                      aria-label={`Filter by ${sub}`}
                    />
                    {sub}
                  </label>
                ))}
            </div>
          </div>
        )}
        <div className="mp-filter-group mp-price-range">
          <label>Price Range (AED)</label>
          <div className="mp-price-inputs">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              placeholder="Min"
              aria-label="Minimum price"
            />
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              placeholder="Max"
              aria-label="Maximum price"
            />
          </div>
        </div>
        <div className="mp-filter-group">
          <label htmlFor="sort-select">Sort By</label>
          <select id="sort-select" aria-label="Sort listings">
            <option>Relevance</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
        </div>
        <button
          onClick={() => setSavedFilters([...savedFilters, { category: filter.category, subcategories: filter.subcategories, priceRange }])}
          aria-label="Save current search"
        >
          Save Search
        </button>
      </div>

      <div className="mp-marketplace-content">
        {loading ? (
          <div className="mp-loading-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="mp-skeleton-card" />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'featured' && (
              <div className="mp-featured-listings">
                <h2>Featured Listings</h2>
                <div className="mp-listing-grid">
                  {listings.featured.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onSave={handleSave}
                      onClick={() => setSelectedListing(listing)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mp-main-listings">
              <div className="mp-view-toggle">
                <button
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'active' : ''}
                  aria-label="View as grid"
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={viewMode === 'map' ? 'active' : ''}
                  aria-label="View as map"
                >
                  <FaMap /> Map
                </button>
              </div>
              {viewMode === 'grid' ? (
                <div className="mp-listing-grid">
                  {paginatedListings.length > 0 ? (
                    paginatedListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        onSave={handleSave}
                        onClick={() => setSelectedListing(listing)}
                      />
                    ))
                  ) : (
                    <p className="mp-no-results">No listings found. Try adjusting your filters.</p>
                  )}
                </div>
              ) : (
                <div className="mp-map-view">Map Placeholder (Integration Required)</div>
              )}
              {paginatedListings.length < filteredListings.length && (
                <button
                  className="mp-load-more"
                  onClick={() => setPage((prev) => prev + 1)}
                  aria-label="Load more listings"
                >
                  Load More
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {user?.isVerified && (
        <section className="mp-marketplace-form-section">
          <h2>Create a New Listing</h2>
          <form className="mp-marketplace-form" onSubmit={handleListingSubmit}>
            <div className="mp-form-group">
              <label htmlFor="listing-type">Listing Type</label>
              <select
                id="listing-type"
                value={newListing.type}
                onChange={(e) => setNewListing({ ...newListing, type: e.target.value, subtype: '' })}
                aria-label="Select listing type"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mp-form-group">
              <label htmlFor="listing-subtype">Subtype</label>
              <select
                id="listing-subtype"
                value={newListing.subtype}
                onChange={(e) => setNewListing({ ...newListing, subtype: e.target.value })}
                aria-label="Select listing subtype"
              >
                <option value="">Select Subtype</option>
                {categories
                  .find((cat) => cat.id === newListing.type)
                  ?.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mp-form-group">
              <label htmlFor="listing-title">Title</label>
              <input
                id="listing-title"
                type="text"
                placeholder="e.g., Luxury Villa in Dubai"
                value={newListing.title}
                onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                aria-label="Listing title"
              />
            </div>
            <div className="mp-form-group">
              <label htmlFor="listing-description">Description</label>
              <textarea
                id="listing-description"
                placeholder="Describe your listing..."
                value={newListing.description}
                onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                aria-label="Listing description"
              />
            </div>
            <div className="mp-form-group">
              <label htmlFor="listing-price">Price (AED)</label>
              <input
                id="listing-price"
                type="number"
                placeholder="e.g., 500000"
                value={newListing.price}
                onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                aria-label="Listing price"
              />
            </div>
            <div className="mp-form-group">
              <label htmlFor="listing-location">Location</label>
              <input
                id="listing-location"
                type="text"
                placeholder="e.g., Dubai, UAE"
                value={newListing.location}
                onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                aria-label="Listing location"
              />
            </div>
            <div className="mp-form-group">
              <label htmlFor="listing-keywords">Keywords</label>
              <input
                id="listing-keywords"
                type="text"
                placeholder="e.g., luxury, villa, investment"
                value={newListing.keywords}
                onChange={(e) => setNewListing({ ...newListing, keywords: e.target.value })}
                aria-label="Listing keywords"
              />
            </div>
            {newListing.type === 'property' && <PropertyFields newListing={newListing} setNewListing={setNewListing} />}
            {newListing.type === 'land' && <LandFields newListing={newListing} setNewListing={setNewListing} />}
            {newListing.type === 'material' && <MaterialFields newListing={newListing} setNewListing={setNewListing} />}
            {newListing.type === 'labor' && <LaborFields newListing={newListing} setNewListing={setNewListing} />}
            <div className="mp-form-group">
              <label htmlFor="listing-images">Images (up to 4)</label>
              <input
                id="listing-images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewListing({ ...newListing, images: Array.from(e.target.files).slice(0, 4) })}
                aria-label="Upload images"
              />
            </div>
            <div className="mp-form-group">
              <label htmlFor="listing-documents">Documents</label>
              <input
                id="listing-documents"
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => setNewListing({ ...newListing, documents: Array.from(e.target.files) })}
                aria-label="Upload documents"
              />
            </div>
            <button type="submit" disabled={loading} aria-label="Submit listing">
              Submit Listing
            </button>
            {error && (
              <p className="mp-marketplace-error" role="alert">
                {error}
              </p>
            )}
          </form>
        </section>
      )}

      {selectedListing && (
        <ListingModal
          listing={selectedListing}
          onPurchase={handlePurchase}
          onMessage={handleMessageSeller}
          onReport={handleReport}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
};

const ListingCard = React.memo(({ listing, onSave, onClick }) => (
  <div className="mp-marketplace-card" onClick={onClick} role="button" tabIndex={0} aria-label={`View ${listing.title}`}>
    <div className="mp-marketplace-card-images">
      {listing.images.length > 0 ? (
        <img src={listing.images[0]} alt={listing.title} loading="lazy" />
      ) : (
        <div className="mp-marketplace-placeholder">No Image Available</div>
      )}
      <button
        className="mp-card-save"
        onClick={(e) => {
          e.stopPropagation();
          onSave(listing.id);
        }}
        aria-label="Save listing"
      >
        <FaHeart />
      </button>
      <span className="mp-badge verified" aria-label="Verified listing">
        <FaCheckCircle /> Verified
      </span>
    </div>
    <div className="mp-marketplace-card-details">
      <h3>{listing.title}</h3>
      <p className="mp-card-location">{listing.location}</p>
      <p className="mp-card-price">AED {listing.price.toLocaleString()}</p>
      {listing.type === 'property' && listing.details.bedrooms && (
        <p className="mp-card-specs">
          {listing.details.bedrooms} Beds • {listing.details.bathrooms} Baths • {listing.details.area}
        </p>
      )}
      {listing.type === 'land' && listing.details.area && <p className="mp-card-specs">{listing.details.area}</p>}
      {listing.type === 'material' && listing.details.materials && (
        <p className="mp-card-specs">{listing.details.materials}</p>
      )}
      {listing.type === 'labor' && listing.details.experience && (
        <p className="mp-card-specs">{listing.details.experience} Experience</p>
      )}
      <p className="mp-card-rating">
        <FaStar className="mp-star" /> 4.5 (10 reviews)
      </p>
    </div>
  </div>
));

const ListingModal = ({ listing, onPurchase, onMessage, onReport, onClose }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const handlePrevImage = () => setCurrentImage((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
  const handleNextImage = () => setCurrentImage((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));

  return (
    <div className="mp-marketplace-modal" role="dialog" aria-labelledby="modal-title">
      <div className="mp-modal-content">
        <button className="mp-modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        <div className="mp-media-gallery">
          {listing.images.length > 0 ? (
            <div className="mp-gallery-slider">
              <img src={listing.images[currentImage]} alt={`${listing.title} ${currentImage + 1}`} loading="lazy" />
              {listing.images.length > 1 && (
                <>
                  <button className="mp-gallery-nav mp-prev" onClick={handlePrevImage} aria-label="Previous image">
                    <FaArrowLeft />
                  </button>
                  <button className="mp-gallery-nav mp-next" onClick={handleNextImage} aria-label="Next image">
                    <FaArrowRight />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="mp-gallery-placeholder">No Images Available</div>
          )}
        </div>
        <div className="mp-modal-details">
          <h2 id="modal-title">{listing.title}</h2>
          <p className="mp-modal-location">
            {listing.location} <a href="#" aria-label="View on map">View on Map</a>
          </p>
          <p className="mp-modal-price">AED {listing.price.toLocaleString()}</p>
          <p className="mp-modal-description">{listing.description}</p>
          {listing.type === 'property' && (
            <p className="mp-modal-specs">
              {listing.details.bedrooms} Bedrooms • {listing.details.bathrooms} Bathrooms • {listing.details.area}
            </p>
          )}
          {listing.type === 'land' && <p className="mp-modal-specs">Area: {listing.details.area}</p>}
          {listing.type === 'material' && (
            <p className="mp-modal-specs">
              Materials: {listing.details.materials} • Certifications: {listing.details.certifications}
            </p>
          )}
          {listing.type === 'labor' && (
            <p className="mp-modal-specs">
              Experience: {listing.details.experience} • Certifications: {listing.details.certifications}
            </p>
          )}
          <div className="mp-seller-info">
            <p>
              Seller: Verified User <FaStar className="mp-star" /> 4.5 (10 reviews)
            </p>
            <button onClick={() => onMessage(listing.id)} aria-label="Message seller">
              <FaEnvelope /> Contact
            </button>
            <button onClick={() => onReport(listing.id)} aria-label="Report listing">
              <FaFlag /> Report
            </button>
          </div>
          <div className="mp-modal-actions">
            <button className="mp-btn-primary" onClick={() => onPurchase(listing.id)} aria-label="Buy now">
              Buy Now
            </button>
            <button className="mp-btn-secondary" aria-label="Make offer">
              Make Offer
            </button>
            <button className="mp-btn-secondary" aria-label="Schedule visit">
              Schedule Visit
            </button>
          </div>
          <p className="mp-trust-features">Secure Payment via Escrow • Blockchain Verified</p>
        </div>
      </div>
    </div>
  );
};

const PropertyFields = ({ newListing, setNewListing }) => (
  <div className="mp-marketplace-details">
    <div className="mp-form-group">
      <label htmlFor="bedrooms">Bedrooms</label>
      <input
        id="bedrooms"
        type="number"
        placeholder="e.g., 3"
        value={newListing.details.bedrooms}
        onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, bedrooms: e.target.value } })}
        aria-label="Number of bedrooms"
      />
    </div>
    <div className="mp-form-group">
      <label htmlFor="bathrooms">Bathrooms</label>
      <input
        id="bathrooms"
        type="number"
        placeholder="e.g., 2"
        value={newListing.details.bathrooms}
        onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, bathrooms: e.target.value } })}
        aria-label="Number of bathrooms"
      />
    </div>
    <div className="mp-form-group">
      <label htmlFor="area">Area (sqft)</label>
      <input
        id="area"
        type="text"
        placeholder="e.g., 2000 sqft"
        value={newListing.details.area}
        onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, area: e.target.value } })}
        aria-label="Property area"
      />
    </div>
  </div>
);

const LandFields = ({ newListing, setNewListing }) => (
  <div className="mp-marketplace-details">
    <div className="mp-form-group">
      <label htmlFor="land-area">Area (acres/sqft)</label>
      <input
        id="land-area"
        type="text"
        placeholder="e.g., 5 acres"
        value={newListing.details.area}
        onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, area: e.target.value } })}
        aria-label="Land area"
      />
    </div>
  </div>
);

const MaterialFields = ({ newListing, setNewListing }) => (
  <div className="mp-marketplace-details">
    <div className="mp-form-group">
      <label htmlFor="materials">Materials</label>
      <input
        id="materials"
        type="text"
        placeholder="e.g., Steel"
        value={newListing.details.materials}
        onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, materials: e.target.value } })}
        aria-label="Material type"
      />
    </div>
    <div className="mp-form-group">
      <label htmlFor="certifications">Certifications</label>
      <input
        id="certifications"
        type="text"
        placeholder="e.g., ISO 9001"
        value={newListing.details.certifications}
        onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, certifications: e.target.value } })}
        aria-label="Material certifications"
      />
    </div>
  </div>
);

const LaborFields = ({ newListing, setNewListing }) => (
  <div className="mp-marketplace-details">
    <div className="mp-form-group">
      <label htmlFor="experience">Experience (years)</label>
      <input
        id="experience"
        type="text"
        placeholder="e.g., 10 years"
        value={newListing.details.experience}
        onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, experience: e.target.value } })}
        aria-label="Years of experience"
      />
    </div>
    <div className="mp-form-group">
      <label htmlFor="labor-certifications">Certifications</label>
      <input
        id="labor-certifications"
        type="text"
        placeholder="e.g., Carpentry Cert"
        value={newListing.details.certifications}
        onChange={(e) => setNewListing({ ...newListing, details: { ...newListing.details, certifications: e.target.value } })}
        aria-label="Labor certifications"
      />
    </div>
  </div>
);

export default Marketplace;