import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../images/logo.jpg';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Toggle shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle menu for mobile view
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-logo">
        <img src={logo} alt="Twinkle Toes Logo" />
        <p className="logo-text">Twinkle Toes School</p>
      </div>

      <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
        <li><Link to="/about" onClick={() => setIsOpen(false)}>About</Link></li>
        <li><Link to="/admissions" onClick={() => setIsOpen(false)}>Admissions</Link></li>
        <li><Link to="/gallery" onClick={() => setIsOpen(false)}>Gallery</Link></li>
        <li><Link to="/portal" onClick={() => setIsOpen(false)}>Portal</Link></li>
        <li className="contact-btn"><Link to="/contact" onClick={() => setIsOpen(false)}>Contact Us</Link></li>
      </ul>

      {/* Hamburger icon for mobile view */}
      <div className="hamburger-menu" onClick={toggleMenu} role="button" tabIndex={0} aria-label="Toggle navigation menu">
        ☰
      </div>
    </nav>
  );
}

export default Navbar;
