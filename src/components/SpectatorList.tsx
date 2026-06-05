import { Eye } from 'lucide-react';
import { Spectator } from '../types';
import { useUserStore } from '../store/useUserStore';

interface SpectatorListProps {
  spectators: Spectator[];
}

export function SpectatorList({ spectators }: SpectatorListProps) {
  const { spectatorId } = useUserStore();

  return (
    <div className="bg-emerald-950/80 backdrop-blur rounded-2xl p-4 border border-emerald-700/50 h-full flex flex-col">
      <h2 className="text-lg font-bold text-amber-200 mb-3 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        <Eye size={18} className="text-amber-400" />
        <span>观战列表</span>
        <span className="ml-auto text-xs text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded-full">
          {spectators.length}
        </span>
      </h2>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {spectators.length === 0 ? (
          <div className="text-center text-emerald-400 py-4 text-sm">
            暂无观战者
          </div>
        ) : (
          spectators.map((spectator) => {
            const isSelf = spectator.id === spectatorId;

            return (
              <div
                key={spectator.id}
                className={`flex items-center gap-2 p-2 rounded-xl transition-all
                  ${isSelf
                    ? 'bg-amber-900/40 border border-amber-500/30'
                    : 'bg-emerald-900/30 border border-emerald-700/20'
                  }`}
              >
                <div className="text-xl flex-shrink-0 w-7 h-7 rounded-full bg-emerald-800/50 flex items-center justify-center">
                  {spectator.avatar}
                </div>
                <span className={`text-sm truncate flex-1 min-w-0 ${isSelf ? 'text-amber-200' : 'text-emerald-200'}`}>
                  {spectator.nickname}
                  {isSelf && <span className="text-xs text-amber-400 ml-1">(你)</span>}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
