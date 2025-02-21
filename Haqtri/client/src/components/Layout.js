// src/components/Layout.js
import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        {children}
      </div>
      <Sidebar />
    </div>
  );
};

export default Layout;