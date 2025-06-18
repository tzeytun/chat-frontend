import React, { useRef, useState } from "react";

const stations = [
    {
    name: "Dance Wave!",
    url: "https://dancewave.online/dance.mp3"
  },
  {
    name: "Classic Vinyl HD",
    url: "https://icecast.walmradio.com:8443/classic"
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

function RadioPlayer() {
  const [currentStation, setCurrentStation] = useState(0);
  const audioRef = useRef(null);

  const nextStation = () => {
    const next = (currentStation + 1) % stations.length;
    setCurrentStation(next);
    if (audioRef.current) {
      audioRef.current.src = stations[next].url;
      audioRef.current.play();
    }
  };

  const handleVolumeChange = (e) => {
    if (audioRef.current) {
      audioRef.current.volume = e.target.value;
    }
  };

  return (
    <div className="radio-player" style={{ maxWidth: "220px", padding: "0.8rem" }}>
      <div className="radio-screen" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>
        <span>{stations[currentStation].name}</span>
      </div>
      <div className="radio-controls" style={{ gap: "0.6rem" }}>
        <button onClick={nextStation} title="İstasyonu Değiştir" style={{ fontSize: "0.9rem", padding: "0.3rem 0.6rem" }}>
          ▶️
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          defaultValue="1"
          onChange={handleVolumeChange}
          title="Ses"
          style={{ width: "90px" }}
        />
      </div>
      <audio ref={audioRef} src={stations[currentStation].url} autoPlay />
    </div>
  );
}

export default RadioPlayer;

