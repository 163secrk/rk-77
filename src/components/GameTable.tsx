import { Player } from '../types';
import { useUserStore } from '../store/useUserStore';
import { useRoomStore } from '../store/useRoomStore';

interface GameTableProps {
  players: Player[];
  onToggleReady: (isReady: boolean) => void;
}

const SEAT_POSITIONS = [
  { top: '5%', left: '50%', transform: 'translateX(-50%)' },
  { top: '50%', left: '95%', transform: 'translate(-50%, -50%)' },
  { top: '95%', left: '50%', transform: 'translateX(-50%)' },
  { top: '50%', left: '5%', transform: 'translate(-50%, -50%)' },
];

export function GameTable({ players, onToggleReady }: GameTableProps) {
  const { playerId, isReady } = useUserStore();
  const { ownerId } = useRoomStore();
  const currentPlayer = players.find((p) => p.id === playerId);
  const isOwner = playerId === ownerId;

  const getPlayerAtSeat = (seatNumber: number): Player | undefined => {
    return players.find((p) => p.seatNumber === seatNumber);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-950/50 backdrop-blur rounded-3xl border border-emerald-600/30 h-full flex flex-col">
      <div className="flex-1 relative p-8">
        <div
          className="absolute inset-8 rounded-full bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 shadow-2xl border-8 border-emerald-900"
          style={{
            boxShadow: '0 0 60px rgba(16, 185, 129, 0.2), inset 0 0 60px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="absolute inset-4 rounded-full border-4 border-emerald-500/30" />
          <div className="absolute inset-10 rounded-full border-2 border-amber-500/20" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2 opacity-60">🀄</div>
              <div className="text-amber-200/70 text-sm font-medium">
                {isOwner ? '等待玩家准备' : '等待房主开始游戏'}
              </div>
              <div className="text-emerald-300/50 text-xs mt-1">
                {players.filter((p) => p.isReady).length} / {players.length} 已准备
              </div>
            </div>
          </div>
        </div>

        {[1, 2, 3, 4].map((seatNumber) => {
          const player = getPlayerAtSeat(seatNumber);
          const position = SEAT_POSITIONS[seatNumber - 1];
          const isCurrentPlayer = player?.id === playerId;
          const isPlayerOwner = player?.id === ownerId;

          return (
            <div
              key={seatNumber}
              className="absolute w-28 h-28 flex items-center justify-center"
              style={position}
            >
              {player ? (
                <div
                  className={`relative transition-all duration-300 ${isCurrentPlayer ? 'scale-110' : ''}`}
                >
                  <div
                    className={`text-4xl p-3 rounded-2xl shadow-xl transition-all duration-300
                      ${player.isReady
                        ? 'bg-gradient-to-br from-green-500 to-green-700 ring-4 ring-green-400'
                        : 'bg-gradient-to-br from-emerald-700 to-emerald-900 ring-4 ring-emerald-600/50'
                      }`}
                  >
                    {player.avatar}
                  </div>

                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      {isPlayerOwner && (
                        <span className="text-amber-400 text-xs">👑</span>
                      )}
                      <span
                        className={`text-sm font-medium ${isCurrentPlayer ? 'text-amber-300' : 'text-emerald-200'}`}
                      >
                        {player.nickname}
                      </span>
                      {isCurrentPlayer && (
                        <span className="text-xs text-amber-400">(你)</span>
                      )}
                    </div>
                    <div className="text-xs text-emerald-400 mt-0.5">
                      {player.isReady ? '✅ 已准备' : '⏳ 未准备'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl p-3 rounded-2xl bg-emerald-900/50 border-2 border-dashed border-emerald-700/50 opacity-50">
                    ❓
                  </div>
                  <div className="text-xs text-emerald-500 mt-1">空位</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentPlayer && (
        <div className="p-4 border-t border-emerald-700/30">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => onToggleReady(!isReady)}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg
                ${isReady
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400'
                  : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400'
                }`}
            >
              {isReady ? '取消准备' : '准备游戏'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
