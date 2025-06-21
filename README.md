# Chat Frontend

CHAT is a real-time chat frontend built with **React** and **WebSocket**, designed for a fun and interactive experience. It features online user tracking, typing indicators, role-based badges, and embedded YouTube video handling for admin/moderator privileges.

> This project is developed using [Create React App](https://create-react-app.dev/).


## Features

- Username validation and login
- Real-time WebSocket messaging
- YouTube embed for links shared by admin/mod
- Radio fallback when no video is active
- Online user list with role-based badges (👑 Admin, 🛡️ Mod)
- Typing indicator
- Auto-generated username colors
- Error handling (username taken, cooldown)
- Scrollable chat history
- No external authentication (nickname-based ephemeral sessions)


## Tech Stack

- React (with Hooks)
- WebSocket (via native `WebSocket` API)
- Custom CSS
- Environment-based config (`.env`)


## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chat-frontend.git
cd chat-frontend
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```
REACT_APP_WEBSOCKET_URL=ws://localhost:8080/ws
```

Make sure it points to the correct backend WebSocket endpoint.

### 4. Run the development server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app in the browser.


## File Structure

```
.
├── public/
├── src/
│   ├── App.css
│   ├── App.js
│   ├── RadioPlayer.jsx
│   └── index.js
├── .env.example
└── README.md
```

---

## Environment Variables

| Variable Name             | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| `REACT_APP_WEBSOCKET_URL` | WebSocket backend endpoint (e.g., `ws://localhost:8080/ws`) |

---

## YouTube Embed Logic

If an admin or mod user shares a YouTube link, the video will be auto-embedded in the chat area using:

```js
https://www.youtube.com/embed/<videoId>?autoplay=1
```

## Roles & Colors

* `admin` → 👑 Red-colored name, golden message border
* `mod` → 🛡️ Blue-colored name, blue message border
* Others → Auto-generated pastel HSL colors


## TODO / Ideas

* Persistent chat log (localStorage or backend)
* Authentication & tokens
* AI integration (e.g., summarization, moderation)

---

## License

MIT License. See [LICENSE](LICENSE) for more information.

---

## Acknowledgements

Thanks to:

* [React](https://reactjs.org/)
* [Create React App](https://create-react-app.dev/)
* [YouTube Embed Docs](https://developers.google.com/youtube/player_parameters)

