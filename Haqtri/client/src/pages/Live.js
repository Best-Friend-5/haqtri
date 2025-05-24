import React, { useState, useEffect, useRef } from 'react';
import { FaTv, FaPaperPlane, FaVideo, FaSearch, FaFilter, FaMicrophone, 
  FaMicrophoneSlash, FaVideoSlash, FaStop, FaCircleNotch } from 'react-icons/fa';
import axios from 'axios';
import Profile from '../images/profpic.jpg';
import Profile1 from '../images/profpic3.jpg';
import Profile3 from '../images/profpic2.jpg';
import './Live.css';

const Live = ({ darkMode }) => {
  const [liveStreams, setLiveStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newStreamData, setNewStreamData] = useState({ title: '', category: 'Properties' });
  const [filters, setFilters] = useState({ searchQuery: '', category: 'all' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [streamControls, setStreamControls] = useState({ videoOn: true, audioOn: true });
  const [showGoLive, setShowGoLive] = useState(false);
  const chatRef = useRef(null);

  // Sample data
  const placeholderStreams = [
    {
      id: '1',
      title: 'Eco-Friendly Construction Demo',
      streamer: 'Ali Shariatian',
      profileImg: Profile1,
      isLive: true,
      category: 'Materials',
      chatMessages: [
        { id: 1, user: 'Lili Rose', text: 'Great demo! How do you ensure zero-waste?', timestamp: '10:30 AM' },
        { id: 2, user: 'John Doe', text: 'Love the solar panel setup!', timestamp: '10:31 AM' },
      ],
      listing: { id: '1', title: 'Eco-Friendly Concrete Blocks', price: 5000 },
      viewers: 1250
    },
    // Add more sample streams as needed
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'Properties', label: 'Properties' },
    { id: 'Land', label: 'Land' },
    { id: 'Materials', label: 'Materials' },
    { id: 'Labor', label: 'Labor' },
  ];

  useEffect(() => {
    const fetchStreams = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5001/api/streams?page=${page}&limit=10`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const newStreams = response.data.streams.map(stream => ({
          ...stream,
          profileImg: stream.profileImg || Profile,
        }));
        setLiveStreams(prev => (page === 1 ? newStreams : [...prev, ...newStreams]));
        setHasMore(response.data.hasMore);
      } catch (err) {
        setError('Unable to load streams. Showing sample content.');
        setLiveStreams(prev => (page === 1 ? placeholderStreams : [...prev, ...placeholderStreams]));
        setHasMore(false);
      }
      setLoading(false);
    };
    fetchStreams();
  }, [page]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [selectedStream?.chatMessages]);

  const handleSearch = e => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleFilterChange = e => {
    setFilters(prev => ({ ...prev, category: e.target.value }));
  };

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStream) return;

    try {
      const response = await axios.post(
        `http://localhost:5001/api/streams/${selectedStream.id}/chat`,
        { text: newMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const updatedStreams = liveStreams.map(stream =>
        stream.id === selectedStream.id
          ? { ...stream, chatMessages: [...stream.chatMessages, response.data.message] }
          : stream
      );
      setLiveStreams(updatedStreams);
      setSelectedStream(updatedStreams.find(stream => stream.id === selectedStream.id));
      setNewMessage('');
    } catch (err) {
      const message = {
        id: Date.now(),
        user: 'You',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const updatedStreams = liveStreams.map(stream =>
        stream.id === selectedStream.id
          ? { ...stream, chatMessages: [...stream.chatMessages, message] }
          : stream
      );
      setLiveStreams(updatedStreams);
      setSelectedStream(updatedStreams.find(stream => stream.id === selectedStream.id));
      setNewMessage('');
      setError('Message sent to sample content.');
    }
  };

  const handleGoLive = async e => {
    e.preventDefault();
    if (!newStreamData.title.trim()) return;

    try {
      const response = await axios.post(
        'http://localhost:5001/api/streams',
        { title: newStreamData.title, category: newStreamData.category },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const newStream = {
        ...response.data.stream,
        profileImg: Profile,
        chatMessages: [],
        viewers: 0
      };
      setLiveStreams([newStream, ...liveStreams]);
      setNewStreamData({ title: '', category: 'Properties' });
      setSelectedStream(newStream);
      setShowGoLive(false);
    } catch (err) {
      const newStream = {
        id: Date.now().toString(),
        title: newStreamData.title,
        streamer: 'You',
        profileImg: Profile,
        isLive: true,
        category: newStreamData.category,
        chatMessages: [],
        viewers: 0
      };
      setLiveStreams([newStream, ...liveStreams]);
      setNewStreamData({ title: '', category: 'Properties' });
      setSelectedStream(newStream);
      setShowGoLive(false);
      setError('Stream added to sample content.');
    }
  };

  const handleToggleVideo = () => {
    setStreamControls(prev => ({ ...prev, videoOn: !prev.videoOn }));
  };

  const handleToggleAudio = () => {
    setStreamControls(prev => ({ ...prev, audioOn: !prev.audioOn }));
  };

  const handleEndStream = () => {
    const updatedStreams = liveStreams.map(stream =>
      stream.id === selectedStream.id ? { ...stream, isLive: false } : stream
    );
    setLiveStreams(updatedStreams.filter(stream => stream.isLive));
    setSelectedStream(null);
  };

  return (
    <div className={`live-container ${darkMode ? 'dark' : ''}`}>
      <div className="live-header">
        <h2><FaTv /> Live Streams</h2>
        <div className="controls-bar">
          <div className="search-filter">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search streams..."
                value={filters.searchQuery}
                onChange={handleSearch}
              />
            </div>
            <select
              value={filters.category}
              onChange={handleFilterChange}
              className="category-filter"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <button className="go-live-btn" onClick={() => setShowGoLive(true)}>
            <FaVideo /> Go Live
          </button>
        </div>
      </div>

      <div className="live-content">
        <div className="stream-list">
          {liveStreams
            .filter(stream => 
              (filters.category === 'all' || stream.category === filters.category) &&
              (stream.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              stream.streamer.toLowerCase().includes(filters.searchQuery.toLowerCase()))
            )
            .map(stream => (
              <div
                key={stream.id}
                className={`stream-card ${selectedStream?.id === stream.id ? 'active' : ''}`}
                onClick={() => setSelectedStream(stream)}
              >
                <div className="stream-preview">
                  <img src={stream.profileImg} alt={stream.streamer} />
                  <span className="live-badge">LIVE</span>
                  <div className="viewer-count">{stream.viewers} viewers</div>
                </div>
                <div className="stream-info">
                  <h4>{stream.title}</h4>
                  <div className="stream-meta">
                    <span className="streamer">{stream.streamer}</span>
                    <span className="category">{stream.category}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="main-stream">
          {selectedStream ? (
            <div className="stream-viewer">
              <div className="video-container">
                <div className="video-controls">
                  <button
                    className={`control-btn ${streamControls.videoOn ? 'active' : ''}`}
                    onClick={handleToggleVideo}
                  >
                    {streamControls.videoOn ? <FaVideo /> : <FaVideoSlash />}
                  </button>
                  <button
                    className={`control-btn ${streamControls.audioOn ? 'active' : ''}`}
                    onClick={handleToggleAudio}
                  >
                    {streamControls.audioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                  </button>
                  <button className="control-btn danger" onClick={handleEndStream}>
                    <FaStop /> End Stream
                  </button>
                </div>
                <div className="video-placeholder">
                  {streamControls.videoOn ? (
                    <div className="video-feed">
                      <span>Live Stream Feed</span>
                    </div>
                  ) : (
                    <div className="video-off">
                      <img src={selectedStream.profileImg} alt="Streamer" />
                    </div>
                  )}
                </div>
              </div>

              <div className="stream-chat">
                <div className="chat-messages" ref={chatRef}>
                  {selectedStream.chatMessages.map(msg => (
                    <div key={msg.id} className={`message ${msg.user === 'You' ? 'sent' : ''}`}>
                      <div className="message-header">
                        <span className="user">{msg.user}</span>
                        <span className="time">{msg.timestamp}</span>
                      </div>
                      <p className="text">{msg.text}</p>
                    </div>
                  ))}
                </div>
                <form className="chat-input" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Send a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit">
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="select-stream-prompt">
              <FaTv className="prompt-icon" />
              <h3>Select a stream to start watching</h3>
              <p>Browse available live streams or start your own</p>
            </div>
          )}
        </div>
      </div>

      {showGoLive && (
        <div className="go-live-modal">
          <div className="modal-content">
            <h3>Start New Stream</h3>
            <form onSubmit={handleGoLive}>
              <div className="form-group">
                <label>Stream Title</label>
                <input
                  type="text"
                  value={newStreamData.title}
                  onChange={(e) => setNewStreamData({...newStreamData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newStreamData.category}
                  onChange={(e) => setNewStreamData({...newStreamData, category: e.target.value})}
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowGoLive(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Start Streaming
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <FaCircleNotch className="spinner" />
          <p>Loading streams...</p>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
};

export default Live;