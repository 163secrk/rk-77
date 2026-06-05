import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export async function checkRoomExists(roomId: string): Promise<{ exists: boolean; roomInfo?: RoomInfo }> {
  try {
    const response = await fetch(`/api/rooms/${roomId.toUpperCase()}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking room:', error);
    return { exists: false };
  }
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

interface RoomInfo {
  id: string;
  name: string;
  ownerId: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  players: [];
  createdAt: string;
  isFull?: boolean;
}
