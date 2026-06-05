import { Trophy, TrendingUp, TrendingDown, Minus, Clock, RotateCcw } from 'lucide-react';
import { Player, ScoreUpdate } from '../types';
import { useRoomStore } from '../store/useRoomStore';
import { useUserStore } from '../store/useUserStore';

interface ScorePanelProps {
  players: Player[];
  scoreHistory: ScoreUpdate[];
  currentRound: number;
  gameStatus: 'waiting' | 'playing' | 'finished';
  onUpdateScore?: (updates: Array<{ playerId: string; scoreChange: number }>) => void;
  onResetScores?: () => void;
}

export function ScorePanel({ players, scoreHistory, currentRound, gameStatus, onUpdateScore, onResetScores }: ScorePanelProps) {
  const { playerId } = useUserStore();
  const { ownerId } = useRoomStore();
  const isOwner = playerId === ownerId;

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getScoreChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={14} className="text-green-400" />;
    if (change < 0) return <TrendingDown size={14} className="text-red-400" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const getScoreChangeClass = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const handleQuickScore = (playerId: string, amount: number) => {
    if (onUpdateScore && isOwner && gameStatus === 'playing') {
      onUpdateScore([{ playerId, scoreChange: amount }]);
    }
  };

  return (
    <div className="bg-emerald-950/80 backdrop-blur rounded-2xl border border-emerald-700/50 h-full flex flex-col">
      <div className="p-4 border-b border-emerald-700/30">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-amber-200 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Trophy size={20} className="text-amber-400" />
            <span>比分面板</span>
          </h2>
          {currentRound > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full">
              <Clock size={14} className="text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">第 {currentRound} 局</span>
            </div>
          )}
        </div>
        {gameStatus === 'playing' && (
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm">游戏进行中</span>
          </div>
        )}
        {gameStatus === 'waiting' && (
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full" />
            <span className="text-amber-400 text-sm">等待玩家准备</span>
          </div>
        )}
      </div>

      <div className="p-4 border-b border-emerald-700/30">
        <h3 className="text-sm font-medium text-emerald-300 mb-3 flex items-center gap-2">
          <Trophy size={14} className="text-amber-400" />
          玩家排名
        </h3>
        <div className="space-y-2">
          {sortedPlayers.length === 0 ? (
            <div className="text-center text-emerald-500 py-4 text-sm">
              暂无玩家
            </div>
          ) : (
            sortedPlayers.map((player, index) => {
              const isCurrentPlayer = player.id === playerId;
              const rankColors = ['text-amber-400', 'text-gray-300', 'text-amber-700', 'text-emerald-400'];
              const rankBgColors = ['bg-amber-500/20', 'bg-gray-500/20', 'bg-amber-700/20', 'bg-emerald-500/20'];

              return (
                <div
                  key={player.id}
                  className={`relative p-3 rounded-xl transition-all duration-300
                    ${isCurrentPlayer
                      ? 'bg-gradient-to-r from-amber-900/60 to-amber-800/40 border border-amber-500/50'
                      : 'bg-emerald-900/50 border border-emerald-700/30 hover:border-emerald-600/50'
                    }`}
                >
                  <div className="absolute -left-2 -top-2">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${rankBgColors[index] || 'bg-emerald-500/20'} ${rankColors[index] || 'text-emerald-400'}`}>
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 ml-2">
                    <div className="text-2xl">{player.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${isCurrentPlayer ? 'text-amber-200' : 'text-emerald-100'}`}>
                          {player.nickname}
                          {isCurrentPlayer && <span className="text-xs text-amber-400 ml-1">(你)</span>}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-400">
                        座位 {player.seatNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${player.score >= 100 ? 'text-amber-300' : player.score < 0 ? 'text-red-400' : 'text-emerald-200'}`}>
                        {player.score}
                      </div>
                      <div className="text-xs text-emerald-500">分</div>
                    </div>
                  </div>

                  {isOwner && gameStatus === 'playing' && (
                    <div className="mt-2 pt-2 border-t border-emerald-700/30 flex gap-2">
                      <button
                        onClick={() => handleQuickScore(player.id, 10)}
                        className="flex-1 py-1.5 text-xs font-medium bg-green-600/30 hover:bg-green-600/50 text-green-300 rounded-lg transition-colors"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleQuickScore(player.id, -10)}
                        className="flex-1 py-1.5 text-xs font-medium bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg transition-colors"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => handleQuickScore(player.id, 50)}
                        className="flex-1 py-1.5 text-xs font-medium bg-green-600/50 hover:bg-green-600/70 text-green-200 rounded-lg transition-colors"
                      >
                        +50
                      </button>
                      <button
                        onClick={() => handleQuickScore(player.id, -50)}
                        className="flex-1 py-1.5 text-xs font-medium bg-red-600/50 hover:bg-red-600/70 text-red-200 rounded-lg transition-colors"
                      >
                        -50
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {isOwner && gameStatus === 'playing' && onResetScores && (
          <button
            onClick={onResetScores}
            className="mt-4 w-full py-2 text-xs font-medium bg-emerald-800/50 hover:bg-emerald-700/50 text-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            重置本局分数
          </button>
        )}
      </div>

      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        <h3 className="text-sm font-medium text-emerald-300 mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-400" />
          比分变动记录
        </h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {scoreHistory.length === 0 ? (
            <div className="text-center text-emerald-500 py-8 text-sm">
              暂无比分变动
            </div>
          ) : (
            [...scoreHistory].reverse().map((update, index) => (
              <div
                key={`${update.timestamp}-${index}`}
                className="p-2 bg-emerald-900/30 rounded-lg border border-emerald-700/20"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{update.avatar}</span>
                  <span className="text-emerald-200 text-sm font-medium flex-1 truncate">
                    {update.nickname}
                  </span>
                  {getScoreChangeIcon(update.scoreChange)}
                  <span className={`text-sm font-bold ${getScoreChangeClass(update.scoreChange)}`}>
                    {update.scoreChange > 0 ? '+' : ''}{update.scoreChange}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 ml-7">
                  <span className="text-xs text-emerald-500">
                    新分数: <span className="text-emerald-300">{update.newScore}</span>
                  </span>
                  <span className="text-xs text-emerald-600">
                    {formatTime(update.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
