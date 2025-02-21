import React, { useState } from 'react';
import { FaCity, FaUserPlus, FaEnvelope, FaStar } from 'react-icons/fa';
import Profile1 from '../images/profpic3.jpg'; // Architect profile
import Profile3 from '../images/profpic2.jpg'; // Architect profile
import './Architect.css';

const Architect = ({ darkMode }) => {
  const [architects, setArchitects] = useState([
    {
      id: 1,
      name: 'Ali Shariatian',
      location: 'California, USA',
      specialty: 'Sustainable Design',
      rating: 4.8,
      projects: 15,
      profileImg: Profile1,
      bio: 'Passionate about eco-friendly architecture with a focus on zero-waste materials.',
    },
    {
      id: 2,
      name: 'Lili Rose',
      location: 'Dubai, UAE',
      specialty: 'Urban Eco-Homes',
      rating: 4.5,
      projects: 10,
      profileImg: Profile3,
      bio: 'Expert in creating sustainable urban living spaces with innovative designs.',
    },
  ]);
  const [selectedArchitect, setSelectedArchitect] = useState(null);

  const handleConnect = (id) => {
    // Placeholder for connect functionality (e.g., send connection request)
    console.log(`Connecting with architect ID: ${id}`);
  };

  return (
    <div className={`architect-container ${darkMode ? 'dark' : ''}`}>
      <h2 className="architect-title">
        <FaCity className="city-icon" /> Architects
      </h2>
      <div className="architect-layout">
        <div className="architect-list">
          {architects.map((architect) => (
            <div
              key={architect.id}
              className={`architect-item ${selectedArchitect?.id === architect.id ? 'active' : ''}`}
              onClick={() => setSelectedArchitect(architect)}
            >
              <img src={architect.profileImg} alt={architect.name} className="profile-photo" />
              <div className="architect-info">
                <h3>{architect.name}</h3>
                <p className="architect-location">{architect.location}</p>
                <p className="architect-specialty">{architect.specialty}</p>
                <div className="architect-rating">
                  <FaStar className="star-icon" />
                  <span>{architect.rating} ({architect.projects} projects)</span>
                </div>
              </div>
              <button
                className="connect-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering architect selection
                  handleConnect(architect.id);
                }}
              >
                <FaUserPlus /> Connect
              </button>
            </div>
          ))}
        </div>
        <div className="architect-profile">
          {selectedArchitect ? (
            <div className="profile-card">
              <img src={selectedArchitect.profileImg} alt={selectedArchitect.name} className="profile-photo large" />
              <h3>{selectedArchitect.name}</h3>
              <p className="profile-location">{selectedArchitect.location}</p>
              <p className="profile-specialty">{selectedArchitect.specialty}</p>
              <div className="profile-rating">
                <FaStar className="star-icon" />
                <span>{selectedArchitect.rating} ({selectedArchitect.projects} projects)</span>
              </div>
              <p className="profile-bio">{selectedArchitect.bio}</p>
              <button className="message-btn">
                <FaEnvelope /> Send Message
              </button>
            </div>
          ) : (
            <p className="no-selection">Select an architect to view their profile</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Architect;