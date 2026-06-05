import { useState } from 'react';
import { Settings, Clock, Users, Trophy, X, Save } from 'lucide-react';
import { GameRules } from '../types';
import { useRoomStore } from '../store/useRoomStore';
import { useUserStore } from '../store/useUserStore';

interface RoomRulesSettingsProps {
  onUpdateRules: (rules: Partial<GameRules>) => void;
  disabled?: boolean;
}

export function RoomRulesSettings({ onUpdateRules, disabled }: RoomRulesSettingsProps) {
  const { gameRules, gameStatus } = useRoomStore();
  const { playerId } = useUserStore();
  const { ownerId } = useRoomStore();
  const isOwner = playerId === ownerId;

  const [isOpen, setIsOpen] = useState(false);
  const [localRules, setLocalRules] = useState<GameRules>(gameRules);

  const canEdit = isOwner && gameStatus === 'waiting' && !disabled;

  const handleOpen = () => {
    setLocalRules(gameRules);
    setIsOpen(true);
  };

  const handleSave = () => {
    const changes: Partial<GameRules> = {};
    if (localRules.thinkTime !== gameRules.thinkTime) {
      changes.thinkTime = localRules.thinkTime;
    }
    if (localRules.initialScore !== gameRules.initialScore) {
      changes.initialScore = localRules.initialScore;
    }
    if (localRules.maxPlayers !== gameRules.maxPlayers) {
      changes.maxPlayers = localRules.maxPlayers;
    }

    if (Object.keys(changes).length > 0) {
      onUpdateRules(changes);
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={!isOwner || gameStatus !== 'waiting'}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200
          ${canEdit
            ? 'bg-emerald-700/50 hover:bg-emerald-600/50 text-emerald-100 hover:scale-105'
            : 'bg-emerald-900/30 text-emerald-500 cursor-not-allowed'
          }`}
        title={canEdit ? '设置游戏规则' : '仅房主可在等待状态修改规则'}
      >
        <Settings size={18} />
        <span className="text-sm font-medium">规则设置</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-3xl p-6 max-w-md w-full border border-emerald-600/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-amber-200 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Settings size={24} />
                游戏规则设置
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-800/50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                  <Clock size={16} className="text-amber-400" />
                  <span>每局思考时间（秒）</span>
                </label>
                <select
                  value={localRules.thinkTime}
                  onChange={(e) => setLocalRules({ ...localRules, thinkTime: Number(e.target.value) })}
                  disabled={!canEdit}
                  className="w-full bg-emerald-800/50 border border-emerald-600/50 rounded-xl px-4 py-3 text-emerald-100 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={15}>15秒 - 快速模式</option>
                  <option value={30}>30秒 - 标准模式</option>
                  <option value={60}>60秒 - 休闲模式</option>
                  <option value={120}>120秒 - 深思模式</option>
                  <option value={300}>不限时</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                  <Trophy size={16} className="text-amber-400" />
                  <span>初始底分</span>
                </label>
                <select
                  value={localRules.initialScore}
                  onChange={(e) => setLocalRules({ ...localRules, initialScore: Number(e.target.value) })}
                  disabled={!canEdit}
                  className="w-full bg-emerald-800/50 border border-emerald-600/50 rounded-xl px-4 py-3 text-emerald-100 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={50}>50分 - 快速赛</option>
                  <option value={100}>100分 - 标准赛</option>
                  <option value={200}>200分 - 中赛</option>
                  <option value={500}>500分 - 长赛</option>
                  <option value={1000}>1000分 - 马拉松</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                  <Users size={16} className="text-amber-400" />
                  <span>最大人数</span>
                </label>
                <select
                  value={localRules.maxPlayers}
                  onChange={(e) => setLocalRules({ ...localRules, maxPlayers: Number(e.target.value) })}
                  disabled={!canEdit}
                  className="w-full bg-emerald-800/50 border border-emerald-600/50 rounded-xl px-4 py-3 text-emerald-100 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={2}>2人对战</option>
                  <option value={3}>3人对战</option>
                  <option value={4}>4人对战</option>
                </select>
              </div>
            </div>

            <div className="mt-6 bg-emerald-950/50 rounded-xl p-4 border border-emerald-700/30">
              <p className="text-emerald-300 text-sm">
                <span className="text-amber-400 font-medium">当前设置：</span>
                思考时间 {gameRules.thinkTime === 300 ? '不限时' : `${gameRules.thinkTime}秒`}
                {' · '}
                初始底分 {gameRules.initialScore}分
                {' · '}
                最多 {gameRules.maxPlayers}人
              </p>
              {gameStatus !== 'waiting' && (
                <p className="text-amber-400 text-xs mt-2">
                  ⚠️ 游戏进行中无法修改规则
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 rounded-xl font-medium text-emerald-200 bg-emerald-800/50 hover:bg-emerald-700/50 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!canEdit}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} />
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
