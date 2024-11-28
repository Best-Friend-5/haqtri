import React from 'react';
import './Footer.css';
import logo from '../images/logo.jpg'; // Importing the logo as in Navbar

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column footer-logo">
          <img src={logo} alt="Twinkle Toes Logo" />
          <p className="footer-logo-text">Twinkle Toes Schools</p>
        </div>

        <div className="footer-column">
          <h3 className="footer-title">Contact Info</h3>
          <p>
            Email: <a href="mailto:info@twinkletoesschools.com">info@twinkletoesschools.com</a>
          </p>
          <p>
            Phone: <a href="tel:+1234567890">+123 456 7890</a>
          </p>
          <p>Address: Cajaah Estate, Orozo</p>
        </div>

        <div className="footer-column">
          <h3 className="footer-title">Stay Connected</h3>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
          </div>
        </div>

        <div className="footer-column">
          <h3 className="footer-title">Visit Us</h3>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3941.792743605978!2d7.568338974023152!3d8.898851591157403!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e11504ac76bd1%3A0xab452b69283433e3!2sTwinkle%20Toes%20Schools%2C%20Cajaah%20Estate%2C%20Orozo!5e0!3m2!1sen!2sng!4v1732696273531!5m2!1sen!2sng"
            width="100%"
            height="150"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Twinkle Toes Schools Location"
          ></iframe>
        </div>
      </div>
      <hr className="footer-divider" />
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Twinkle Toes Schools. All Rights Reserved.</p>
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="back-to-top-text">Back to Top</span>
          <span className="back-to-top-arrow">↑</span>
        </button>
      </div>
    </footer>
  );
}

export default Footer;
