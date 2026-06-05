import { Server, Socket } from 'socket.io';
import { PlayerService } from '../services/PlayerService.js';
import { RoomService } from '../services/RoomService.js';

export class PlayerController {
  private io: Server;
  private playerService: PlayerService;

  private roomService: RoomService;

  constructor(io: Server) {
    this.io = io;
    this.playerService = new PlayerService();
    this.roomService = new RoomService();
  }

  handleGetPlayerInfo(socket: Socket): void {
    const player = this.playerService.getPlayer(socket.id);
    if (player) {
      socket.emit('player:info', { player });
    }
  }

  handleChangeSeat(socket: Socket, data: { roomId: string; seatNumber: number }): void {
    try {
      const { roomId, seatNumber } = data;

      if (!this.playerService.isPlayerInRoom(socket.id, roomId)) {
        socket.emit('error', { message: '你不在这个房间中', code: 'NOT_IN_ROOM' });
        return;
      }

      const player = this.playerService.changeSeat(socket.id, seatNumber);
      if (!player) {
        socket.emit('error', { message: '该座位已被占用', code: 'SEAT_TAKEN' });
        return;
      }

      socket.emit('player:seatChanged', { player });
    } catch (error) {
      console.error('Error changing seat:', error);
      socket.emit('error', { message: '更换座位失败', code: 'CHANGE_SEAT_FAILED' });
    }
  }

  handleKickPlayer(socket: Socket, data: { roomId: string; playerId: string }): void {
    try {
      const { roomId, playerId } = data;

      if (!this.playerService.isRoomOwner(socket.id)) {
        socket.emit('error', { message: '只有房主可以踢人', code: 'NOT_OWNER' });
        return;
      }

      const targetPlayer = this.playerService['store'].getRoom(roomId)?.players.get(playerId);
      if (!targetPlayer) {
        socket.emit('error', { message: '玩家不存在', code: 'PLAYER_NOT_FOUND' });
        return;
      }

      const targetSocket = this.io.sockets.sockets.get(targetPlayer.socketId);
      if (targetSocket) {
        targetSocket.leave(roomId);
        targetSocket.emit('player:kicked', { message: '你已被房主踢出房间' });
      }

      this.playerService.removePlayer(targetPlayer.socketId);

      const players = this.roomService.getPlayers(roomId);
      if (players.length > 0) {
        this.io.to(roomId).emit('players:update', { players });

        this.io.to(roomId).emit('chat:message', {
          id: 'sys_' + Date.now(),
          playerId: 'system',
          nickname: '系统',
          avatar: '🔔',
          content: `${targetPlayer.nickname} 已被房主移出房间`,
          timestamp: Date.now(),
          isSystem: true,
        });
      }
    } catch (error) {
      console.error('Error kicking player:', error);
      socket.emit('error', { message: '踢人失败', code: 'KICK_FAILED' });
    }
  }
}
