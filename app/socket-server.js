const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let selectedRockets = [];

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  // Sync initial rocket selection
  socket.emit('rocket-selection', selectedRockets);

  // Handle rocket selection
  socket.on('rocket-selection', (rocketIds) => {
    console.log('Rocket selection received:', rocketIds);
    selectedRockets = rocketIds;
    socket.broadcast.emit('rocket-selection', rocketIds);
  });

  // Sync rocket selection across tabs
  socket.on('sync-rocket-selection', (rocketIds) => {
    selectedRockets = rocketIds;
    socket.broadcast.emit('rocket-selection', rocketIds);
  });

  // Enhanced race launch handling
  socket.on('race-launched', (rocketIds) => {
    console.log('Race launched with rockets:', rocketIds);
    // Broadcast race launch to all other connected clients
    io.emit('race-launched', {
      rocketIds: rocketIds,
      initiatorSocketId: socket.id
    });
  });

  // Existing race invitation logic
  socket.on('race-invitation', (selectedRocketIds) => {
    console.log('Received race invitation for rockets:', selectedRocketIds);
    socket.broadcast.emit('race-invitation', selectedRocketIds);
  });

  // New game-related events
  socket.on('rocket-collision', (data) => {
    console.log('Rocket Collision:', data);
    // Broadcast collision to other clients or process game state
    socket.broadcast.emit('game-collision', data);
  });

  // Synchronized rocket movement
  socket.on('rocket-move', (data) => {
    // Broadcast rocket movement to other clients
    socket.broadcast.emit('rocket-move', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});