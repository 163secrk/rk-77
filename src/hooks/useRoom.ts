import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './useSocket';
import { useUserStore } from '../store/useUserStore';
import { useRoomStore } from '../store/useRoomStore';
import { Player, Message, CreateRoomData, JoinRoomData, GameRules, ScoreUpdate, UpdateRoomRulesData, Spectator, Danmaku, JoinSpectatorData } from '../types';

interface RoomCreatedResponse {
  roomId: string;
  roomName: string;
  ownerId: string;
  player: Player;
  gameRules: GameRules;
}

interface RoomJoinedResponse {
  roomId: string;
  roomName: string;
  player: Player;
  isReconnect?: boolean;
  gameRules?: GameRules;
}

interface SpectatorJoinedResponse {
  roomId: string;
  roomName: string;
  spectator: Spectator;
  gameRules?: GameRules;
  players: Player[];
}

interface PlayersUpdateResponse {
  players: Player[];
}

interface SpectatorsUpdateResponse {
  spectators: Spectator[];
}

interface RoomRulesUpdatedResponse {
  gameRules: GameRules;
}

interface GameStartedResponse {
  round: number;
  players: Player[];
}

interface ScoreUpdatedResponse {
  updates: ScoreUpdate[];
  players: Player[];
}

export function useRoom() {
  const navigate = useNavigate();
  const { emit, on, off } = useSocket();
  const { setPlayerId, setSpectatorId, setRoomId: setUserRoomId, setIsReady, setRole, resetUser } = useUserStore();
  const {
    roomId,
    players,
    gameRules,
    gameStatus,
    currentRound,
    role,
    setRoomId,
    setRoomName,
    setPlayers,
    setSpectators,
    addMessage,
    addDanmaku,
    setOwnerId,
    setIsConnected,
    setIsKicked,
    setIsLeaving,
    setGameRules,
    setGameStatus,
    setCurrentRound,
    setRole: setRoomRole,
    addScoreUpdate,
    resetRoom,
  } = useRoomStore();

  const createRoom = useCallback((data: CreateRoomData) => {
    emit<CreateRoomData>('room:create', data);
  }, [emit]);

  const joinRoom = useCallback((data: JoinRoomData) => {
    emit<JoinRoomData>('room:join', data);
  }, [emit]);

  const joinSpectator = useCallback((data: JoinSpectatorData) => {
    emit<JoinSpectatorData>('spectator:join', data);
  }, [emit]);

  const leaveRoom = useCallback(() => {
    if (roomId) {
      setIsLeaving(true);
      if (role === 'spectator') {
        emit<{ roomId: string }>('spectator:leave', { roomId });
      } else {
        emit<{ roomId: string }>('room:leave', { roomId });
      }
      resetUser();
      navigate('/');
      setTimeout(() => {
        resetRoom();
      }, 100);
    }
  }, [emit, roomId, role, setIsLeaving, resetUser, resetRoom, navigate]);

  const sendMessage = useCallback((content: string) => {
    if (roomId && role === 'player') {
      emit<{ roomId: string; content: string }>('chat:send', { roomId, content });
    }
  }, [emit, roomId, role]);

  const sendDanmaku = useCallback((content: string, color?: string) => {
    if (roomId && role === 'spectator') {
      emit<{ roomId: string; content: string; color?: string }>('danmaku:send', { roomId, content, color });
    }
  }, [emit, roomId, role]);

  const toggleReady = useCallback((isReady: boolean) => {
    if (roomId && role === 'player') {
      emit<{ roomId: string; isReady: boolean }>('player:ready', { roomId, isReady });
      setIsReady(isReady);
    }
  }, [emit, roomId, role, setIsReady]);

  const kickPlayer = useCallback((playerId: string) => {
    if (roomId && role === 'player') {
      emit<{ roomId: string; playerId: string }>('player:kick', { roomId, playerId });
    }
  }, [emit, roomId, role]);

  const updateRoomRules = useCallback((rules: Partial<GameRules>) => {
    if (roomId && role === 'player') {
      emit<UpdateRoomRulesData>('room:rules:update', { roomId, gameRules: rules });
    }
  }, [emit, roomId, role]);

  const startGame = useCallback(() => {
    if (roomId && role === 'player') {
      emit<{ roomId: string }>('game:start', { roomId });
    }
  }, [emit, roomId, role]);

  const updateScore = useCallback((updates: Array<{ playerId: string; scoreChange: number }>) => {
    if (roomId && role === 'player') {
      emit<{ roomId: string; updates: Array<{ playerId: string; scoreChange: number }> }>('score:update', { roomId, updates });
    }
  }, [emit, roomId, role]);

  useEffect(() => {
    const handleRoomCreated = (data: RoomCreatedResponse) => {
      setRoomId(data.roomId);
      setRoomName(data.roomName);
      setOwnerId(data.ownerId);
      setPlayerId(data.player.id);
      setUserRoomId(data.roomId);
      setRole('player');
      setRoomRole('player');
      setIsConnected(true);
      if (data.gameRules) {
        setGameRules(data.gameRules);
      }
      navigate(`/room/${data.roomId}`);
    };

    const handleRoomJoined = (data: RoomJoinedResponse) => {
      setRoomId(data.roomId);
      setRoomName(data.roomName);
      setPlayerId(data.player.id);
      setUserRoomId(data.roomId);
      setRole('player');
      setRoomRole('player');
      setIsConnected(true);
      if (data.gameRules) {
        setGameRules(data.gameRules);
      }
      navigate(`/room/${data.roomId}`);
    };

    const handleSpectatorJoined = (data: SpectatorJoinedResponse) => {
      setRoomId(data.roomId);
      setRoomName(data.roomName);
      setSpectatorId(data.spectator.id);
      setUserRoomId(data.roomId);
      setRole('spectator');
      setRoomRole('spectator');
      setIsConnected(true);
      setPlayers(data.players);
      if (data.gameRules) {
        setGameRules(data.gameRules);
      }
      navigate(`/room/${data.roomId}`);
    };

    const handlePlayersUpdate = (data: PlayersUpdateResponse) => {
      setPlayers(data.players);
      const owner = data.players.find(p => p.id === useRoomStore.getState().ownerId);
      if (!owner && data.players.length > 0) {
        setOwnerId(data.players[0].id);
      }
    };

    const handleSpectatorsUpdate = (data: SpectatorsUpdateResponse) => {
      setSpectators(data.spectators);
    };

    const handleChatMessage = (message: Message) => {
      addMessage(message);
    };

    const handleDanmakuMessage = (danmaku: Danmaku) => {
      addDanmaku(danmaku);
    };

    const handlePlayerKicked = (data: { message: string }) => {
      setIsKicked(true);
      resetUser();
      navigate('/');
      setTimeout(() => {
        resetRoom();
        alert(data.message);
      }, 100);
    };

    const handleRoomLeft = () => {
      setIsLeaving(false);
    };

    const handleRoomRulesUpdated = (data: RoomRulesUpdatedResponse) => {
      setGameRules(data.gameRules);
    };

    const handleGameStarted = (data: GameStartedResponse) => {
      setGameStatus('playing');
      setCurrentRound(data.round);
      setPlayers(data.players);
      setIsReady(false);
    };

    const handleScoreUpdated = (data: ScoreUpdatedResponse) => {
      setPlayers(data.players);
      data.updates.forEach((update) => {
        addScoreUpdate({
          ...update,
          timestamp: typeof update.timestamp === 'object' ? (update.timestamp as unknown as Date).getTime() : update.timestamp,
        });
      });
    };

    const handleError = (data: { message: string; code: string }) => {
      if (data.code === 'ROOM_FULL' || data.code === 'ROOM_NOT_FOUND') {
        resetUser();
        navigate('/');
        setTimeout(() => {
          resetRoom();
          alert(`错误: ${data.message}`);
        }, 100);
      } else {
        alert(`错误: ${data.message}`);
      }
    };

    on<RoomCreatedResponse>('room:created', handleRoomCreated);
    on<RoomJoinedResponse>('room:joined', handleRoomJoined);
    on<SpectatorJoinedResponse>('spectator:joined', handleSpectatorJoined);
    on<PlayersUpdateResponse>('players:update', handlePlayersUpdate);
    on<SpectatorsUpdateResponse>('spectators:update', handleSpectatorsUpdate);
    on<Message>('chat:message', handleChatMessage);
    on<Danmaku>('danmaku:message', handleDanmakuMessage);
    on<{ message: string }>('player:kicked', handlePlayerKicked);
    on('room:left', handleRoomLeft);
    on<RoomRulesUpdatedResponse>('room:rules:updated', handleRoomRulesUpdated);
    on<GameStartedResponse>('game:started', handleGameStarted);
    on<ScoreUpdatedResponse>('score:updated', handleScoreUpdated);
    on<{ message: string; code: string }>('error', handleError);

    return () => {
      off<RoomCreatedResponse>('room:created', handleRoomCreated);
      off<RoomJoinedResponse>('room:joined', handleRoomJoined);
      off<SpectatorJoinedResponse>('spectator:joined', handleSpectatorJoined);
      off<PlayersUpdateResponse>('players:update', handlePlayersUpdate);
      off<SpectatorsUpdateResponse>('spectators:update', handleSpectatorsUpdate);
      off<Message>('chat:message', handleChatMessage);
      off<Danmaku>('danmaku:message', handleDanmakuMessage);
      off<{ message: string }>('player:kicked', handlePlayerKicked);
      off('room:left', handleRoomLeft);
      off<RoomRulesUpdatedResponse>('room:rules:updated', handleRoomRulesUpdated);
      off<GameStartedResponse>('game:started', handleGameStarted);
      off<ScoreUpdatedResponse>('score:updated', handleScoreUpdated);
      off<{ message: string; code: string }>('error', handleError);
    };
  }, [
    on,
    off,
    setRoomId,
    setRoomName,
    setOwnerId,
    setPlayerId,
    setSpectatorId,
    setUserRoomId,
    setRole,
    setRoomRole,
    setIsConnected,
    setIsKicked,
    setIsLeaving,
    setPlayers,
    setSpectators,
    addMessage,
    addDanmaku,
    resetUser,
    resetRoom,
    setGameRules,
    setGameStatus,
    setCurrentRound,
    addScoreUpdate,
    setIsReady,
    navigate,
  ]);

  return {
    players,
    gameRules,
    gameStatus,
    currentRound,
    role,
    createRoom,
    joinRoom,
    joinSpectator,
    leaveRoom,
    sendMessage,
    sendDanmaku,
    toggleReady,
    kickPlayer,
    updateRoomRules,
    startGame,
    updateScore,
  };
}
