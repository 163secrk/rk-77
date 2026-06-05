import { create } from 'zustand';
import { Player, Message, RoomState } from '../types';

interface RoomStore extends RoomState {
  setRoomId: (roomId: string | null) => void;
  setRoomName: (name: string) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (player: Player) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setOwnerId: (ownerId: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIsKicked: (isKicked: boolean) => void;
  setIsLeaving: (isLeaving: boolean) => void;
  resetRoom: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomId: null,
  roomName: '',
  players: [],
  messages: [],
  ownerId: null,
  isConnected: false,
  isKicked: false,
  isLeaving: false,

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
  addMessage: (message) =>
    set((state) => {
      const newMessages = [...state.messages, message];
      if (newMessages.length > 100) {
        newMessages.shift();
      }
      return { messages: newMessages };
    }),
  setMessages: (messages) => set({ messages }),
  setOwnerId: (ownerId) => set({ ownerId }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsKicked: (isKicked) => set({ isKicked }),
  setIsLeaving: (isLeaving) => set({ isLeaving }),
  resetRoom: () =>
    set({
      roomId: null,
      roomName: '',
      players: [],
      messages: [],
      ownerId: null,
      isConnected: false,
      isKicked: false,
      isLeaving: false,
    }),
}));
