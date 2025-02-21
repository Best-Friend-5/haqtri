import React, { useState } from 'react';
import { FaTv, FaPaperPlane, FaCommentDots, FaVideo } from 'react-icons/fa';
import Profile from '../images/profpic.jpg'; // Streamer 1
import Profile1 from '../images/profpic3.jpg'; // Streamer 1
import Profile3 from '../images/profpic2.jpg'; // Streamer 2
import './Live.css';

const Live = ({ darkMode }) => {
  const [liveStreams, setLiveStreams] = useState([
    {
      id: 1,
      title: "Eco-Friendly Construction Demo",
      streamer: "Ali Shariatian",
      profileImg: Profile1,
      isLive: true,
      chatMessages: [
        { id: 1, user: "Lili Rose", text: "Great demo! How do you ensure zero-waste?", timestamp: "10:30 AM" },
        { id: 2, user: "John Doe", text: "Love the solar panel setup!", timestamp: "10:31 AM" },
      ],
    },
    {
      id: 2,
      title: "Live Q&A: Sustainable Materials",
      streamer: "Lili Rose",
      profileImg: Profile3,
      isLive: true,
      chatMessages: [
        { id: 1, user: "Ali Shariatian", text: "What’s your favorite eco-material?", timestamp: "10:45 AM" },
      ],
    },
  ]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newStreamTitle, setNewStreamTitle] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStream) return;

    const updatedStreams = liveStreams.map((stream) =>
      stream.id === selectedStream.id
        ? {
            ...stream,
            chatMessages: [
              ...stream.chatMessages,
              {
                id: stream.chatMessages.length + 1,
                user: "You",
                text: newMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          }
        : stream
    );
    setLiveStreams(updatedStreams);
    setSelectedStream(updatedStreams.find((stream) => stream.id === selectedStream.id));
    setNewMessage('');
  };

  const handleGoLive = (e) => {
    e.preventDefault();
    if (!newStreamTitle.trim()) return;

    const newStream = {
      id: liveStreams.length + 1,
      title: newStreamTitle,
      streamer: "You", // Placeholder for current user
      profileImg: Profile, // Placeholder; update with actual user profile
      isLive: true,
      chatMessages: [],
    };
    setLiveStreams([newStream, ...liveStreams]); // Add new stream at the top
    setNewStreamTitle('');
  };

  return (
    <div className={`live-container ${darkMode ? 'dark' : ''}`}>
      {/* Stories-like Live Streams Section */}
      <div className="live-streams-container">
        <div className="live-streams">
          {liveStreams.map((stream) => (
            <div
              key={stream.id}
              className={`stream-story ${selectedStream?.id === stream.id ? 'active' : ''}`}
              onClick={() => setSelectedStream(stream)}
            >
              <div className="profile-photo">
                <img src={stream.profileImg} alt={stream.streamer} />
                <span className="live-indicator">LIVE</span>
              </div>
              <p className="name">{stream.streamer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Go Live Creator */}
      <form className="go-live-creator" onSubmit={handleGoLive}>
        <div className="go-live-author">
          <img src={Profile} alt="Your Profile" className="profile-photo" />
          <div className="go-live-input-container">
            <input
              type="text"
              placeholder="What's your live stream about?"
              className="go-live-input"
              value={newStreamTitle}
              onChange={(e) => setNewStreamTitle(e.target.value)}
            />
            <button type="submit" className="btn-go-live" disabled={!newStreamTitle.trim()}>
              <FaVideo /> Go Live
            </button>
          </div>
        </div>
      </form>

      {/* Selected Stream and Chat */}
      <div className="live-feed">
        {selectedStream ? (
          <div className="stream-card">
            <div className="stream-header">
              <div className="stream-user">
                <img src={selectedStream.profileImg} alt={selectedStream.streamer} className="profile-photo" />
                <div className="stream-info">
                  <h3>{selectedStream.streamer}</h3>
                  <small>{selectedStream.title}</small>
                </div>
              </div>
              <span className="live-indicator">LIVE</span>
            </div>
            <div className="stream-content">
              <div className="video-placeholder">
                <p>Live Stream: {selectedStream.title}</p>
              </div>
            </div>
            <div className="chat-area">
              <div className="chat-messages">
                {selectedStream.chatMessages.map((msg) => (
                  <div key={msg.id} className={`chat-message ${msg.user === 'You' ? 'sent' : 'received'}`}>
                    <span className="chat-user">{msg.user}:</span>
                    <p>{msg.text}</p>
                    <small>{msg.timestamp}</small>
                  </div>
                ))}
              </div>
              <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="input-field"
                />
                <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <p className="no-stream">Select a live stream to watch or start your own</p>
        )}
      </div>
    </div>
  );
};

export default Live;