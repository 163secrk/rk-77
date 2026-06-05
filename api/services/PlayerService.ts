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

  removePlayer(socketId: string): Player | null {
    const player = this.store.getPlayerBySocketId(socketId);
    if (!player) return null;

    this.store.removePlayerFromRoom(player.roomId, player.id);
    this.store.cleanupEmptyRooms();

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
