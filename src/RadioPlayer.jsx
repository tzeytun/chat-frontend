import React, { useRef, useState } from "react";

const stations = [
  {
    name: "Classic Vinyl HD",
    url: "https://icecast.walmradio.com:8443/classic"
  },
  {
    name: "Dance Wave!",
    url: "https://dancewave.online/dance.mp3"
  },
  {
    name: "Adroit Jazz Underground",
    url: "https://icecast.walmradio.com:8443/jazz"
  },
  {
    name: "WALM - Old Time Radio",
    url: "https://icecast.walmradio.com:8443/otr"
  },
  {
    name: "Christmas Vinyl HD",
    url: "https://icecast.walmradio.com:8443/christmas"
  },
  {
    name: "WALM HD",
    url: "https://icecast.walmradio.com:8443/walm"
  },
  {
    name: "WALM 2 HD",
    url: "https://icecast.walmradio.com:8443/walm2"
  },
];

const RadioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);

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

  const changeStation = () => {
    const nextIndex = (currentStationIndex + 1) % stations.length;
    setCurrentStationIndex(nextIndex);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch((err) => {
          console.error("Yayın başlatılamadı:", err);
        });
        setIsPlaying(true);
      }
    }, 100);
  };

  return (
    <div style={{
      background: "#d9d9d9",
      border: "2px inset #999",
      padding: "1rem",
      borderRadius: "4px",
      width: "280px",
      fontFamily: "Verdana, sans-serif",
      fontSize: "14px",
      color: "#111",
      boxShadow: "2px 2px 10px rgba(0,0,0,0.3)",
      textAlign: "center"
    }}>
      <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>📻 {stations[currentStationIndex].name}</div>

      <audio ref={audioRef}>
        <source src={stations[currentStationIndex].url} type="audio/mpeg" />
        Tarayıcınız ses öğesini desteklemiyor.
      </audio>

      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
        <button
          onClick={togglePlay}
          style={{
            backgroundColor: isPlaying ? "#c0392b" : "#27ae60",
            border: "1px outset #999",
            borderRadius: "3px",
            padding: "0.4rem 0.8rem",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "Tahoma, sans-serif"
          }}
        >
          {isPlaying ? "Durdur" : "Dinle"}
        </button>

        <button
          onClick={changeStation}
          style={{
            backgroundColor: "#3498db",
            border: "1px outset #999",
            borderRadius: "3px",
            padding: "0.4rem 0.8rem",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "Tahoma, sans-serif"
          }}
        >
          İstasyon Değiştir
        </button>
      </div>
    </div>
  );
};

export default RadioPlayer;
