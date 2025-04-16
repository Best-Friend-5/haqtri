import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Live from './pages/Live';
import Analytics from './pages/Analytics';
import Property from './pages/Property';
import Settings from './pages/Settings';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import './App.css';

const AppLayout = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const showSidebar = location.pathname === '/home';
  const isMarketplace = location.pathname === '/marketplace';

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className={`main-content ${showSidebar ? 'has-sidebar' : ''}`}>
        {showSidebar && <Sidebar darkMode={darkMode} />}
        <div className={`content-wrapper ${showSidebar ? 'has-sidebar' : ''} ${isMarketplace ? 'marketplace-full' : ''}`}>
          <Routes>
            <Route path="/home" element={<Home darkMode={darkMode} />} />
            <Route path="/profile" element={<Profile darkMode={darkMode} />} />
            <Route path="/property" element={<Property darkMode={darkMode} />} />
            <Route path="/marketplace" element={<Marketplace darkMode={darkMode} />} />
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
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route 
          path="/*" 
          element={<AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;