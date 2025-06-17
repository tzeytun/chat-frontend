import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState('');
  const [inputError, setInputError] = useState('');

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatLogRef = useRef(null);

  // Mesajları ve eventleri dinle
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'error') {
          alert(data.content);
          socketRef.current.close();
          setUsername('');
          setIsLoggedIn(false);
          return;
        }

        if (data.type === 'userlist') {
          setOnlineUsers(data.users);
          setIsLoggedIn(true);
        }

        if (data.type === 'typing' && data.username !== username) {
          setTypingUser(data.username);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingUser(''), 1500);
        }

        if (data.type === 'message' || data.type === 'system') {
          setChatLog((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error("Mesaj ayrıştırılamadı:", err);
      }
    };

    socketRef.current.onclose = () => {
      console.log("Bağlantı kapandı.");
    };
  }, [isLoggedIn, username]);

  // Otomatik scroll
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatLog]);

  const handleInputChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    if (socketRef.current && isLoggedIn) {
      socketRef.current.send(JSON.stringify({
        type: 'typing',
        username,
      }));
    }
  };

  const sendMessage = () => {
    if (socketRef.current && message.trim() !== '') {
      socketRef.current.send(JSON.stringify({
        username,
        content: message,
      }));
      setMessage('');
    }
  };

  const handleLogin = () => {
    const cleaned = username.trim();

    if (!/^[a-zA-Z0-9]{1,20}$/.test(cleaned)) {
      setInputError("Geçersiz kullanıcı adı. (Sadece harf/rakam, 1-20 karakter)");
      return;
    }

    socketRef.current = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    socketRef.current.onopen = () => {
      socketRef.current.send(JSON.stringify({
        type: "join",
        username: cleaned,
      }));
    };
  };

  return (
    <div className={`app-container ${!isLoggedIn ? 'blurred' : ''}`}>
      {!isLoggedIn && (
        <div className="modal">
          <h2>Kullanıcı Adı</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              const input = e.target.value;
              if (/^[a-zA-Z0-9]{0,20}$/.test(input)) {
                setUsername(input);
                setInputError('');
              } else {
                setInputError('Sadece harf ve rakam kullanın! (max 20 karakter)');
              }
            }}
            placeholder="Kullanıcı adınızı girin..."
          />
          {inputError && <p style={{ color: 'red' }}>{inputError}</p>}
          <button onClick={handleLogin}>Sohbete Gir</button>
        </div>
      )}

      {isLoggedIn && (
        <div className="chatbox">
          <h2>💬 Chatinyo</h2>

          <div className="user-list">
            <strong>Online:</strong>
            <ul>
              {onlineUsers.map((user, idx) => (
                <li key={idx}>{user}</li>
              ))}
            </ul>
          </div>

          <div className="chat-log" ref={chatLogRef}>
            {chatLog.map((msg, idx) => (
              <div key={idx}>
                {msg.type === 'system' ? (
                  <em style={{ color: '#888' }}>— {msg.content} —</em>
                ) : (
                  <span>
                    {msg.time ? ` (${msg.time})` : ''} <strong>{msg.username}</strong>: {msg.content}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              placeholder="Bir şeyler yaz..."
            />
            <button onClick={sendMessage}>Gönder</button>
          </div>

          {typingUser && <p className="typing-indicator">{typingUser} yazıyor...</p>}
        </div>
      )}
    </div>
  );
}

export default App;
