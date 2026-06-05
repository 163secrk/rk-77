import { MemoryStore } from '../store/MemoryStore.js';
import { Player, Room } from '../types/index.js';
import { generatePlayerId } from '../utils/generateId.js';
import { RoomService } from './RoomService.js';

export class PlayerService {
  private store: MemoryStore;
  private roomService: RoomService;

  constructor() {
    this.store = MemoryStore.getInstance();
    this.roomService = new RoomService();
  }

  createPlayer(socketId: string, nickname: string, avatar: string, roomId: string): Player {
    const seatNumber = this.roomService.getNextSeatNumber(roomId);

    const player: Player = {
      id: generatePlayerId(),
      socketId,
      nickname,
      avatar,
      roomId,
      isReady: false,
      seatNumber,
      joinedAt: new Date(),
    };

    this.store.addPlayerToRoom(roomId, player);
    return player;
  }

  getPlayer(socketId: string): Player | undefined {
    return this.store.getPlayerBySocketId(socketId);
  }

  getPlayerRoom(socketId: string): Room | undefined {
    return this.store.getPlayerRoom(socketId);
  }

  markPlayerDisconnected(socketId: string): Player | null {
    const player = this.store.getPlayerBySocketId(socketId);
    if (!player) return null;

    player.isDisconnected = true;
    player.disconnectedAt = new Date();
    this.store.updatePlayer(player);

    return player;
  }

  removePlayer(socketId: string): Player | null {
    const player = this.store.getPlayerBySocketId(socketId);
    if (!player) return null;

    this.store.removePlayerFromRoom(player.roomId, player.id);
    this.store.cleanupEmptyRooms();

    return player;
  }

  findReconnectablePlayer(roomId: string, nickname: string, socketId?: string): Player | undefined {
    const room = this.store.getRoom(roomId);
    if (!room) return undefined;

    for (const player of room.players.values()) {
      if (socketId && player.socketId === socketId) {
        return player;
      }
      if (player.nickname === nickname && player.isDisconnected) {
        const disconnectTime = player.disconnectedAt?.getTime() || 0;
        const now = Date.now();
        if (now - disconnectTime < 30000) {
          return player;
        }
      }
    }
    return undefined;
  }

  reconnectPlayer(player: Player, newSocketId: string): Player {
    player.socketId = newSocketId;
    player.isDisconnected = false;
    player.disconnectedAt = undefined;
    this.store.updatePlayer(player);
    this.store.updateSocketMapping(newSocketId, player.id);
    return player;
  }

  updateReadyState(socketId: string, isReady: boolean): Player | null {
    const player = this.store.getPlayerBySocketId(socketId);
    if (!player) return null;

    player.isReady = isReady;
    this.store.updatePlayer(player);

    return player;
  }

  isPlayerInRoom(socketId: string, roomId: string): boolean {
    const player = this.store.getPlayerBySocketId(socketId);
    return player?.roomId === roomId;
  }

  isRoomOwner(socketId: string): boolean {
    const player = this.store.getPlayerBySocketId(socketId);
    if (!player) return false;

    const room = this.store.getRoom(player.roomId);
    return room?.ownerId === player.id;
  }

  getRoomOwner(roomId: string): Player | undefined {
    const room = this.store.getRoom(roomId);
    if (!room) return undefined;
    return room.players.get(room.ownerId);
  }

  changeSeat(socketId: string, newSeat: number): Player | null {
    const player = this.store.getPlayerBySocketId(socketId);
    if (!player) return null;

    const room = this.store.getRoom(player.roomId);
    if (!room) return null;

    const availableSeats = this.roomService.getAvailableSeats(player.roomId);
    if (!availableSeats.includes(newSeat)) return null;

    player.seatNumber = newSeat;
    this.store.updatePlayer(player);

    return player;
  }
}
