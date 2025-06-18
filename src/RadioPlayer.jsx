import React, { useRef, useState } from "react";

const RadioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Oynatma hatası:", err);
      });
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{
      background: "#f7f7f7",
      border: "1px solid #ccc",
      padding: "1rem",
      borderRadius: "8px",
      marginTop: "1rem",
      textAlign: "center"
    }}>
      <h4>📻 Walm Classic Radyo</h4>
      <button onClick={togglePlay} style={{
        padding: "0.4rem 1rem",
        borderRadius: "6px",
        border: "none",
        background: isPlaying ? "#c0392b" : "#27ae60",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer"
      }}>
        {isPlaying ? "Durdur" : "Dinle"}
      </button>
      <audio ref={audioRef} src="https://icecast.walmradio.com:8443/classic" />
    </div>
  );
};

export default RadioPlayer;
