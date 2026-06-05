import { Crown, CheckCircle, XCircle, UserMinus } from 'lucide-react';
import { Player } from '../types';
import { useUserStore } from '../store/useUserStore';
import { useRoomStore } from '../store/useRoomStore';

interface PlayerListProps {
  players: Player[];
  onKick?: (playerId: string) => void;
}

export function PlayerList({ players, onKick }: PlayerListProps) {
  const { playerId } = useUserStore();
  const { ownerId } = useRoomStore();
  const isOwner = playerId === ownerId;

  return (
    <div className="bg-emerald-950/80 backdrop-blur rounded-2xl p-4 border border-emerald-700/50 h-full flex flex-col">
      <h2 className="text-lg font-bold text-amber-200 mb-4 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        <span>👥</span>
        <span>玩家列表</span>
      </h2>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {players.length === 0 ? (
          <div className="text-center text-emerald-400 py-8 text-sm">
            等待玩家加入...
          </div>
        ) : (
          players.map((player) => {
            const isSelf = player.id === playerId;
            const isPlayerOwner = player.id === ownerId;

            return (
              <div
                key={player.id}
                className={`relative p-3 rounded-xl transition-all duration-300
                  ${isSelf
                    ? 'bg-gradient-to-r from-amber-900/60 to-amber-800/40 border border-amber-500/50'
                    : 'bg-emerald-900/50 border border-emerald-700/30 hover:border-emerald-600/50'
                  }`}
              >
                {isPlayerOwner && (
                  <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-1 shadow-lg">
                    <Crown size={12} className="text-amber-900" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`text-3xl p-1 rounded-full
                    ${player.isReady ? 'bg-green-500/30 ring-2 ring-green-400' : 'bg-emerald-800/50'}`}>
                    {player.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium truncate ${isSelf ? 'text-amber-200' : 'text-emerald-100'}`}>
                        {player.nickname}
                        {isSelf && <span className="text-xs text-amber-400 ml-1">(你)</span>}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-emerald-400">
                        座位 {player.seatNumber}
                      </span>
                      {player.isReady ? (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle size={12} />
                          已准备
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-400">
                          <XCircle size={12} />
                          未准备
                        </span>
                      )}
                    </div>
                  </div>

                  {isOwner && !isSelf && onKick && (
                    <button
                      onClick={() => onKick(player.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded-lg transition-colors"
                      title="踢出房间"
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
