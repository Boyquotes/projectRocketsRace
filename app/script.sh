#!/bin/sh

echo "Launch socket.io"
node socket-server.js &
echo "Launch next"
npm install && npm run dev
