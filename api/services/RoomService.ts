import { MemoryStore } from '../store/MemoryStore.js';
import { Room, Player, RoomInfo, Message } from '../types/index.js';
import { generateRoomId, generateMessageId } from '../utils/generateId.js';

export class RoomService {
  private store: MemoryStore;

  constructor() {
    this.store = MemoryStore.getInstance();
  }

  createRoom(ownerId: string, roomName?: string): Room {
    let roomId: string;
    do {
      roomId = generateRoomId();
    } while (this.store.hasRoom(roomId));

    const room: Room = {
      id: roomId,
      name: roomName || `${roomId} 号房间`,
      ownerId,
      maxPlayers: 4,
      currentPlayers: 0,
      status: 'waiting',
      players: new Map(),
      messages: [],
      createdAt: new Date(),
    };

    this.store.addRoom(room);
    return room;
  }

  getRoomInfo(roomId: string): RoomInfo | null {
    const room = this.store.getRoom(roomId);
    if (!room) return null;

    const activePlayers = Array.from(room.players.values()).filter(p => !p.isDisconnected);

    return {
      id: room.id,
      name: room.name,
      ownerId: room.ownerId,
      maxPlayers: room.maxPlayers,
      currentPlayers: activePlayers.length,
      status: room.status,
      players: activePlayers,
      createdAt: room.createdAt.toISOString(),
    };
  }

  getPlayers(roomId: string): Player[] {
    const room = this.store.getRoom(roomId);
    if (!room) return [];
    return Array.from(room.players.values())
      .filter(p => !p.isDisconnected)
      .sort((a, b) => a.seatNumber - b.seatNumber);
  }

  getNextSeatNumber(roomId: string): number {
    const room = this.store.getRoom(roomId);
    if (!room) return 1;

    const activePlayers = Array.from(room.players.values()).filter(p => !p.isDisconnected);
    const takenSeats = new Set(activePlayers.map(p => p.seatNumber));
    for (let i = 1; i <= room.maxPlayers; i++) {
      if (!takenSeats.has(i)) return i;
    }
    return 1;
  }

  isRoomFull(roomId: string): boolean {
    const room = this.store.getRoom(roomId);
    if (!room) return true;
    const activePlayers = Array.from(room.players.values()).filter(p => !p.isDisconnected);
    return activePlayers.length >= room.maxPlayers;
  }

  addSystemMessage(roomId: string, content: string): Message | null {
    const room = this.store.getRoom(roomId);
    if (!room) return null;

    const message: Message = {
      id: generateMessageId(),
      roomId,
      playerId: 'system',
      nickname: '系统',
      avatar: '🔔',
      content,
      isSystem: true,
      timestamp: new Date(),
    };

    room.messages.push(message);
    if (room.messages.length > 100) {
      room.messages.shift();
    }

    return message;
  }

  getRecentMessages(roomId: string): Message[] {
    const room = this.store.getRoom(roomId);
    if (!room) return [];
    return room.messages.slice(-50);
  }

  updateRoomStatus(roomId: string, status: Room['status']): void {
    const room = this.store.getRoom(roomId);
    if (room) {
      room.status = status;
    }
  }

  deleteRoom(roomId: string): boolean {
    if (!this.store.hasRoom(roomId)) return false;
    this.store.removeRoom(roomId);
    return true;
  }

  getAvailableSeats(roomId: string): number[] {
    const room = this.store.getRoom(roomId);
    if (!room) return [];
    const takenSeats = new Set(Array.from(room.players.values()).map(p => p.seatNumber));
    const available: number[] = [];
    for (let i = 1; i <= room.maxPlayers; i++) {
      if (!takenSeats.has(i)) available.push(i);
    }
    return available;
  }
}
