import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './useSocket';
import { useUserStore } from '../store/useUserStore';
import { useRoomStore } from '../store/useRoomStore';
import { Player, Message, CreateRoomData, JoinRoomData } from '../types';

interface RoomCreatedResponse {
  roomId: string;
  roomName: string;
  ownerId: string;
  player: Player;
}

interface RoomJoinedResponse {
  roomId: string;
  roomName: string;
  player: Player;
}

interface PlayersUpdateResponse {
  players: Player[];
}

export function useRoom() {
  const navigate = useNavigate();
  const { emit, on, off } = useSocket();
  const { setPlayerId, setRoomId: setUserRoomId, setIsReady, resetUser } = useUserStore();
  const {
    roomId,
    players,
    setRoomId,
    setRoomName,
    setPlayers,
    addMessage,
    setOwnerId,
    setIsConnected,
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
      emit<{ roomId: string }>('room:leave', { roomId });
      resetUser();
      resetRoom();
      navigate('/');
    }
  }, [emit, roomId, resetUser, resetRoom, navigate]);

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

  useEffect(() => {
    const handleRoomCreated = (data: RoomCreatedResponse) => {
      setRoomId(data.roomId);
      setRoomName(data.roomName);
      setOwnerId(data.ownerId);
      setPlayerId(data.player.id);
      setUserRoomId(data.roomId);
      setIsConnected(true);
      navigate(`/room/${data.roomId}`);
    };

    const handleRoomJoined = (data: RoomJoinedResponse) => {
      setRoomId(data.roomId);
      setRoomName(data.roomName);
      setPlayerId(data.player.id);
      setUserRoomId(data.roomId);
      setIsConnected(true);
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
      alert(data.message);
      resetUser();
      resetRoom();
      navigate('/');
    };

    const handleError = (data: { message: string; code: string }) => {
      alert(`错误: ${data.message}`);
    };

    on<RoomCreatedResponse>('room:created', handleRoomCreated);
    on<RoomJoinedResponse>('room:joined', handleRoomJoined);
    on<PlayersUpdateResponse>('players:update', handlePlayersUpdate);
    on<Message>('chat:message', handleChatMessage);
    on<{ message: string }>('player:kicked', handlePlayerKicked);
    on<{ message: string; code: string }>('error', handleError);

    return () => {
      off<RoomCreatedResponse>('room:created', handleRoomCreated);
      off<RoomJoinedResponse>('room:joined', handleRoomJoined);
      off<PlayersUpdateResponse>('players:update', handlePlayersUpdate);
      off<Message>('chat:message', handleChatMessage);
      off<{ message: string }>('player:kicked', handlePlayerKicked);
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
    setPlayers,
    addMessage,
    resetUser,
    resetRoom,
    navigate,
  ]);

  return {
    players,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    toggleReady,
    kickPlayer,
  };
}
