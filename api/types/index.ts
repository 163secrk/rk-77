export interface Player {
  id: string;
  socketId: string;
  nickname: string;
  avatar: string;
  roomId: string;
  isReady: boolean;
  seatNumber: number;
  joinedAt: Date;
  isDisconnected?: boolean;
  disconnectedAt?: Date;
  score: number;
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
  timestamp: Date;
}

export interface Message {
  id: string;
  roomId: string;
  playerId: string;
  nickname: string;
  avatar: string;
  content: string;
  isSystem: boolean;
  timestamp: Date;
}

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  players: Map<string, Player>;
  messages: Message[];
  createdAt: Date;
  gameRules: GameRules;
  scoreHistory: ScoreUpdate[];
  currentRound: number;
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
  gameRules: GameRules;
  currentRound: number;
}

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

export interface RoomRulesUpdatedEvent {
  gameRules: GameRules;
}

export interface GameStartedEvent {
  round: number;
  players: Player[];
}

export interface ScoreUpdatedEvent {
  updates: ScoreUpdate[];
  players: Player[];
}

export interface PlayerJoinData {
  roomId: string;
  nickname: string;
  avatar: string;
}

export interface ChatMessageData {
  roomId: string;
  content: string;
}

export interface ReadyStateData {
  roomId: string;
  isReady: boolean;
}

export interface RoomCreatedEvent {
  roomId: string;
  roomName: string;
  ownerId: string;
  player: Player;
}

export interface PlayersUpdateEvent {
  players: Player[];
}

export interface ChatMessageEvent {
  id: string;
  playerId: string;
  nickname: string;
  avatar: string;
  content: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface PlayerJoinedEvent {
  player: Player;
}

export interface PlayerLeftEvent {
  playerId: string;
  nickname: string;
}

export interface ErrorEvent {
  message: string;
  code: string;
}

export const AVATARS = ['🦁', '🐯', '🐻', '🐼', '🦊', '🐰', '🐸', '🐵', '🐨', '🐮', '🐷', '🐴'];
