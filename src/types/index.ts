export interface Player {
  id: string;
  socketId: string;
  nickname: string;
  avatar: string;
  roomId: string;
  isReady: boolean;
  seatNumber: number;
  joinedAt: string;
  score: number;
}

export interface Spectator {
  id: string;
  socketId: string;
  nickname: string;
  avatar: string;
  roomId: string;
  joinedAt: string;
}

export interface Danmaku {
  id: string;
  spectatorId: string;
  nickname: string;
  avatar: string;
  content: string;
  timestamp: number;
  color?: string;
  top?: number;
}

export interface GameRules {
  thinkTime: number;
  initialScore: number;
  maxPlayers: number;
}

export interface ScoreUpdate {
  playerId: string;
  nickname: string;
  avatar: string;
  scoreChange: number;
  newScore: number;
  timestamp: number;
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
  spectatorCount?: number;
}

export type UserRole = 'player' | 'spectator' | null;

export interface UserState {
  nickname: string;
  avatar: string;
  playerId: string | null;
  spectatorId: string | null;
  roomId: string | null;
  isReady: boolean;
  role: UserRole;
}

export interface RoomState {
  roomId: string | null;
  roomName: string;
  players: Player[];
  spectators: Spectator[];
  messages: Message[];
  danmakuList: Danmaku[];
  ownerId: string | null;
  isConnected: boolean;
  isKicked: boolean;
  isLeaving: boolean;
  gameRules: GameRules;
  gameStatus: 'waiting' | 'playing' | 'finished';
  scoreHistory: ScoreUpdate[];
  currentRound: number;
  role: UserRole;
  showDanmaku: boolean;
}

export const AVATARS = ['🦁', '🐯', '🐻', '🐼', '🦊', '🐰', '🐸', '🐵', '🐨', '🐮', '🐷', '🐴'];

export interface CreateRoomData {
  nickname: string;
  avatar: string;
  roomName?: string;
  gameRules?: Partial<GameRules>;
}

export interface UpdateRoomRulesData {
  roomId: string;
  gameRules: Partial<GameRules>;
}

export interface JoinRoomData {
  roomId: string;
  nickname: string;
  avatar: string;
}

export interface JoinSpectatorData {
  roomId: string;
  nickname: string;
  avatar: string;
}
