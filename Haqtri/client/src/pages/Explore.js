import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

// Import placeholder images (adjust paths as needed based on your structure)
import VillaImage from '../images/house4.jpg'; // Placeholder for Eco-Friendly Villa
import LoftImage from '../images/house1.jpg';   // Placeholder for Urban Zero-Waste Loft
import RetreatImage from '../images/house3.jpg'; // Placeholder for Mountain Retreat

import './Explore.css';

const Explore = ({ darkMode }) => {
  const [properties, setProperties] = useState([
    {
      id: 1,
      title: "Eco-Friendly Villa",
      price: "$500,000",
      location: "California",
      image: VillaImage,
      tags: ["Eco Certified", "Sustainable"],
    },
    {
      id: 2,
      title: "Urban Zero-Waste Loft",
      price: "$350,000",
      location: "New York",
      image: LoftImage,
      tags: ["Zero-Waste", "Sustainable"],
    },
    {
      id: 3,
      title: "Mountain Retreat",
      price: "$750,000",
      location: "Colorado",
      image: RetreatImage,
      tags: ["Eco Certified"],
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    // Placeholder for future API call to fetch properties
  }, []);

  const handleTagChange = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => property.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  return (
    <div className={`explore-container ${darkMode ? 'dark' : ''}`}>
      <div className="search-filters">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filters">
          <label>
            <input
              type="checkbox"
              value="Eco Certified"
              checked={selectedTags.includes("Eco Certified")}
              onChange={() => handleTagChange("Eco Certified")}
            />
            Eco Certified
          </label>
          <label>
            <input
              type="checkbox"
              value="Sustainable"
              checked={selectedTags.includes("Sustainable")}
              onChange={() => handleTagChange("Sustainable")}
            />
            Sustainable
          </label>
          <label>
            <input
              type="checkbox"
              value="Zero-Waste"
              checked={selectedTags.includes("Zero-Waste")}
              onChange={() => handleTagChange("Zero-Waste")}
            />
            Zero-Waste
          </label>
        </div>
      </div>
      <div className="property-grid">
        {filteredProperties.map((property) => (
          <div key={property.id} className="property-card">
            <img
              src={property.image}
              alt={property.title}
              className="property-image"
            />
            <div className="property-info">
              <h3 className="property-title">{property.title}</h3>
              <p className="property-price">{property.price}</p>
              <p className="property-location">{property.location}</p>
              <div className="property-tags">
                {property.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;