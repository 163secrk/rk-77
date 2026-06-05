import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/ChatService.js';
import { PlayerService } from '../services/PlayerService.js';
import { ChatMessageData } from '../types/index.js';

export class ChatController {
  private io: Server;
  private chatService: ChatService;
  private playerService: PlayerService;

  constructor(io: Server) {
    this.io = io;
    this.chatService = new ChatService();
    this.playerService = new PlayerService();
  }

  handleSendMessage(socket: Socket, data: ChatMessageData): void {
    try {
      const { roomId, content } = data;

      const validation = this.chatService.validateMessage(content);
      if (!validation.valid) {
        socket.emit('error', { message: validation.error, code: 'INVALID_MESSAGE' });
        return;
      }

      if (!this.playerService.isPlayerInRoom(socket.id, roomId)) {
        socket.emit('error', { message: '你不在这个房间中', code: 'NOT_IN_ROOM' });
        return;
      }

      const message = this.chatService.sendMessage(socket.id, roomId, content);
      if (!message) return;

      this.io.to(roomId).emit('chat:message', {
        id: message.id,
        playerId: message.playerId,
        nickname: message.nickname,
        avatar: message.avatar,
        content: message.content,
        timestamp: message.timestamp.getTime(),
        isSystem: message.isSystem,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: '发送消息失败', code: 'SEND_MESSAGE_FAILED' });
    }
  }

  handleGetMessages(socket: Socket, data: { roomId: string }): void {
    try {
      const { roomId } = data;
      const messages = this.chatService.getMessages(roomId);

      messages.forEach((msg) => {
        socket.emit('chat:message', {
          id: msg.id,
          playerId: msg.playerId,
          nickname: msg.nickname,
          avatar: msg.avatar,
          content: msg.content,
          timestamp: msg.timestamp.getTime(),
          isSystem: msg.isSystem,
        });
      });
    } catch (error) {
      console.error('Error getting messages:', error);
    }
  }
}
