import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/RoomService.js';
import { PlayerService } from '../services/PlayerService.js';
import { CreateRoomData, ReadyStateData, Player } from '../types/index.js';

export class RoomController {
  private io: Server;
  private roomService: RoomService;
  private playerService: PlayerService;

  constructor(io: Server) {
    this.io = io;
    this.roomService = new RoomService();
    this.playerService = new PlayerService();
  }

  handleCreateRoom(socket: Socket, data: CreateRoomData): void {
    try {
      const { nickname, avatar, roomName } = data;

      if (!nickname || !avatar) {
        socket.emit('error', { message: '昵称和头像不能为空', code: 'INVALID_DATA' });
        return;
      }

      const tempOwnerId = 'temp_' + socket.id;
      const room = this.roomService.createRoom(tempOwnerId, roomName);
      const player = this.playerService.createPlayer(socket.id, nickname, avatar, room.id);

      room.ownerId = player.id;

      socket.join(room.id);

      const systemMessage = this.roomService.addSystemMessage(room.id, `${player.nickname} 创建了房间`);

      socket.emit('room:created', {
        roomId: room.id,
        roomName: room.name,
        ownerId: player.id,
        player,
      });

      const players = this.roomService.getPlayers(room.id);
      this.io.to(room.id).emit('players:update', { players });

      if (systemMessage) {
        this.io.to(room.id).emit('chat:message', {
          id: systemMessage.id,
          playerId: systemMessage.playerId,
          nickname: systemMessage.nickname,
          avatar: systemMessage.avatar,
          content: systemMessage.content,
          timestamp: systemMessage.timestamp.getTime(),
          isSystem: true,
        });
      }
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: '创建房间失败', code: 'CREATE_ROOM_FAILED' });
    }
  }

  handleJoinRoom(socket: Socket, data: { roomId: string; nickname: string; avatar: string }): void {
    try {
      const { roomId, nickname, avatar } = data;

      if (!roomId || !nickname || !avatar) {
        socket.emit('error', { message: '房间ID、昵称和头像不能为空', code: 'INVALID_DATA' });
        return;
      }

      const roomInfo = this.roomService.getRoomInfo(roomId.toUpperCase());
      if (!roomInfo) {
        socket.emit('error', { message: '房间不存在', code: 'ROOM_NOT_FOUND' });
        return;
      }

      if (this.roomService.isRoomFull(roomId.toUpperCase())) {
        socket.emit('error', { message: '房间已满', code: 'ROOM_FULL' });
        return;
      }

      const existingPlayer = this.playerService.getPlayer(socket.id);
      if (existingPlayer) {
        this.handleLeaveRoom(socket, { roomId: existingPlayer.roomId });
      }

      const player = this.playerService.createPlayer(socket.id, nickname, avatar, roomId.toUpperCase());
      socket.join(roomId.toUpperCase());

      const systemMessage = this.roomService.addSystemMessage(
        roomId.toUpperCase(),
        `${player.nickname} 加入了房间`
      );

      socket.emit('room:joined', {
        roomId: roomId.toUpperCase(),
        roomName: roomInfo.name,
        player,
      });

      const players = this.roomService.getPlayers(roomId.toUpperCase());
      this.io.to(roomId.toUpperCase()).emit('players:update', { players });

      if (systemMessage) {
        this.io.to(roomId.toUpperCase()).emit('chat:message', {
          id: systemMessage.id,
          playerId: systemMessage.playerId,
          nickname: systemMessage.nickname,
          avatar: systemMessage.avatar,
          content: systemMessage.content,
          timestamp: systemMessage.timestamp.getTime(),
          isSystem: true,
        });
      }

      const messages = this.roomService.getRecentMessages(roomId.toUpperCase());
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
      console.error('Error joining room:', error);
      socket.emit('error', { message: '加入房间失败', code: 'JOIN_ROOM_FAILED' });
    }
  }

  handleLeaveRoom(socket: Socket, data: { roomId: string }): void {
    try {
      const { roomId } = data;
      const player = this.playerService.removePlayer(socket.id);

      if (!player) return;

      socket.leave(roomId);

      const systemMessage = this.roomService.addSystemMessage(roomId, `${player.nickname} 离开了房间`);

      const roomInfo = this.roomService.getRoomInfo(roomId);
      if (roomInfo && roomInfo.currentPlayers > 0) {
        if (player.id === roomInfo.ownerId) {
          const remainingPlayers = this.roomService.getPlayers(roomId);
          if (remainingPlayers.length > 0) {
            const newOwner = remainingPlayers[0];
            const room = this.roomService['store'].getRoom(roomId);
            if (room) {
              room.ownerId = newOwner.id;
              this.roomService.addSystemMessage(roomId, `${newOwner.nickname} 成为新房主`);
            }
          }
        }

        const players = this.roomService.getPlayers(roomId);
        this.io.to(roomId).emit('players:update', { players });

        if (systemMessage) {
          this.io.to(roomId).emit('chat:message', {
            id: systemMessage.id,
            playerId: systemMessage.playerId,
            nickname: systemMessage.nickname,
            avatar: systemMessage.avatar,
            content: systemMessage.content,
            timestamp: systemMessage.timestamp.getTime(),
            isSystem: true,
          });
        }
      }

      socket.emit('room:left', { roomId });
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  handleToggleReady(socket: Socket, data: ReadyStateData): void {
    try {
      const { roomId, isReady } = data;

      if (!this.playerService.isPlayerInRoom(socket.id, roomId)) {
        socket.emit('error', { message: '你不在这个房间中', code: 'NOT_IN_ROOM' });
        return;
      }

      const player = this.playerService.updateReadyState(socket.id, isReady);
      if (!player) return;

      const players = this.roomService.getPlayers(roomId);
      this.io.to(roomId).emit('players:update', { players });
    } catch (error) {
      console.error('Error toggling ready:', error);
    }
  }

  handleDisconnect(socket: Socket): void {
    const player = this.playerService.getPlayer(socket.id);
    if (player) {
      this.handleLeaveRoom(socket, { roomId: player.roomId });
    }
  }

  handleGetPlayers(socket: Socket, data: { roomId: string }): void {
    const { roomId } = data;
    const players = this.roomService.getPlayers(roomId);
    socket.emit('players:update', { players });
  }
}
