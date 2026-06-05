import { Copy, LogOut, Users } from 'lucide-react';
import { copyToClipboard } from '../utils/socket';

interface RoomHeaderProps {
  roomId: string;
  roomName: string;
  playerCount: number;
  maxPlayers: number;
  onLeave: () => void;
}

export function RoomHeader({ roomId, roomName, playerCount, maxPlayers, onLeave }: RoomHeaderProps) {
  const handleCopy = async () => {
    await copyToClipboard(roomId);
    alert('房间ID已复制到剪贴板！');
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 px-6 py-4 shadow-xl border-b border-amber-500/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-100 tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
              {roomName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-emerald-300 text-sm">房间ID:</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 bg-emerald-950/50 px-3 py-1 rounded-lg text-amber-300 font-mono text-sm hover:bg-emerald-950 transition-colors group"
              >
                <span className="tracking-widest">{roomId}</span>
                <Copy size={14} className="opacity-70 group-hover:opacity-100" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-950/50 px-4 py-2 rounded-xl">
            <Users size={18} className="text-emerald-400" />
            <span className="text-amber-100 font-medium">
              {playerCount} / {maxPlayers}
            </span>
          </div>

          <button
            onClick={onLeave}
            className="flex items-center gap-2 bg-red-900/80 hover:bg-red-800 text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <LogOut size={18} />
            <span>离开房间</span>
          </button>
        </div>
      </div>
    </div>
  );
}
