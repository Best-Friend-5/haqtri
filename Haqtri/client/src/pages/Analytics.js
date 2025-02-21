import React, { useRef, useEffect } from 'react';
import { FaChartLine, FaEye, FaHeart, FaCommentDots, FaLeaf, FaProjectDiagram } from 'react-icons/fa';
import './Analytics.css';

const Analytics = ({ darkMode }) => {
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);

  // Expanded analytics data
  const analyticsData = {
    projectViews: 1250,
    likesReceived: 320,
    commentsReceived: 85,
    sustainabilityScore: 92, // Percentage
    projectsCompleted: 3,
    ecoImpact: 'Reduced 15 tons of CO2 emissions',
    weeklyViews: [
      { day: 'Mon', views: 50 },
      { day: 'Tue', views: 75 },
      { day: 'Wed', views: 100 },
      { day: 'Thu', views: 120 },
      { day: 'Fri', views: 150 },
      { day: 'Sat', views: 200 },
      { day: 'Sun', views: 250 },
    ],
    engagementBreakdown: [
      { type: 'Likes', value: 320 },
      { type: 'Comments', value: 85 },
      { type: 'Shares', value: 45 },
    ],
    activityLog: [
      { date: '2025-02-20', action: 'Completed Eco-Friendly Villa', impact: '+5% Sustainability Score' },
      { date: '2025-02-18', action: 'Received 50 likes on Zero-Waste Loft', impact: '+10 Engagement' },
      { date: '2025-02-15', action: 'Started new project', impact: 'N/A' },
    ],
  };

  // Draw Line Chart for Weekly Views
  useEffect(() => {
    const canvas = lineChartRef.current;
    const ctx = canvas.getContext('2d');
    const data = analyticsData.weeklyViews;
    const maxValue = Math.max(...data.map((d) => d.views));
    const stepSize = maxValue / 5;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set styles
    ctx.strokeStyle = '#CC7357'; // Warm Terracotta
    ctx.fillStyle = darkMode ? '#b0b0b0' : '#666';
    ctx.lineWidth = 2;
    ctx.font = '12px Arial';

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(50, 20); // Top-left Y-axis
    ctx.lineTo(50, 170); // Bottom Y-axis
    ctx.lineTo(650, 170); // Bottom X-axis
    ctx.stroke();

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const y = 170 - (i * 30);
      ctx.fillText(Math.round(i * stepSize), 20, y + 5);
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(55, y);
      ctx.stroke();
    }

    // X-axis labels and line chart
    ctx.beginPath();
    ctx.moveTo(50, 170);
    data.forEach((point, index) => {
      const x = 50 + (index * 100);
      const y = 170 - ((point.views / maxValue) * 150);
      ctx.fillText(point.day, x - 10, 185);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [darkMode]); // Redraw when darkMode changes

  // Draw Bar Chart for Engagement Breakdown
  useEffect(() => {
    const canvas = barChartRef.current;
    const ctx = canvas.getContext('2d');
    const data = analyticsData.engagementBreakdown;
    const maxValue = Math.max(...data.map((d) => d.value));
    const barWidth = 100;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set styles
    ctx.fillStyle = '#4A8B6F'; // Earthy Green
    ctx.strokeStyle = '#2A3F54'; // Deep Navy Blue
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(50, 20); // Top-left Y-axis
    ctx.lineTo(50, 170); // Bottom Y-axis
    ctx.lineTo(350, 170); // Bottom X-axis
    ctx.stroke();

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const y = 170 - (i * 30);
      ctx.fillStyle = darkMode ? '#b0b0b0' : '#666';
      ctx.fillText(Math.round((i / 5) * maxValue), 20, y + 5);
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(55, y);
      ctx.stroke();
    }

    // Draw bars
    data.forEach((item, index) => {
      const x = 60 + (index * (barWidth + 10));
      const height = (item.value / maxValue) * 150;
      const y = 170 - height;
      ctx.fillStyle = '#4A8B6F';
      ctx.fillRect(x, y, barWidth, height);
      ctx.strokeRect(x, y, barWidth, height);
      ctx.fillStyle = darkMode ? '#b0b0b0' : '#666';
      ctx.fillText(item.type, x + (barWidth / 2) - 20, 185);
    });
  }, [darkMode]); // Redraw when darkMode changes

  return (
    <div className={`analytics-container ${darkMode ? 'dark' : ''}`}>
      <h2 className="analytics-title">
        <FaChartLine className="chart-icon" /> Analytics
      </h2>
      <div className="analytics-grid">
        {/* Basic Metrics */}
        <div className="analytics-card">
          <div className="card-header">
            <FaEye className="card-icon" />
            <h3>Project Views</h3>
          </div>
          <p className="card-value">{analyticsData.projectViews.toLocaleString()}</p>
          <small>Total views across all your projects</small>
        </div>
        <div className="analytics-card">
          <div className="card-header">
            <FaHeart className="card-icon" />
            <h3>Likes Received</h3>
          </div>
          <p className="card-value">{analyticsData.likesReceived}</p>
          <small>Engagement from the community</small>
        </div>
        <div className="analytics-card">
          <div className="card-header">
            <FaCommentDots className="card-icon" />
            <h3>Comments Received</h3>
          </div>
          <p className="card-value">{analyticsData.commentsReceived}</p>
          <small>Conversations sparked by your content</small>
        </div>
        <div className="analytics-card">
          <div className="card-header">
            <FaLeaf className="card-icon" />
            <h3>Sustainability Score</h3>
          </div>
          <p className="card-value">{analyticsData.sustainabilityScore}%</p>
          <small>Your eco-friendly impact rating</small>
        </div>

        {/* Graphical Metrics */}
        <div className="analytics-card full-width">
          <div className="card-header">
            <FaEye className="card-icon" />
            <h3>Weekly Views</h3>
          </div>
          <div className="chart-container">
            <canvas ref={lineChartRef} width={700} height={200}></canvas>
          </div>
          <small>Project views over the last 7 days</small>
        </div>
        <div className="analytics-card full-width">
          <div className="card-header">
            <FaChartLine className="card-icon" />
            <h3>Engagement Breakdown</h3>
          </div>
          <div className="chart-container">
            <canvas ref={barChartRef} width={700} height={200}></canvas>
          </div>
          <small>Likes, comments, and shares received</small>
        </div>

        {/* Detailed Analytics */}
        <div className="analytics-card">
          <div className="card-header">
            <FaProjectDiagram className="card-icon" />
            <h3>Projects Completed</h3>
          </div>
          <p className="card-value">{analyticsData.projectsCompleted}</p>
          <small>Total eco-friendly projects finished</small>
        </div>
        <div className="analytics-card full-width">
          <div className="card-header">
            <FaLeaf className="card-icon" />
            <h3>Eco Impact</h3>
          </div>
          <p className="card-value">{analyticsData.ecoImpact}</p>
          <small>Environmental contribution from your projects</small>
        </div>
        <div className="analytics-card full-width activity-log">
          <div className="card-header">
            <FaChartLine className="card-icon" />
            <h3>Activity Log</h3>
          </div>
          <ul className="activity-list">
            {analyticsData.activityLog.map((activity, index) => (
              <li key={index} className="activity-item">
                <span className="activity-date">{activity.date}</span>
                <span className="activity-action">{activity.action}</span>
                <span className="activity-impact">{activity.impact}</span>
              </li>
            ))}
          </ul>
          <small>Recent actions and their impact</small>
        </div>
      </div>
    </div>
  );
};

export default Analytics;