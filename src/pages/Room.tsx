import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Users, Gamepad2 } from 'lucide-react';
import { RoomHeader } from '../components/RoomHeader';
import { PlayerList } from '../components/PlayerList';
import { GameTable } from '../components/GameTable';
import { ChatPanel } from '../components/ChatPanel';
import { ScorePanel } from '../components/ScorePanel';
import { RoomRulesSettings } from '../components/RoomRulesSettings';
import { DanmakuOverlay } from '../components/DanmakuOverlay';
import { SpectatorList } from '../components/SpectatorList';
import { useRoom } from '../hooks/useRoom';
import { useUserStore } from '../store/useUserStore';
import { useRoomStore } from '../store/useRoomStore';
import { checkRoomForSpectator } from '../utils/socket';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { nickname, avatar, role: userRole } = useUserStore();
  const {
    roomId: storeRoomId,
    roomName,
    players,
    spectators,
    messages,
    danmakuList,
    isConnected,
    isKicked,
    isLeaving,
    gameRules,
    gameStatus,
    scoreHistory,
    currentRound,
    role: roomRole,
  } = useRoomStore();
  const {
    gameRules: roomGameRules,
    gameStatus: roomGameStatus,
    currentRound: roomCurrentRound,
    role: hookRole,
    joinRoom,
    joinSpectator,
    leaveRoom,
    sendMessage,
    sendDanmaku,
    toggleReady,
    kickPlayer,
    updateRoomRules,
    startGame,
    updateScore,
  } = useRoom();

  const [isChecking, setIsChecking] = useState(true);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [showJoinChoice, setShowJoinChoice] = useState(false);
  const [roomInfo, setRoomInfo] = useState<{ isFull?: boolean; canSpectate?: boolean }>({});

  const currentRole = hookRole || roomRole || userRole;
  const isSpectator = currentRole === 'spectator';
  const isPlayer = currentRole === 'player';

  useEffect(() => {
    const checkRoom = async () => {
      if (!roomId) {
        navigate('/');
        return;
      }

      try {
        const result = await checkRoomForSpectator(roomId);
        if (!result.exists) {
          setRoomNotFound(true);
          setIsChecking(false);
          return;
        }

        setRoomInfo({
          isFull: result.roomInfo?.isFull,
          canSpectate: result.canSpectate,
        });

        if (!isConnected && !storeRoomId && !isKicked && !isLeaving) {
          if (!nickname || !avatar) {
            navigate('/');
            return;
          }

          if (result.roomInfo?.isFull && result.canSpectate) {
            setShowJoinChoice(true);
            setIsChecking(false);
            return;
          }

          joinRoom({
            roomId: roomId.toUpperCase(),
            nickname,
            avatar,
          });
        }

        setIsChecking(false);
      } catch {
        setRoomNotFound(true);
        setIsChecking(false);
      }
    };

    checkRoom();
  }, [roomId, navigate, nickname, avatar, isConnected, storeRoomId, isKicked, isLeaving, joinRoom]);

  const handleJoinAsPlayer = () => {
    if (roomId) {
      joinRoom({
        roomId: roomId.toUpperCase(),
        nickname,
        avatar,
      });
    }
    setShowJoinChoice(false);
  };

  const handleJoinAsSpectator = () => {
    if (roomId) {
      joinSpectator({
        roomId: roomId.toUpperCase(),
        nickname,
        avatar,
      });
    }
    setShowJoinChoice(false);
  };

  if (isChecking && !showJoinChoice) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🀄</div>
          <p className="text-emerald-300 text-lg">正在进入房间...</p>
        </div>
      </div>
    );
  }

  if (showJoinChoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex items-center justify-center p-6">
        <div className="bg-emerald-950/80 backdrop-blur-xl rounded-3xl p-8 border border-emerald-700/50 shadow-2xl max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👀</div>
            <h2 className="text-2xl font-bold text-amber-200 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              房间已满
            </h2>
            <p className="text-emerald-400">
              该房间玩家席位已满，您可以选择观战模式进入
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleJoinAsSpectator}
              className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-3"
            >
              <Eye size={24} />
              <div className="text-left">
                <div className="text-lg">进入观战</div>
                <div className="text-xs text-emerald-200 opacity-80">观看比赛，发送仅观战可见的弹幕</div>
              </div>
            </button>

            <button
              onClick={handleJoinAsPlayer}
              disabled={roomInfo.isFull}
              className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-3"
            >
              <Gamepad2 size={24} />
              <div className="text-left">
                <div className="text-lg">尝试加入游戏</div>
                <div className="text-xs text-amber-200 opacity-80">
                  {roomInfo.isFull ? '当前无可用席位' : '加入玩家席位参与游戏'}
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-emerald-900/50 hover:bg-emerald-800/50 text-emerald-300 font-medium py-3 rounded-xl transition-all duration-200 border border-emerald-700/30"
            >
              返回大厅
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (roomNotFound) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-amber-200 mb-2">房间不存在</h2>
          <p className="text-emerald-400 mb-6">该房间可能已解散或ID不正确</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl transition-all"
          >
            返回大厅
          </button>
        </div>
      </div>
    );
  }

  const currentRoomId = storeRoomId || roomId || '';
  const currentGameRules = roomGameRules || gameRules;
  const currentGameStatus = roomGameStatus || gameStatus;
  const currentGameRound = roomCurrentRound || currentRound;

  const handleResetScores = () => {
    if (isPlayer && confirm('确定要重置本局所有玩家的分数吗？')) {
      const resetUpdates = players.map((p) => ({
        playerId: p.id,
        scoreChange: currentGameRules.initialScore - p.score,
      }));
      updateScore(resetUpdates);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col relative">
      {isSpectator && (
        <div className="absolute top-0 left-0 right-0 bg-amber-900/90 backdrop-blur-sm z-30 py-2 px-6 text-center border-b border-amber-600/30">
          <div className="flex items-center justify-center gap-2 text-amber-100 text-sm">
            <Eye size={16} className="text-amber-300" />
            <span>您正在以观战模式观看比赛</span>
            <span className="text-amber-300">|</span>
            <Users size={16} className="text-amber-300" />
            <span>{spectators.length} 人观战中</span>
          </div>
        </div>
      )}

      <DanmakuOverlay
        danmakuList={danmakuList}
        onSendDanmaku={sendDanmaku}
        isSpectator={isSpectator}
      />

      <div className={`bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 px-6 py-4 shadow-xl border-b border-amber-500/30 ${isSpectator ? 'pt-12' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold text-amber-100 tracking-wide flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                {roomName || `${currentRoomId} 号房间`}
                {isSpectator && (
                  <span className="text-xs bg-amber-600/80 text-white px-3 py-1 rounded-full font-normal">
                    观战模式
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <RoomHeader
                  roomId={currentRoomId}
                  roomName=""
                  playerCount={players.length}
                  maxPlayers={currentGameRules.maxPlayers}
                  onLeave={leaveRoom}
                  hideTitle={true}
                />
                <div className="flex items-center gap-2 text-emerald-300 text-sm">
                  <span className="text-amber-400">⏱️</span>
                  <span>思考时间: {currentGameRules.thinkTime === 300 ? '不限时' : `${currentGameRules.thinkTime}秒`}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300 text-sm">
                  <span className="text-amber-400">🏆</span>
                  <span>底分: {currentGameRules.initialScore}分</span>
                </div>
                {spectators.length > 0 && (
                  <div className="flex items-center gap-2 text-emerald-300 text-sm">
                    <span className="text-amber-400">👀</span>
                    <span>{spectators.length} 人观战</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isPlayer && <RoomRulesSettings onUpdateRules={updateRoomRules} />}
            <button
              onClick={leaveRoom}
              className="flex items-center gap-2 bg-red-900/80 hover:bg-red-800 text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span>{isSpectator ? '退出观战' : '离开房间'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-12 gap-6">
          <div className="col-span-3 h-full min-h-0 flex flex-col gap-4">
            <div className="flex-1 min-h-0 overflow-hidden">
              <PlayerList players={players} onKick={isPlayer ? kickPlayer : undefined} />
            </div>
            {spectators.length > 0 && (
              <div className="h-48 min-h-[192px]">
                <SpectatorList spectators={spectators} />
              </div>
            )}
          </div>

          <div className="col-span-6 h-full min-h-0">
            <GameTable
              players={players}
              gameRules={currentGameRules}
              gameStatus={currentGameStatus}
              currentRound={currentGameRound}
              onToggleReady={isPlayer ? toggleReady : undefined}
              onStartGame={isPlayer ? startGame : undefined}
              isSpectator={isSpectator}
            />
          </div>

          <div className="col-span-3 h-full min-h-0 flex flex-col gap-4">
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScorePanel
                players={players}
                scoreHistory={scoreHistory}
                currentRound={currentGameRound}
                gameStatus={currentGameStatus}
                onUpdateScore={isPlayer ? updateScore : undefined}
                onResetScores={isPlayer ? handleResetScores : undefined}
                isSpectator={isSpectator}
              />
            </div>
            <div className="h-80 min-h-[320px]">
              <ChatPanel
                messages={messages}
                onSendMessage={isPlayer ? sendMessage : undefined}
                isSpectator={isSpectator}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
