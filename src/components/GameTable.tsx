import { Player, GameRules } from '../types';
import { useUserStore } from '../store/useUserStore';
import { useRoomStore } from '../store/useRoomStore';
import { Play, Clock, Trophy, Users } from 'lucide-react';

interface GameTableProps {
  players: Player[];
  gameRules: GameRules;
  gameStatus: 'waiting' | 'playing' | 'finished';
  currentRound: number;
  onToggleReady: (isReady: boolean) => void;
  onStartGame?: () => void;
}

const SEAT_POSITIONS = [
  { top: '5%', left: '50%', transform: 'translateX(-50%)' },
  { top: '50%', left: '95%', transform: 'translate(-50%, -50%)' },
  { top: '95%', left: '50%', transform: 'translateX(-50%)' },
  { top: '50%', left: '5%', transform: 'translate(-50%, -50%)' },
];

export function GameTable({ players, gameRules, gameStatus, currentRound, onToggleReady, onStartGame }: GameTableProps) {
  const { playerId, isReady } = useUserStore();
  const { ownerId } = useRoomStore();
  const currentPlayer = players.find((p) => p.id === playerId);
  const isOwner = playerId === ownerId;

  const readyPlayers = players.filter((p) => p.isReady).length;
  const totalPlayers = players.length;
  const canStart = readyPlayers >= 2 && readyPlayers === totalPlayers && totalPlayers >= 2;

  const getPlayerAtSeat = (seatNumber: number): Player | undefined => {
    return players.find((p) => p.seatNumber === seatNumber);
  };

  const getStatusText = () => {
    if (gameStatus === 'playing') {
      return `第 ${currentRound} 局进行中`;
    }
    if (canStart) {
      return isOwner ? '全部准备就绪，点击开始' : '全部准备就绪，即将开始';
    }
    return isOwner ? '等待玩家准备' : '等待房主开始游戏';
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-950/50 backdrop-blur rounded-3xl border border-emerald-600/30 h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-emerald-700/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-300 text-sm">
            <Clock size={14} className="text-amber-400" />
            <span>思考时间: {gameRules.thinkTime === 300 ? '不限时' : `${gameRules.thinkTime}秒`}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300 text-sm">
            <Trophy size={14} className="text-amber-400" />
            <span>底分: {gameRules.initialScore}分</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300 text-sm">
            <Users size={14} className="text-amber-400" />
            <span>上限: {gameRules.maxPlayers}人</span>
          </div>
        </div>
        {gameStatus === 'playing' && (
          <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-medium">游戏中</span>
          </div>
        )}
      </div>

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
              <div className={`text-sm font-medium ${canStart ? 'text-green-400' : 'text-amber-200/70'}`}>
                {getStatusText()}
              </div>
              <div className={`text-xs mt-1 ${canStart ? 'text-green-400/70' : 'text-emerald-300/50'}`}>
                {readyPlayers} / {totalPlayers} 已准备
              </div>
              {canStart && gameStatus === 'waiting' && (
                <div className="mt-2 text-xs text-amber-400 animate-pulse">
                  ⚡ 1.5秒后自动开始
                </div>
              )}
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

                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
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
                    <div className="flex items-center justify-center gap-2 mt-0.5">
                      <span className="text-xs text-emerald-400">
                        {player.isReady ? '✅ 已准备' : '⏳ 未准备'}
                      </span>
                      <span className="text-xs text-amber-300 font-bold">
                        {player.score}分
                      </span>
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
          <div className="max-w-md mx-auto flex gap-3">
            {gameStatus === 'waiting' && (
              <>
                <button
                  onClick={() => onToggleReady(!isReady)}
                  disabled={gameStatus !== 'waiting'}
                  className={`flex-1 py-3 rounded-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                    ${isReady
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400'
                      : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400'
                    }`}
                >
                  {isReady ? '取消准备' : '准备游戏'}
                </button>
                {isOwner && canStart && (
                  <button
                    onClick={onStartGame}
                    className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center gap-2"
                  >
                    <Play size={18} />
                    开始
                  </button>
                )}
              </>
            )}
            {gameStatus === 'playing' && (
              <div className="w-full text-center py-3">
                <span className="text-emerald-300">🎮 游戏进行中，请遵守规则</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
