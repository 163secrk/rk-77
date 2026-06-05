export interface Player {
  id: string;
  socketId: string;
  nickname: string;
  avatar: string;
  roomId: string;
  isReady: boolean;
  seatNumber: number;
  joinedAt: string;
}

export interface Message {
  id: string;
  playerId: string;
  nickname: string;
  avatar: string;
  content: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface RoomInfo {
  id: string;
  name: string;
  ownerId: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  createdAt: string;
  isFull?: boolean;
}

export interface UserState {
  nickname: string;
  avatar: string;
  playerId: string | null;
  roomId: string | null;
  isReady: boolean;
}

export interface RoomState {
  roomId: string | null;
  roomName: string;
  players: Player[];
  messages: Message[];
  ownerId: string | null;
  isConnected: boolean;
  isKicked: boolean;
  isLeaving: boolean;
}

export const AVATARS = ['🦁', '🐯', '🐻', '🐼', '🦊', '🐰', '🐸', '🐵', '🐨', '🐮', '🐷', '🐴'];

export interface CreateRoomData {
  nickname: string;
  avatar: string;
  roomName?: string;
}

export interface JoinRoomData {
  roomId: string;
  nickname: string;
  avatar: string;
}
