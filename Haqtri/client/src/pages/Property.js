import React, { useState } from 'react';
import { FaHotel, FaBookmark, FaEnvelope, FaStar } from 'react-icons/fa';

// Import images at the top from src/assets/img/
import Profile1 from '../images/profpic.jpg'; // Owner 1 profile
import Profile3 from '../images/profpic3.jpg'; // Owner 2 profile
import Feed5 from '../images/house5.jpg';      // Property 1 image
import Feed2 from '../images/house4.jpg';      // Property 2 image

import './Property.css';

const Property = ({ darkMode }) => {
  const [properties, setProperties] = useState([
    {
      id: 1,
      title: 'Eco-Friendly Villa',
      location: 'California, USA',
      price: '$500,000',
      rating: 4.8,
      owner: 'Ali Shariatian',
      ownerImg: Profile1,
      image: Feed5,
      description: 'A sustainable villa with solar panels and zero-waste materials.',
      isBookmarked: false,
    },
    {
      id: 2,
      title: 'Urban Micro-Home',
      location: 'New York, USA',
      price: '$350,000',
      rating: 4.5,
      owner: 'Lili Rose',
      ownerImg: Profile3,
      image: Feed2,
      description: 'Compact eco-home designed for urban sustainability.',
      isBookmarked: false,
    },
  ]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handleToggleBookmark = (id) => {
    setProperties((prevProperties) =>
      prevProperties.map((property) =>
        property.id === id ? { ...property, isBookmarked: !property.isBookmarked } : property
      )
    );
  };

  const handleContact = (id) => {
    // Placeholder for contact functionality (e.g., send message to owner)
    console.log(`Contacting owner of property ID: ${id}`);
  };

  return (
    <div className={`property-container ${darkMode ? 'dark' : ''}`}>
      <h2 className="property-title">
        <FaHotel className="hotel-icon" /> Properties
      </h2>
      <div className="property-layout">
        <div className="property-list">
          {properties.map((property) => (
            <div
              key={property.id}
              className={`property-item ${selectedProperty?.id === property.id ? 'active' : ''}`}
              onClick={() => setSelectedProperty(property)}
            >
              <img src={property.image} alt={property.title} className="property-image" />
              <div className="property-info">
                <h3>{property.title}</h3>
                <p className="property-location">{property.location}</p>
                <p className="property-price">{property.price}</p>
                <div className="property-rating">
                  <FaStar className="star-icon" />
                  <span>{property.rating}</span>
                </div>
              </div>
              <button
                className={`bookmark-btn ${property.isBookmarked ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering property selection
                  handleToggleBookmark(property.id);
                }}
              >
                <FaBookmark />
              </button>
            </div>
          ))}
        </div>
        <div className="property-details">
          {selectedProperty ? (
            <div className="details-card">
              <img src={selectedProperty.image} alt={selectedProperty.title} className="details-image" />
              <h3>{selectedProperty.title}</h3>
              <p className="details-location">{selectedProperty.location}</p>
              <p className="details-price">{selectedProperty.price}</p>
              <div className="details-rating">
                <FaStar className="star-icon" />
                <span>{selectedProperty.rating}</span>
              </div>
              <p className="details-description">{selectedProperty.description}</p>
              <div className="owner-info">
                <img src={selectedProperty.ownerImg} alt={selectedProperty.owner} className="profile-photo" />
                <div>
                  <p className="owner-name">Owner: {selectedProperty.owner}</p>
                  <button className="contact-btn" onClick={() => handleContact(selectedProperty.id)}>
                    <FaEnvelope /> Contact Owner
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="no-selection">Select a property to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Property;