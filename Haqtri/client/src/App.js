// client/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth'; // Import the Auth component
import Home from './pages/Home';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Live from './pages/Live';
import Analytics from './pages/Analytics';
import Property from './pages/Property';
import Settings from './pages/Settings';
import Marketplace from './pages/Marketplace'; // Import Marketplace
import Profile from './pages/Profile'; // Placeholder for Profile page
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Auth route without Navbar/Sidebar */}
        <Route path="/" element={<Auth />} />

        {/* Protected routes with Navbar and Sidebar */}
        <Route
          path="/*"
          element={
            <div className={`app-container ${darkMode ? 'dark' : ''}`}>
              <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
              <main className="main-content">
                <Sidebar darkMode={darkMode} />
                <div className="content-wrapper">
                  <Routes>
                    <Route path="/home" element={<Home darkMode={darkMode} />} />
                    <Route path="/profile" element={<Profile darkMode={darkMode} />} /> {/* Added Profile */}
                    <Route path="/property" element={<Property darkMode={darkMode} />} />
                    <Route path="/marketplace" element={<Marketplace darkMode={darkMode} />} /> {/* Replaced Bookmark */}
                    <Route path="/explore" element={<Explore darkMode={darkMode} />} />
                    <Route path="/live" element={<Live darkMode={darkMode} />} />
                    <Route path="/messages" element={<Messages darkMode={darkMode} />} />
                    <Route path="/notifications" element={<Notifications darkMode={darkMode} />} />
                    <Route path="/analytics" element={<Analytics darkMode={darkMode} />} />
                    <Route path="/settings" element={<Settings darkMode={darkMode} />} />
                  </Routes>
                </div>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;