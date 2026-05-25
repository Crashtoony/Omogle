const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

let waiting = null;
const pairs = new Map(); // socketId -> partnerId
const gameState = new Map(); // socketId -> { scores, round }

const CHALLENGES = [
  "Pull your best model face 📸",
  "Do your most intimidating stare 👁️",
  "Flash your biggest smile 😁",
  "Strike your most confident pose 💪",
  "Do the most masculine jaw clench 🗿",
  "Show off your best hair flip 💇",
  "Give your most powerful nod 😤",
  "Do your best sigma face 😐",
  "Flex whatever you've got 💪",
  "Most unimpressed look 🥱",
  "Best blue steel impression 😏",
  "Most alpha entrance — stand up and sit back down 👑",
  "Demonstrate peak chin position 🫅",
  "Best 'I just won' celebration 🏆",
  "Prove you have the better jawline 😤",
];

io.on('connection', (socket) => {
  console.log(`+ ${socket.id}`);

  socket.on('find', () => {
    if (waiting && waiting.id !== socket.id && waiting.connected) {
      const partner = waiting;
      waiting = null;
      pairs.set(socket.id, partner.id);
      pairs.set(partner.id, socket.id);
      gameState.set(socket.id, { score: 0, round: 0 });
      gameState.set(partner.id, { score: 0, round: 0 });
      partner.emit('matched', { role: 'caller' });
      socket.emit('matched', { role: 'callee' });
    } else {
      waiting = socket;
      socket.emit('waiting');
    }
  });

  socket.on('cancel', () => { if (waiting?.id === socket.id) waiting = null; });

  socket.on('signal', (data) => {
    const pid = pairs.get(socket.id);
    if (pid) io.to(pid).emit('signal', data);
  });

  socket.on('msg', (text) => {
    const pid = pairs.get(socket.id);
    if (pid) io.to(pid).emit('msg', text);
  });

  socket.on('typing', (val) => {
    const pid = pairs.get(socket.id);
    if (pid) io.to(pid).emit('typing', val);
  });

  // Player votes that opponent mogged them
  socket.on('vote_them', () => {
    const pid = pairs.get(socket.id);
    if (!pid) return;
    const gs = gameState.get(pid);
    if (gs) gs.score = (gs.score || 0) + 1;
    io.to(pid).emit('got_point', { total: gs?.score || 0 });
    socket.emit('gave_point');
  });

  // Player votes that THEY mogged
  socket.on('vote_me', () => {
    const pid = pairs.get(socket.id);
    if (!pid) return;
    const gs = gameState.get(socket.id);
    if (gs) gs.score = (gs.score || 0) + 1;
    socket.emit('got_point', { total: gs?.score || 0 });
    io.to(pid).emit('gave_point');
  });

  socket.on('request_challenge', () => {
    const pid = pairs.get(socket.id);
    if (!pid) return;
    const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    socket.emit('challenge', challenge);
    io.to(pid).emit('challenge', challenge);
  });

  socket.on('reaction', (emoji) => {
    const pid = pairs.get(socket.id);
    if (pid) io.to(pid).emit('reaction', emoji);
  });

  socket.on('skip', () => disconnectPair(socket));

  socket.on('disconnect', () => {
    console.log(`- ${socket.id}`);
    if (waiting?.id === socket.id) waiting = null;
    disconnectPair(socket, true);
  });

  function disconnectPair(sock, silent = false) {
    const pid = pairs.get(sock.id);
    if (pid) {
      pairs.delete(sock.id); pairs.delete(pid);
      gameState.delete(sock.id); gameState.delete(pid);
      io.to(pid).emit('stranger_left');
    }
  }
});

setInterval(() => io.emit('online', io.engine.clientsCount), 3000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Omogle running → http://localhost:${PORT}`));
