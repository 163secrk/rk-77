import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/RoomService.js';
import { PlayerService } from '../services/PlayerService.js';
import { CreateRoomData, ReadyStateData, Player, UpdateRoomRulesData, ScoreUpdate } from '../types/index.js';

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
      const { nickname, avatar, roomName, gameRules } = data;

      if (!nickname || !avatar) {
        socket.emit('error', { message: '昵称和头像不能为空', code: 'INVALID_DATA' });
        return;
      }

      const tempOwnerId = 'temp_' + socket.id;
      const room = this.roomService.createRoom(tempOwnerId, roomName, gameRules);
      const player = this.playerService.createPlayer(socket.id, nickname, avatar, room.id);

      room.ownerId = player.id;

      socket.join(room.id);

      const systemMessage = this.roomService.addSystemMessage(room.id, `${player.nickname} 创建了房间`);

      socket.emit('room:created', {
        roomId: room.id,
        roomName: room.name,
        ownerId: player.id,
        player,
        gameRules: room.gameRules,
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

  handleUpdateRoomRules(socket: Socket, data: UpdateRoomRulesData): void {
    try {
      const { roomId, gameRules } = data;

      if (!this.playerService.isRoomOwner(socket.id)) {
        socket.emit('error', { message: '只有房主可以修改规则', code: 'NOT_OWNER' });
        return;
      }

      const room = this.roomService['store'].getRoom(roomId);
      if (!room || room.status !== 'waiting') {
        socket.emit('error', { message: '只能在等待状态修改规则', code: 'INVALID_STATUS' });
        return;
      }

      const updatedRules = this.roomService.updateGameRules(roomId, gameRules);
      if (!updatedRules) return;

      if (gameRules.initialScore !== undefined) {
        this.playerService.resetPlayerScores(roomId);
      }

      const players = this.roomService.getPlayers(roomId);
      this.io.to(roomId).emit('room:rules:updated', { gameRules: updatedRules });
      this.io.to(roomId).emit('players:update', { players });

      this.roomService.addSystemMessage(roomId, '房主更新了游戏规则');
    } catch (error) {
      console.error('Error updating room rules:', error);
      socket.emit('error', { message: '更新规则失败', code: 'UPDATE_RULES_FAILED' });
    }
  }

  handleStartGame(socket: Socket, data: { roomId: string }): void {
    try {
      const { roomId } = data;

      if (!this.playerService.isRoomOwner(socket.id)) {
        socket.emit('error', { message: '只有房主可以开始游戏', code: 'NOT_OWNER' });
        return;
      }

      if (!this.roomService.canStartGame(roomId)) {
        socket.emit('error', { message: '需要至少2名玩家且全部准备就绪', code: 'CANNOT_START' });
        return;
      }

      const result = this.roomService.startGame(roomId);
      if (!result) return;

      this.io.to(roomId).emit('game:started', {
        round: result.round,
        players: result.players,
      });

      this.roomService.addSystemMessage(roomId, `第 ${result.round} 局游戏开始！`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', { message: '开始游戏失败', code: 'START_GAME_FAILED' });
    }
  }

  handleUpdateScore(socket: Socket, data: { roomId: string; updates: Array<{ playerId: string; scoreChange: number }> }): void {
    try {
      const { roomId, updates } = data;

      if (!this.playerService.isRoomOwner(socket.id)) {
        socket.emit('error', { message: '只有房主可以更新比分', code: 'NOT_OWNER' });
        return;
      }

      const room = this.roomService['store'].getRoom(roomId);
      if (!room || room.status !== 'playing') {
        socket.emit('error', { message: '游戏未进行中', code: 'INVALID_STATUS' });
        return;
      }

      const scoreUpdates: ScoreUpdate[] = [];
      for (const update of updates) {
        const result = this.playerService.updatePlayerScore(update.playerId, roomId, update.scoreChange);
        if (result) {
          scoreUpdates.push(result);
          room.scoreHistory.push(result);
        }
      }

      const players = this.roomService.getPlayers(roomId);
      this.io.to(roomId).emit('score:updated', {
        updates: scoreUpdates,
        players,
      });
    } catch (error) {
      console.error('Error updating score:', error);
      socket.emit('error', { message: '更新比分失败', code: 'UPDATE_SCORE_FAILED' });
    }
  }

  handleJoinRoom(socket: Socket, data: { roomId: string; nickname: string; avatar: string }): void {
    try {
      const { roomId, nickname, avatar } = data;
      const normalizedRoomId = roomId.toUpperCase();

      if (!roomId || !nickname || !avatar) {
        socket.emit('error', { message: '房间ID、昵称和头像不能为空', code: 'INVALID_DATA' });
        return;
      }

      const roomInfo = this.roomService.getRoomInfo(normalizedRoomId);
      if (!roomInfo) {
        socket.emit('error', { message: '房间不存在', code: 'ROOM_NOT_FOUND' });
        return;
      }

      const existingPlayer = this.playerService.getPlayer(socket.id);
      if (existingPlayer && existingPlayer.roomId !== normalizedRoomId) {
        this.handleLeaveRoom(socket, { roomId: existingPlayer.roomId });
      }

      if (existingPlayer && existingPlayer.roomId === normalizedRoomId) {
        const room = this.roomService['store'].getRoom(normalizedRoomId);
        const players = this.roomService.getPlayers(normalizedRoomId);
        socket.emit('room:joined', {
          roomId: normalizedRoomId,
          roomName: this.roomService.getRoomInfo(normalizedRoomId)?.name || '',
          player: existingPlayer,
          isReconnect: true,
          gameRules: room?.gameRules,
        });
        this.io.to(normalizedRoomId).emit('players:update', { players });
        return;
      }

      const reconnectablePlayer = this.playerService.findReconnectablePlayer(normalizedRoomId, nickname, socket.id);
      let player: Player;
      let isReconnect = false;

      if (reconnectablePlayer && reconnectablePlayer.avatar === avatar) {
        player = this.playerService.reconnectPlayer(reconnectablePlayer, socket.id);
        isReconnect = true;
      } else {
        if (this.roomService.isRoomFull(normalizedRoomId)) {
          socket.emit('error', { message: '房间已满', code: 'ROOM_FULL' });
          return;
        }
        player = this.playerService.createPlayer(socket.id, nickname, avatar, normalizedRoomId);
      }

      const room = this.roomService['store'].getRoom(normalizedRoomId);

      socket.join(normalizedRoomId);

      if (!isReconnect) {
        this.roomService.addSystemMessage(
          normalizedRoomId,
          `${player.nickname} 加入了房间`
        );
      }

      socket.emit('room:joined', {
        roomId: normalizedRoomId,
        roomName: roomInfo.name,
        player,
        isReconnect,
        gameRules: room?.gameRules,
      });

      const players = this.roomService.getPlayers(normalizedRoomId);
      this.io.to(normalizedRoomId).emit('players:update', { players });

      const messages = this.roomService.getRecentMessages(normalizedRoomId);
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

      const room = this.roomService['store'].getRoom(roomId);
      if (room && room.status !== 'waiting') {
        socket.emit('error', { message: '游戏进行中无法更改准备状态', code: 'INVALID_STATUS' });
        return;
      }

      const player = this.playerService.updateReadyState(socket.id, isReady);
      if (!player) return;

      const players = this.roomService.getPlayers(roomId);
      this.io.to(roomId).emit('players:update', { players });

      if (isReady && this.roomService.canStartGame(roomId)) {
        setTimeout(() => {
          const currentRoom = this.roomService['store'].getRoom(roomId);
          if (currentRoom && currentRoom.status === 'waiting' && this.roomService.canStartGame(roomId)) {
            const result = this.roomService.startGame(roomId);
            if (result) {
              this.io.to(roomId).emit('game:started', {
                round: result.round,
                players: result.players,
              });
              this.roomService.addSystemMessage(roomId, `第 ${result.round} 局游戏开始！`);
            }
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error toggling ready:', error);
    }
  }

  handleDisconnect(socket: Socket): void {
    const player = this.playerService.markPlayerDisconnected(socket.id);
    if (player) {
      const room = this.roomService['store'].getRoom(player.roomId);
      if (room) {
        const activePlayers = Array.from(room.players.values()).filter(p => !p.isDisconnected);
        if (activePlayers.length > 0) {
          const players = this.roomService.getPlayers(player.roomId);
          this.io.to(player.roomId).emit('players:update', { players });
        }
      }
    }
  }

  handleGetPlayers(socket: Socket, data: { roomId: string }): void {
    const { roomId } = data;
    const players = this.roomService.getPlayers(roomId);
    socket.emit('players:update', { players });
  }
}
