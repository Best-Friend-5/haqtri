import React, { useState } from 'react';
import { FaCommentDots, FaPaperPlane } from 'react-icons/fa';
import Profile1 from '../images/profpic.jpg'; // Imported profile image
import Profile3 from '../images/profpic2.jpg'; // Imported profile image
import './Messages.css';

const Messages = ({ darkMode }) => {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      user: 'Ali Shariatian',
      profileImg: Profile1,
      messages: [
        { id: 1, sender: 'Ali Shariatian', text: 'Hey, loved your sustainable villa design!', timestamp: '10:30 AM', read: true },
        { id: 2, sender: 'You', text: 'Thanks! Working on a zero-waste loft next.', timestamp: '10:32 AM', read: true },
      ],
      unreadCount: 0,
    },
    {
      id: 2,
      user: 'Lili Rose',
      profileImg: Profile3,
      messages: [
        { id: 1, sender: 'Lili Rose', text: 'Can you share your eco-certification process?', timestamp: 'Yesterday', read: false },
      ],
      unreadCount: 1,
    },
  ]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const updatedConversations = conversations.map((conv) =>
      conv.id === selectedConversation.id
        ? {
            ...conv,
            messages: [
              ...conv.messages,
              {
                id: conv.messages.length + 1,
                sender: 'You',
                text: newMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: true,
              },
            ],
          }
        : conv
    );
    setConversations(updatedConversations);
    setNewMessage('');
  };

  const markAsRead = (convId) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === convId && conv.unreadCount > 0
          ? { ...conv, messages: conv.messages.map((msg) => ({ ...msg, read: true })), unreadCount: 0 }
          : conv
      )
    );
  };

  return (
    <div className={`messages-container ${darkMode ? 'dark' : ''}`}>
      <h2 className="messages-title">
        <FaCommentDots className="chat-icon" /> Messages
      </h2>
      <div className="messages-layout">
        <div className="conversation-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedConversation(conv);
                markAsRead(conv.id);
              }}
            >
              <img src={conv.profileImg} alt={conv.user} className="conversation-avatar" />
              <div className="conversation-info">
                <p className="conversation-user">{conv.user}</p>
                <p className="conversation-preview">
                  {conv.messages[conv.messages.length - 1].text.slice(0, 30) + '...'}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="unread-count">{conv.unreadCount}</span>
              )}
            </div>
          ))}
        </div>
        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <img src={selectedConversation.profileImg} alt={selectedConversation.user} className="chat-avatar" />
                <h3>{selectedConversation.user}</h3>
              </div>
              <div className="chat-messages">
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === 'You' ? 'sent' : 'received'}`}
                  >
                    <p>{msg.text}</p>
                    <small>{msg.timestamp}</small>
                  </div>
                ))}
              </div>
              <form className="message-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="input-field"
                />
                <button type="submit" className="send-btn">
                  <FaPaperPlane />
                </button>
              </form>
            </>
          ) : (
            <p className="no-conversation">Select a conversation to start messaging</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;