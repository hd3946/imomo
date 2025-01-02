import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('User');

  useEffect(() => {
    // Chrome API가 있는지 확인
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // 저장된 메시지 불러오기
      chrome.storage.local.get(['chatMessages'], (result) => {
        if (result.chatMessages) {
          setMessages(result.chatMessages);
        }
      });
    }
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageObj = {
      text: newMessage,
      sender: username,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, messageObj];
    setMessages(updatedMessages);

    // Chrome API가 있는지 확인 후 메시지 저장
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ chatMessages: updatedMessages });
    }
    setNewMessage('');
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <h2>Chat Extension</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            className="username-input"
          />
        </div>

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender === username ? 'sent' : 'received'}`}>
              <span className="sender">{msg.sender}</span>
              <p>{msg.text}</p>
              <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>

        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
