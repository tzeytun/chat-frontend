import { useState, useEffect, useRef } from "react";
import "./App.css";
import RadioPlayer from "./RadioPlayer";

function getYouTubeVideoId(url) {
  try {
    const yt = new URL(url);
    if (yt.hostname === "youtu.be") {
      return yt.pathname.slice(1);
    }
    if (yt.hostname.includes("youtube.com")) {
      return new URLSearchParams(yt.search).get("v");
    }
    return null;
  } catch {
    return null;
  }
}

function generateColorFromUsername(username) {

  const lower = username.toLowerCase();
  if (lower === "admin") return "#e74c3c"; // kırmızı
  if (lower === "mod") return "#3498db";   // mavi

  // Diğer kullanıcılar için rastgele renk
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}



function App() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [inputError, setInputError] = useState("");
  const [shouldConnect, setShouldConnect] = useState(false);
  const [embedUrl, setEmbedUrl] = useState(null);
  const [usernameColors, setUsernameColors] = useState({});


  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatLogRef = useRef(null);

  const socketURL = process.env.REACT_APP_WEBSOCKET_URL;

  useEffect(() => {
    if (!shouldConnect || socketRef.current) return;

    socketRef.current = new WebSocket(socketURL);

    socketRef.current.onopen = () => {
      socketRef.current.send(
        JSON.stringify({
          type: "join",
          username: username.trim(),
        })
      );
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "error":
            if (data.error === "username_taken") {
              alert(data.content);
              socketRef.current.close();
              socketRef.current = null;
              setUsername("");
              setShouldConnect(false);
              setIsLoggedIn(false);
            } else if (data.error === "cooldown") {
              alert(data.content); // sadece uyarı
            } else {
              console.warn("Bilinmeyen hata:", data);
            }
            break;
          case "userlist":
            setOnlineUsers(data.users);
            setIsLoggedIn(true);

            // Kullanıcı adı renklerini atama
  setUsernameColors((prev) => {
    const updatedColors = { ...prev };
    data.users.forEach((user) => {
      if (!updatedColors[user]) {
        updatedColors[user] = generateColorFromUsername(user);
      }
    });
    return updatedColors;
  });
            break;
          case "typing":
            if (data.username !== username) {
              setTypingUser(data.username);
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 1500);
            }
            break;
          case "message":
          case "system":
            {
          const isPrivileged = data.username === "admin" || data.username === "mod";
          const ytRegex = /https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/\S*/gi;
          const foundLink = data.content.match(ytRegex);

          if (isPrivileged && foundLink) {
            const videoId = getYouTubeVideoId(foundLink[0]);
            if (videoId) {
              setEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
            }
          }
         }

            setChatLog((prev) => [...prev, data]);
            break;
          default:
            console.warn("Bilinmeyen mesaj tipi:", data);
        }
      } catch (err) {
        console.error("Mesaj ayrıştırılamadı:", err);
      }
    };

    socketRef.current.onclose = () => {
      socketRef.current = null;
      setIsLoggedIn(false);
      setOnlineUsers([]);
      setChatLog([]);
      setTypingUser("");
      setShouldConnect(false);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [shouldConnect, username]);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTo({ top: chatLogRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chatLog]);

  const handleInputChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    if (socketRef.current && socketRef.current.readyState === 1 && isLoggedIn) {
      socketRef.current.send(
        JSON.stringify({
          type: "typing",
          username,
        })
      );
    }
  };

  const sendMessage = () => {
    if (
      socketRef.current &&
      socketRef.current.readyState === 1 &&
      message.trim() !== ""
    ) {
      socketRef.current.send(
        JSON.stringify({
          type: "message",
          username,
          content: message.trim(),
        })
      );
      setMessage("");
    }
  };

  const handleLogin = () => {
    const cleaned = username.trim().toLowerCase();

    if (!/^[a-zA-Z0-9]{1,20}$/.test(cleaned)) {
      setInputError("Geçersiz kullanıcı adı. (Sadece harf/rakam, 1-20 karakter)");
      return;
    }

    setUsername(cleaned);
    setShouldConnect(true);
  };

  return (
    <div className={`app-container ${!isLoggedIn ? "blurred" : ""}`}>
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
                setInputError("");
              } else {
                setInputError("Sadece harf ve rakam kullanın! (max 20 karakter)");
              }
            }}
            placeholder="Kullanıcı adınızı girin..."
          />
          {inputError && <p style={{ color: "red" }}>{inputError}</p>}
          <button onClick={handleLogin}>Sohbete Gir</button>
        </div>
      )}

      {isLoggedIn && (
        <div className="chatbox">
          <h2>💬 Chatinyo</h2>
          {embedUrl ? (
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <iframe
              width="300"
              height="169"
              src={`${embedUrl}?autoplay=1`}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <RadioPlayer />
          </div>
        )}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            
    </div>

         <div className="user-list" style={{ maxHeight: "90px", overflowY: "auto" }}>
  <strong>Online:</strong>
  <ul>
    {[...onlineUsers]
    .sort((a, b) => {
      const priority = (u) => {
        if (u.toLowerCase() === "admin") return 0;
        if (u.toLowerCase() === "mod") return 1;
        return 2;
      };
      return priority(a) - priority(b);
    })
    .map((user, idx) => (
      <li key={idx} style={{ color: usernameColors[user] || "#000" }}>
        {user}
        {user.toLowerCase() === "admin" && "👑 "}
        {user.toLowerCase() === "mod" && "🛡️ "}
      </li>
    ))}
  </ul>
</div>

<div className="chat-log" ref={chatLogRef}>
  {chatLog.map((msg, idx) => (
    <div key={idx}
    style={{
    backgroundColor:
      msg.username.toLowerCase() === "admin"
        ? "#fff3cd"
        : msg.username.toLowerCase() === "mod"
        ? "#e2e3e5"
        : "transparent",
    padding: "6px 10px",
    borderRadius: "6px",
    margin: "4px 0",
    borderLeft:
      msg.username.toLowerCase() === "admin"
        ? "4px solid gold"
        : msg.username.toLowerCase() === "mod"
        ? "4px solid #007bff"
        : "none",
  }}>
      {msg.type === "system" ? (
        <em style={{ color: "#888" }}>— {msg.content} —</em>
      ) : (
        <span>
          {msg.time ? ` (${msg.time})` : ""}{" "}
          <strong style={{ color: usernameColors[msg.username] || "#000" }}>
            {msg.username}
            {msg.username.toLowerCase() === "admin" && "👑 "}
            {msg.username.toLowerCase() === "mod" && "🛡️ "}
          </strong>
          : {msg.content}
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
                if (e.key === "Enter") sendMessage();
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