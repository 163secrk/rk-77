import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserState, AVATARS } from '../types';

interface UserStore extends UserState {
  setNickname: (nickname: string) => void;
  setAvatar: (avatar: string) => void;
  setPlayerId: (playerId: string | null) => void;
  setRoomId: (roomId: string | null) => void;
  setIsReady: (isReady: boolean) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      nickname: '',
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      playerId: null,
      roomId: null,
      isReady: false,

      setNickname: (nickname) => set({ nickname }),
      setAvatar: (avatar) => set({ avatar }),
      setPlayerId: (playerId) => set({ playerId }),
      setRoomId: (roomId) => set({ roomId, isReady: false }),
      setIsReady: (isReady) => set({ isReady }),
      resetUser: () => set({
        playerId: null,
        roomId: null,
        isReady: false,
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
