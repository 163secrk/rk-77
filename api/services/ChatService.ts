import { MemoryStore } from '../store/MemoryStore.js';
import { Message } from '../types/index.js';
import { generateMessageId } from '../utils/generateId.js';
import { PlayerService } from './PlayerService.js';

export class ChatService {
  private store: MemoryStore;
  private playerService: PlayerService;

  constructor() {
    this.store = MemoryStore.getInstance();
    this.playerService = new PlayerService();
  }

  sendMessage(socketId: string, roomId: string, content: string): Message | null {
    const player = this.playerService.getPlayer(socketId);
    if (!player || player.roomId !== roomId) return null;

    const room = this.store.getRoom(roomId);
    if (!room) return null;

    const message: Message = {
      id: generateMessageId(),
      roomId,
      playerId: player.id,
      nickname: player.nickname,
      avatar: player.avatar,
      content: content.trim(),
      isSystem: false,
      timestamp: new Date(),
    };

    room.messages.push(message);
    if (room.messages.length > 100) {
      room.messages.shift();
    }

    return message;
  }

  getMessages(roomId: string): Message[] {
    const room = this.store.getRoom(roomId);
    if (!room) return [];
    return [...room.messages];
  }

  validateMessage(content: string): { valid: boolean; error?: string } {
    const trimmed = content.trim();
    if (!trimmed) {
      return { valid: false, error: '消息不能为空' };
    }
    if (trimmed.length > 500) {
      return { valid: false, error: '消息不能超过500字符' };
    }
    return { valid: true };
  }
}
