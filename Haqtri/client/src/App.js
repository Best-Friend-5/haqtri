// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Live from './pages/Live';
import Bookmark from './pages/Bookmark';
import Analytics from './pages/Analytics';
import Architect from './pages/Architect';
import Property from './pages/Property';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
        
        <main className="main-content">
          <Sidebar darkMode={darkMode} />
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Home darkMode={darkMode} />} />
              <Route path="/explore" element={<Explore darkMode={darkMode} />} />
              <Route path="/notifications" element={<Notifications darkMode={darkMode} />} />
              <Route path="/messages" element={<Messages darkMode={darkMode} />} />
              <Route path="/live" element={<Live darkMode={darkMode} />} />
              <Route path="/bookmark" element={<Bookmark darkMode={darkMode} />} />
              <Route path="/analytics" element={<Analytics darkMode={darkMode} />} />
              <Route path="/architect" element={<Architect darkMode={darkMode} />} />
              <Route path="/property" element={<Property darkMode={darkMode} />} />
              <Route path="/settings" element={<Settings darkMode={darkMode} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;