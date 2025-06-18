import { useState, useEffect, useRef } from "react";
import "./App.css";
import RadioPlayer from "./RadioPlayer";

function App() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [inputError, setInputError] = useState("");
  const [shouldConnect, setShouldConnect] = useState(false);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatLogRef = useRef(null);

  const socketURL = process.env.REACT_APP_WEBSOCKET_URL;

   // ASCII art tespit fonksiyonu - geliştirilmiş
  const detectAsciiArt = (text) => {
    if (!text || typeof text !== "string") return false

    // Çok satırlı mı kontrol et
    const lines = text.split("\n")
    if (lines.length < 2) return false

    // ASCII art karakterleri
    const asciiChars = /[│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬▀▄█▌▐░▒▓■□▪▫◆◇○●◦‣⁃∙•‰‱※‼⁇⁈⁉‖‗''‚‛""„‟†‡•‰‱‴‵‶‷‸‹›※‼‽⁇⁈⁉⁏⁐⁑⁒⁓⁔⁕⁖⁗⁘⁙⁚⁛⁜⁝⁞]/

    // Her satırda ASCII karakter var mı kontrol et
    let asciiLineCount = 0
    let totalNonEmptyLines = 0

    lines.forEach((line) => {
      const trimmedLine = line.trim()
      if (trimmedLine.length > 0) {
        totalNonEmptyLines++
        // ASCII karakterler, tekrarlayan karakterler veya özel desenler
        if (
          asciiChars.test(trimmedLine) ||
          /[─━│┃┄┅┆┇┈┉┊┋]/.test(trimmedLine) ||
          /[/\\|_\-=+*#@%&<>^~`]/.test(trimmedLine) ||
          /(.)\1{2,}/.test(trimmedLine) || // Aynı karakterin 3+ kez tekrarı
          trimmedLine.length > 30
        ) {
          // Uzun satırlar genelde ASCII art
          asciiLineCount++
        }
      }
    })

    // En az 2 satır ve satırların %60'ında ASCII karakter varsa ASCII art
    return totalNonEmptyLines >= 2 && asciiLineCount / totalNonEmptyLines >= 0.6
  }


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

  // ASCII art örneği eklemek için test fonksiyonu
  const addAsciiExample = () => {
    const asciiExample = `
╔══════════════════════════════╗
║          ASCII ART           ║
║                              ║
║    ░░░░░░░░░░░░░░░░░░░░░░    ║
║    ░░██████░░██████░░░░░░    ║
║    ░░██████░░██████░░░░░░    ║
║    ░░░░░░░░░░░░░░░░░░░░░░    ║
║    ░░░░██████████░░░░░░░░    ║
║    ░░░░░░████████░░░░░░░░    ║
║    ░░░░░░░░░░░░░░░░░░░░░░    ║
╚══════════════════════════════╝`

    setChatLog((prev) => [
      ...prev,
      {
        type: "message",
        username: "System",
        content: asciiExample.trim(),
        time: new Date().toLocaleTimeString(),
      },
    ])
  }

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
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
      <RadioPlayer />
    </div>

          <div className="user-list">
            <strong>Online:</strong>
            <ul>
              {onlineUsers.map((user, idx) => (
                <li key={idx}>{user}</li>
              ))}
            </ul>
          </div>

          {/* ASCII Art test butonu */}
          <div style={{ marginBottom: "1rem", textAlign: "center" }}>
            <button
              onClick={addAsciiExample}
              style={{
                padding: "0.3rem 0.6rem",
                fontSize: "0.8rem",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ASCII Art Örneği Ekle
            </button>
          </div>

          <div className="chat-log" ref={chatLogRef}>
  {chatLog.map((msg, idx) => {
    const isAscii =
      msg.content.includes('\n') && msg.content.length >= 20; // en az 1 satır atlaması + 20 karakter

    return (
                <div key={idx} className="chat-message">
                  {msg.type === "system" ? (
                    <em className="system-message">— {msg.content} —</em>
                  ) : (
                    <div className="user-message">
                      <div className="message-header">
                        {msg.time && <span className="message-time">({msg.time})</span>}
                        <strong className="message-username">{msg.username}:</strong>
                      </div>
                      <div className="message-content">
                        {isAscii ? (
                          <div className="ascii-art-container">
                            <div className="ascii-art-label">🎨 ASCII Art</div>
                            <pre className="ascii-message">{msg.content}</pre>
                          </div>
                        ) : (
                          <span className="regular-message">{msg.content}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
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
