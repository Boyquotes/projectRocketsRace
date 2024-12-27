const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let selectedRockets = [];

io.on('connection', (socket) => {
  // Sync initial rocket selection
  socket.emit('rocket-selection', selectedRockets);

  // Handle rocket selection
  socket.on('rocket-selection', (rocketIds) => {
    selectedRockets = rocketIds;
    socket.broadcast.emit('rocket-selection', rocketIds);
  });

  // Sync rocket selection across tabs
  socket.on('sync-rocket-selection', (rocketIds) => {
    selectedRockets = rocketIds;
    socket.broadcast.emit('rocket-selection', rocketIds);
  });

  // Handle race launch
  socket.on('launch-race', (rocketIds) => {
    socket.broadcast.emit('race-launched', rocketIds);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});