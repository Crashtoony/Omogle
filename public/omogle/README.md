# Omogle 🎥

Real-time stranger video + text chat. Built with WebRTC (peer-to-peer video) and Socket.io (signaling + matchmaking).

## How it works

1. Two users visit the site and press "Start chatting"
2. The server matches them together and facilitates a WebRTC handshake
3. Once connected, video/audio is **peer-to-peer** — it never touches the server
4. Text chat goes over a WebRTC data channel (also P2P)
5. Either user can hit **Next** to skip to a new stranger

---

## Run locally

```bash
npm install
npm start
# Open http://localhost:3000 in two different browser windows
```

To test video between two tabs: open one in normal mode, one in incognito.

---

## Deploy to the internet (free)

### Option A — Render (recommended, free tier)
1. Push this folder to a GitHub repo
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo
4. Set: Build command `npm install`, Start command `node server.js`
5. Deploy — Render gives you a public URL

### Option B — Railway
1. Push to GitHub
2. [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. It auto-detects Node.js and deploys

### Option C — Fly.io
```bash
npm install -g flyctl
fly launch
fly deploy
```

---

## Notes

- Requires HTTPS in production for camera access (Render/Railway handle this automatically)
- For users behind strict NAT/firewalls, add TURN servers to `ICE_SERVERS` in `public/index.html`
- Free TURN servers: [Metered](https://www.metered.ca/tools/openrelay/) has a free tier
