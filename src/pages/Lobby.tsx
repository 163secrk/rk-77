import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, LogIn, Sparkles, Clock, Users, Trophy, Settings } from 'lucide-react';
import { AvatarSelect } from '../components/AvatarSelect';
import { useUserStore } from '../store/useUserStore';
import { useRoom } from '../hooks/useRoom';
import { checkRoomExists } from '../utils/socket';
import { GameRules } from '../types';

const DEFAULT_RULES: GameRules = {
  thinkTime: 30,
  initialScore: 100,
  maxPlayers: 4,
};

export default function Lobby() {
  const navigate = useNavigate();
  const { nickname, avatar, setNickname, setAvatar } = useUserStore();
  const { createRoom, joinRoom } = useRoom();

  const [joinRoomId, setJoinRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [gameRules, setGameRules] = useState<GameRules>(DEFAULT_RULES);
  const [showRules, setShowRules] = useState(false);

  const handleCreateRoom = (e: FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert('请输入昵称');
      return;
    }
    createRoom({
      nickname: nickname.trim(),
      avatar,
      gameRules,
    });
  };

  const handleJoinRoom = async (e: FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert('请输入昵称');
      return;
    }
    if (!joinRoomId.trim()) {
      setJoinError('请输入房间ID');
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      const result = await checkRoomExists(joinRoomId);
      if (!result.exists) {
        setJoinError('房间不存在');
        setIsJoining(false);
        return;
      }
      if (result.roomInfo?.isFull) {
        setJoinError('房间已满');
        setIsJoining(false);
        return;
      }

      joinRoom({
        roomId: joinRoomId.trim().toUpperCase(),
        nickname: nickname.trim(),
        avatar,
      });
    } catch (error) {
      setJoinError('检查房间失败，请稍后重试');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-block mb-4">
              <span className="text-6xl">🀄</span>
            </div>
            <h1
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              在线棋牌房间
            </h1>
            <p className="text-emerald-300 text-lg">
              创建私密房间，邀请好友，开启您的棋牌之旅
            </p>
          </div>

          <div className="bg-emerald-950/60 backdrop-blur-xl rounded-3xl p-8 border border-emerald-700/50 shadow-2xl">
            <div className="mb-8">
              <label className="block text-amber-200 font-medium mb-3">
                选择头像
              </label>
              <AvatarSelect selected={avatar} onChange={setAvatar} />
            </div>

            <div className="mb-8">
              <label className="block text-amber-200 font-medium mb-3">
                您的昵称
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入您的昵称"
                maxLength={20}
                className="w-full bg-emerald-900/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-emerald-100 placeholder-emerald-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30 transition-all text-lg"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <form onSubmit={handleCreateRoom} className="group">
                <div className="bg-gradient-to-br from-emerald-800/40 to-emerald-900/40 rounded-2xl p-6 border border-emerald-600/30 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <PlusCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                        创建房间
                      </h3>
                      <p className="text-emerald-400 text-sm">创建一个新的私密房间</p>
                    </div>
                  </div>

                  <div className="flex-1 mb-6">
                    <div className="flex items-center gap-2 text-emerald-300 text-sm">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>自动生成6位房间ID</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowRules(!showRules)}
                      className="flex items-center gap-2 text-amber-400 text-sm mt-3 hover:text-amber-300 transition-colors"
                    >
                      <Settings size={14} />
                      <span>{showRules ? '收起规则设置' : '自定义游戏规则'}</span>
                    </button>

                    {showRules && (
                      <div className="mt-4 space-y-4 bg-emerald-950/50 rounded-xl p-4 border border-emerald-700/30">
                        <div>
                          <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                            <Clock size={14} />
                            <span>每局思考时间（秒）</span>
                          </label>
                          <select
                            value={gameRules.thinkTime}
                            onChange={(e) => setGameRules({ ...gameRules, thinkTime: Number(e.target.value) })}
                            className="w-full bg-emerald-900/50 border border-emerald-700/50 rounded-lg px-3 py-2 text-emerald-100 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30 transition-all"
                          >
                            <option value={15}>15秒</option>
                            <option value={30}>30秒</option>
                            <option value={60}>60秒</option>
                            <option value={120}>120秒</option>
                            <option value={300}>不限时</option>
                          </select>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                            <Trophy size={14} />
                            <span>初始底分</span>
                          </label>
                          <select
                            value={gameRules.initialScore}
                            onChange={(e) => setGameRules({ ...gameRules, initialScore: Number(e.target.value) })}
                            className="w-full bg-emerald-900/50 border border-emerald-700/50 rounded-lg px-3 py-2 text-emerald-100 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30 transition-all"
                          >
                            <option value={50}>50分</option>
                            <option value={100}>100分</option>
                            <option value={200}>200分</option>
                            <option value={500}>500分</option>
                            <option value={1000}>1000分</option>
                          </select>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                            <Users size={14} />
                            <span>最大人数</span>
                          </label>
                          <select
                            value={gameRules.maxPlayers}
                            onChange={(e) => setGameRules({ ...gameRules, maxPlayers: Number(e.target.value) })}
                            className="w-full bg-emerald-900/50 border border-emerald-700/50 rounded-lg px-3 py-2 text-emerald-100 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30 transition-all"
                          >
                            <option value={2}>2人</option>
                            <option value={3}>3人</option>
                            <option value={4}>4人</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!nickname.trim()}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-lg flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={20} />
                    创建房间
                  </button>
                </div>
              </form>

              <form onSubmit={handleJoinRoom} className="group">
                <div className="bg-gradient-to-br from-emerald-800/40 to-emerald-900/40 rounded-2xl p-6 border border-emerald-600/30 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <LogIn size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                        加入房间
                      </h3>
                      <p className="text-emerald-400 text-sm">输入房间ID加入好友的房间</p>
                    </div>
                  </div>

                  <div className="flex-1 mb-6">
                    <label className="block text-emerald-300 text-sm mb-2">
                      房间ID
                    </label>
                    <input
                      type="text"
                      value={joinRoomId}
                      onChange={(e) => {
                        setJoinRoomId(e.target.value.toUpperCase());
                        setJoinError('');
                      }}
                      placeholder="请输入6位房间ID"
                      maxLength={6}
                      className="w-full bg-emerald-900/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-emerald-100 placeholder-emerald-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono text-xl tracking-widest text-center uppercase"
                    />
                    {joinError && (
                      <p className="text-red-400 text-sm mt-2 text-center">{joinError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!nickname.trim() || isJoining}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-lg flex items-center justify-center gap-2"
                  >
                    <LogIn size={20} />
                    {isJoining ? '检查中...' : '加入房间'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="text-center mt-8 text-emerald-500 text-sm">
            <p>温馨提示：请妥善保管您的房间ID，不要分享给陌生人</p>
          </div>
        </div>
      </div>
    </div>
  );
}
