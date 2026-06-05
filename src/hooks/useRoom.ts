import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './useSocket';
import { useUserStore } from '../store/useUserStore';
import { useRoomStore } from '../store/useRoomStore';
import { Player, Message, CreateRoomData, JoinRoomData, GameRules, ScoreUpdate, UpdateRoomRulesData } from '../types';

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

interface PlayersUpdateResponse {
  players: Player[];
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
  const { setPlayerId, setRoomId: setUserRoomId, setIsReady, resetUser } = useUserStore();
  const {
    roomId,
    players,
    gameRules,
    gameStatus,
    currentRound,
    setRoomId,
    setRoomName,
    setPlayers,
    addMessage,
    setOwnerId,
    setIsConnected,
    setIsKicked,
    setIsLeaving,
    setGameRules,
    setGameStatus,
    setCurrentRound,
    addScoreUpdate,
    resetRoom,
  } = useRoomStore();

  const createRoom = useCallback((data: CreateRoomData) => {
    emit<CreateRoomData>('room:create', data);
  }, [emit]);

  const joinRoom = useCallback((data: JoinRoomData) => {
    emit<JoinRoomData>('room:join', data);
  }, [emit]);

  const leaveRoom = useCallback(() => {
    if (roomId) {
      setIsLeaving(true);
      emit<{ roomId: string }>('room:leave', { roomId });
      resetUser();
      navigate('/');
      setTimeout(() => {
        resetRoom();
      }, 100);
    }
  }, [emit, roomId, setIsLeaving, resetUser, resetRoom, navigate]);

  const sendMessage = useCallback((content: string) => {
    if (roomId) {
      emit<{ roomId: string; content: string }>('chat:send', { roomId, content });
    }
  }, [emit, roomId]);

  const toggleReady = useCallback((isReady: boolean) => {
    if (roomId) {
      emit<{ roomId: string; isReady: boolean }>('player:ready', { roomId, isReady });
      setIsReady(isReady);
    }
  }, [emit, roomId, setIsReady]);

  const kickPlayer = useCallback((playerId: string) => {
    if (roomId) {
      emit<{ roomId: string; playerId: string }>('player:kick', { roomId, playerId });
    }
  }, [emit, roomId]);

  const updateRoomRules = useCallback((rules: Partial<GameRules>) => {
    if (roomId) {
      emit<UpdateRoomRulesData>('room:rules:update', { roomId, gameRules: rules });
    }
  }, [emit, roomId]);

  const startGame = useCallback(() => {
    if (roomId) {
      emit<{ roomId: string }>('game:start', { roomId });
    }
  }, [emit, roomId]);

  const updateScore = useCallback((updates: Array<{ playerId: string; scoreChange: number }>) => {
    if (roomId) {
      emit<{ roomId: string; updates: Array<{ playerId: string; scoreChange: number }> }>('score:update', { roomId, updates });
    }
  }, [emit, roomId]);

  useEffect(() => {
    const handleRoomCreated = (data: RoomCreatedResponse) => {
      setRoomId(data.roomId);
      setRoomName(data.roomName);
      setOwnerId(data.ownerId);
      setPlayerId(data.player.id);
      setUserRoomId(data.roomId);
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
      setIsConnected(true);
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

    const handleChatMessage = (message: Message) => {
      addMessage(message);
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
    on<PlayersUpdateResponse>('players:update', handlePlayersUpdate);
    on<Message>('chat:message', handleChatMessage);
    on<{ message: string }>('player:kicked', handlePlayerKicked);
    on('room:left', handleRoomLeft);
    on<RoomRulesUpdatedResponse>('room:rules:updated', handleRoomRulesUpdated);
    on<GameStartedResponse>('game:started', handleGameStarted);
    on<ScoreUpdatedResponse>('score:updated', handleScoreUpdated);
    on<{ message: string; code: string }>('error', handleError);

    return () => {
      off<RoomCreatedResponse>('room:created', handleRoomCreated);
      off<RoomJoinedResponse>('room:joined', handleRoomJoined);
      off<PlayersUpdateResponse>('players:update', handlePlayersUpdate);
      off<Message>('chat:message', handleChatMessage);
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
    setUserRoomId,
    setIsConnected,
    setIsKicked,
    setIsLeaving,
    setPlayers,
    addMessage,
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
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    toggleReady,
    kickPlayer,
    updateRoomRules,
    startGame,
    updateScore,
  };
}
