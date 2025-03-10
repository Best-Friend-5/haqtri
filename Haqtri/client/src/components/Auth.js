// C:\Users\Abz\Downloads\Haqtri\Haqtri\client\src\components\Auth.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaGoogle, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import Logo from '../images/logo.png'; // Adjust path to your logo
import './Auth.css';

const Auth = ({ darkMode }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5001/api'; // Adjust for production

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setFormData({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', response.data.token);
        setSuccess('Signup successful! Verify your email to continue.');
        setTimeout(() => (window.location.href = '/home'), 2000); // Delay redirect for user to see message
      } else {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', response.data.token);
        window.location.href = '/home';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      window.location.href = `${API_BASE_URL}/auth/google`;
    } catch (err) {
      setError('Google authentication failed');
      setLoading(false);
    }
  };

  useEffect(() => {
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach((input) => {
      const updateLabel = () => {
        if (input.value === '') {
          input.parentNode.classList.remove('filled');
        } else {
          input.parentNode.classList.add('filled');
        }
      };
      input.addEventListener('focus', () => input.parentNode.classList.add('focused'));
      input.addEventListener('blur', () => {
        input.parentNode.classList.remove('focused');
        updateLabel();
      });
      input.addEventListener('input', updateLabel);
      updateLabel(); // Check initial value
    });
  }, [isSignUp]);

  return (
    <div className={`auth-page ${darkMode ? 'dark' : ''}`}>
      <div className={`auth-card ${isSignUp ? 'signup-width' : 'signin-width'}`}>
        <div className="auth-image"></div>
        <div className="auth-form-container">
          <img src={Logo} alt="Haqtri Logo" className="auth-logo" />
          <h1>{isSignUp ? 'Join Haqtri' : 'Welcome Back'}</h1>
          <p>{isSignUp ? 'Create your account' : 'Sign in to continue'}</p>
          <div className={`auth-forms ${isSignUp ? 'signup' : 'login'}`}>
            {/* Login Form */}
            <form className="auth-form login-form" onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <label>Email</label>
              </div>
              <div className="form-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <label>Password</label>
              </div>
              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
              <div className="alternative-methods">
                <p>Or sign in with:</p>
                <button className="google-btn" onClick={handleGoogleAuth} disabled={loading}>
                  <FaGoogle /> Google
                </button>
              </div>
              <p className="toggle-text">
                Don’t have an account?{' '}
                <button type="button" className="toggle-link" onClick={handleToggle} disabled={loading}>
                  Sign Up
                </button>
              </p>
            </form>

            {/* Signup Form */}
            <form className="auth-form signup-form" onSubmit={handleEmailSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <label>First Name</label>
                </div>
                <div className="form-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <label>Last Name</label>
                </div>
              </div>
              <div className="form-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <label>Email</label>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <label>Password</label>
                </div>
                <div className="form-group">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <label>Confirm Password</label>
                </div>
              </div>
              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Signing Up...' : 'Sign Up'}
              </button>
              <div className="alternative-methods">
                <p>Or sign up with:</p>
                <button className="google-btn" onClick={handleGoogleAuth} disabled={loading}>
                  <FaGoogle /> Google
                </button>
              </div>
              <p className="toggle-text">
                Already have an account?{' '}
                <button type="button" className="toggle-link" onClick={handleToggle} disabled={loading}>
                  Sign In
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;