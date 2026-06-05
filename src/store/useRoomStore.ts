import { create } from 'zustand';
import { Player, Message, RoomState, GameRules, ScoreUpdate, Spectator, Danmaku, UserRole } from '../types';

const DEFAULT_GAME_RULES: GameRules = {
  thinkTime: 30,
  initialScore: 100,
  maxPlayers: 4,
};

interface RoomStore extends RoomState {
  setRoomId: (roomId: string | null) => void;
  setRoomName: (name: string) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (player: Player) => void;
  setSpectators: (spectators: Spectator[]) => void;
  addSpectator: (spectator: Spectator) => void;
  removeSpectator: (spectatorId: string) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  addDanmaku: (danmaku: Danmaku) => void;
  setDanmakuList: (danmakuList: Danmaku[]) => void;
  clearDanmaku: () => void;
  setOwnerId: (ownerId: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIsKicked: (isKicked: boolean) => void;
  setIsLeaving: (isLeaving: boolean) => void;
  setGameRules: (rules: Partial<GameRules>) => void;
  setGameStatus: (status: RoomState['gameStatus']) => void;
  addScoreUpdate: (update: ScoreUpdate) => void;
  setScoreHistory: (history: ScoreUpdate[]) => void;
  setCurrentRound: (round: number) => void;
  setRole: (role: UserRole) => void;
  setShowDanmaku: (show: boolean) => void;
  resetRoom: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomId: null,
  roomName: '',
  players: [],
  spectators: [],
  messages: [],
  danmakuList: [],
  ownerId: null,
  isConnected: false,
  isKicked: false,
  isLeaving: false,
  gameRules: DEFAULT_GAME_RULES,
  gameStatus: 'waiting',
  scoreHistory: [],
  currentRound: 0,
  role: null,
  showDanmaku: true,

  setRoomId: (roomId) => set({ roomId }),
  setRoomName: (roomName) => set({ roomName }),
  setPlayers: (players) => set({ players }),
  addPlayer: (player) =>
    set((state) => ({
      players: [...state.players, player].sort((a, b) => a.seatNumber - b.seatNumber),
    })),
  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),
  updatePlayer: (player) =>
    set((state) => ({
      players: state.players
        .map((p) => (p.id === player.id ? player : p))
        .sort((a, b) => a.seatNumber - b.seatNumber),
    })),
  setSpectators: (spectators) => set({ spectators }),
  addSpectator: (spectator) =>
    set((state) => ({
      spectators: [...state.spectators, spectator],
    })),
  removeSpectator: (spectatorId) =>
    set((state) => ({
      spectators: state.spectators.filter((s) => s.id !== spectatorId),
    })),
  addMessage: (message) =>
    set((state) => {
      const newMessages = [...state.messages, message];
      if (newMessages.length > 100) {
        newMessages.shift();
      }
      return { messages: newMessages };
    }),
  setMessages: (messages) => set({ messages }),
  addDanmaku: (danmaku) =>
    set((state) => {
      const newDanmakuList = [...state.danmakuList, { ...danmaku, top: danmaku.top ?? Math.random() * 70 + 5 }];
      if (newDanmakuList.length > 50) {
        newDanmakuList.shift();
      }
      return { danmakuList: newDanmakuList };
    }),
  setDanmakuList: (danmakuList) => set({ danmakuList }),
  clearDanmaku: () => set({ danmakuList: [] }),
  setOwnerId: (ownerId) => set({ ownerId }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsKicked: (isKicked) => set({ isKicked }),
  setIsLeaving: (isLeaving) => set({ isLeaving }),
  setGameRules: (rules) =>
    set((state) => ({
      gameRules: { ...state.gameRules, ...rules },
    })),
  setGameStatus: (gameStatus) => set({ gameStatus }),
  addScoreUpdate: (update) =>
    set((state) => ({
      scoreHistory: [...state.scoreHistory, update],
    })),
  setScoreHistory: (scoreHistory) => set({ scoreHistory }),
  setCurrentRound: (currentRound) => set({ currentRound }),
  setRole: (role) => set({ role }),
  setShowDanmaku: (showDanmaku) => set({ showDanmaku }),
  resetRoom: () =>
    set({
      roomId: null,
      roomName: '',
      players: [],
      spectators: [],
      messages: [],
      danmakuList: [],
      ownerId: null,
      isConnected: false,
      isKicked: false,
      isLeaving: false,
      gameRules: DEFAULT_GAME_RULES,
      gameStatus: 'waiting',
      scoreHistory: [],
      currentRound: 0,
      role: null,
      showDanmaku: true,
    }),
}));
