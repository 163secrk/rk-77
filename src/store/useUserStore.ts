import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserState, AVATARS, UserRole } from '../types';

interface UserStore extends UserState {
  setNickname: (nickname: string) => void;
  setAvatar: (avatar: string) => void;
  setPlayerId: (playerId: string | null) => void;
  setSpectatorId: (spectatorId: string | null) => void;
  setRoomId: (roomId: string | null) => void;
  setIsReady: (isReady: boolean) => void;
  setRole: (role: UserRole) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      nickname: '',
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      playerId: null,
      spectatorId: null,
      roomId: null,
      isReady: false,
      role: null,

      setNickname: (nickname) => set({ nickname }),
      setAvatar: (avatar) => set({ avatar }),
      setPlayerId: (playerId) => set({ playerId }),
      setSpectatorId: (spectatorId) => set({ spectatorId }),
      setRoomId: (roomId) => set({ roomId, isReady: false }),
      setIsReady: (isReady) => set({ isReady }),
      setRole: (role) => set({ role }),
      resetUser: () => set({
        playerId: null,
        spectatorId: null,
        roomId: null,
        isReady: false,
        role: null,
      }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        nickname: state.nickname,
        avatar: state.avatar,
      }),
    }
  )
);
