import { Room, Player } from '../types/index.js';

export class MemoryStore {
  private static instance: MemoryStore;
  private rooms: Map<string, Room> = new Map();
  private socketToPlayer: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): MemoryStore {
    if (!MemoryStore.instance) {
      MemoryStore.instance = new MemoryStore();
    }
    return MemoryStore.instance;
  }

  addRoom(room: Room): void {
    this.rooms.set(room.id, room);
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  hasRoom(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  removeRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.players.forEach((player) => {
        this.socketToPlayer.delete(player.socketId);
      });
    }
    this.rooms.delete(roomId);
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  addPlayerToRoom(roomId: string, player: Player): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.players.set(player.id, player);
      room.currentPlayers = room.players.size;
      this.socketToPlayer.set(player.socketId, player.id);
    }
  }

  removePlayerFromRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      const player = room.players.get(playerId);
      if (player) {
        this.socketToPlayer.delete(player.socketId);
      }
      room.players.delete(playerId);
      room.currentPlayers = room.players.size;
    }
  }

  getPlayerBySocketId(socketId: string): Player | undefined {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return undefined;

    for (const room of this.rooms.values()) {
      const player = room.players.get(playerId);
      if (player) return player;
    }
    return undefined;
  }

  getPlayerRoom(socketId: string): Room | undefined {
    const player = this.getPlayerBySocketId(socketId);
    if (!player) return undefined;
    return this.rooms.get(player.roomId);
  }

  updatePlayer(player: Player): void {
    const room = this.rooms.get(player.roomId);
    if (room) {
      room.players.set(player.id, player);
    }
  }

  updateSocketMapping(socketId: string, playerId: string): void {
    this.socketToPlayer.set(socketId, playerId);
  }

  cleanupEmptyRooms(): void {
    for (const [roomId, room] of this.rooms.entries()) {
      const activePlayers = Array.from(room.players.values()).filter(p => !p.isDisconnected);
      if (room.players.size === 0 || (activePlayers.length === 0 && this.isAllPlayersDisconnectedTooLong(room))) {
        this.removeRoom(roomId);
      }
    }
  }

  private isAllPlayersDisconnectedTooLong(room: Room): boolean {
    const now = Date.now();
    for (const player of room.players.values()) {
      if (!player.isDisconnected) return false;
      const disconnectTime = player.disconnectedAt?.getTime() || 0;
      if (now - disconnectTime < 30000) return false;
    }
    return true;
  }

  cleanupDisconnectedPlayers(): void {
    const now = Date.now();
    for (const room of this.rooms.values()) {
      for (const [playerId, player] of room.players.entries()) {
        if (player.isDisconnected && player.disconnectedAt) {
          if (now - player.disconnectedAt.getTime() >= 30000) {
            this.socketToPlayer.delete(player.socketId);
            room.players.delete(playerId);
            room.currentPlayers = room.players.size;
          }
        }
      }
    }
    this.cleanupEmptyRooms();
  }
}
