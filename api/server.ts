import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { RoomController } from './controllers/RoomController.js';
import { ChatController } from './controllers/ChatController.js';
import { PlayerController } from './controllers/PlayerController.js';
import { MemoryStore } from './store/MemoryStore.js';

const PORT = process.env.PORT || 8077;

const store = MemoryStore.getInstance();

setInterval(() => {
  store.cleanupDisconnectedPlayers();
}, 10000);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const roomController = new RoomController(io);
const chatController = new ChatController(io);
const playerController = new PlayerController(io);

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('room:create', (data) => roomController.handleCreateRoom(socket, data));
  socket.on('room:join', (data) => roomController.handleJoinRoom(socket, data));
  socket.on('room:leave', (data) => roomController.handleLeaveRoom(socket, data));
  socket.on('room:getPlayers', (data) => roomController.handleGetPlayers(socket, data));
  socket.on('room:rules:update', (data) => roomController.handleUpdateRoomRules(socket, data));
  socket.on('game:start', (data) => roomController.handleStartGame(socket, data));
  socket.on('score:update', (data) => roomController.handleUpdateScore(socket, data));

  socket.on('player:ready', (data) => roomController.handleToggleReady(socket, data));
  socket.on('player:getInfo', () => playerController.handleGetPlayerInfo(socket));
  socket.on('player:changeSeat', (data) => playerController.handleChangeSeat(socket, data));
  socket.on('player:kick', (data) => playerController.handleKickPlayer(socket, data));

  socket.on('chat:send', (data) => chatController.handleSendMessage(socket, data));
  socket.on('chat:getMessages', (data) => chatController.handleGetMessages(socket, data));

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    roomController.handleDisconnect(socket);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io server ready`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;