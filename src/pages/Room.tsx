import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomHeader } from '../components/RoomHeader';
import { PlayerList } from '../components/PlayerList';
import { GameTable } from '../components/GameTable';
import { ChatPanel } from '../components/ChatPanel';
import { ScorePanel } from '../components/ScorePanel';
import { RoomRulesSettings } from '../components/RoomRulesSettings';
import { useRoom } from '../hooks/useRoom';
import { useUserStore } from '../store/useUserStore';
import { useRoomStore } from '../store/useRoomStore';
import { checkRoomExists } from '../utils/socket';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { nickname, avatar } = useUserStore();
  const { roomId: storeRoomId, roomName, players, messages, isConnected, isKicked, isLeaving, gameRules, gameStatus, scoreHistory, currentRound } = useRoomStore();
  const {
    players: roomPlayers,
    gameRules: roomGameRules,
    gameStatus: roomGameStatus,
    currentRound: roomCurrentRound,
    joinRoom,
    leaveRoom,
    sendMessage,
    toggleReady,
    kickPlayer,
    updateRoomRules,
    startGame,
    updateScore,
  } = useRoom();

  const [isChecking, setIsChecking] = useState(true);
  const [roomNotFound, setRoomNotFound] = useState(false);

  useEffect(() => {
    const checkRoom = async () => {
      if (!roomId) {
        navigate('/');
        return;
      }

      try {
        const result = await checkRoomExists(roomId);
        if (!result.exists) {
          setRoomNotFound(true);
          setIsChecking(false);
          return;
        }

        if (!isConnected && !storeRoomId && !isKicked && !isLeaving) {
          if (!nickname || !avatar) {
            navigate('/');
            return;
          }
          joinRoom({
            roomId: roomId.toUpperCase(),
            nickname,
            avatar,
          });
        }

        setIsChecking(false);
      } catch (error) {
        setRoomNotFound(true);
        setIsChecking(false);
      }
    };

    checkRoom();
  }, [roomId, navigate, nickname, avatar, isConnected, storeRoomId, isKicked, isLeaving, joinRoom]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🀄</div>
          <p className="text-emerald-300 text-lg">正在进入房间...</p>
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
    if (confirm('确定要重置本局所有玩家的分数吗？')) {
      const resetUpdates = players.map((p) => ({
        playerId: p.id,
        scoreChange: currentGameRules.initialScore - p.score,
      }));
      updateScore(resetUpdates);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col">
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 px-6 py-4 shadow-xl border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold text-amber-100 tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                {roomName || `${currentRoomId} 号房间`}
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
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <RoomRulesSettings onUpdateRules={updateRoomRules} />
            <button
              onClick={leaveRoom}
              className="flex items-center gap-2 bg-red-900/80 hover:bg-red-800 text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span>离开房间</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-12 gap-6">
          <div className="col-span-3 h-full min-h-0">
            <PlayerList players={players} onKick={kickPlayer} />
          </div>

          <div className="col-span-6 h-full min-h-0">
            <GameTable
              players={players}
              gameRules={currentGameRules}
              gameStatus={currentGameStatus}
              currentRound={currentGameRound}
              onToggleReady={toggleReady}
              onStartGame={startGame}
            />
          </div>

          <div className="col-span-3 h-full min-h-0 flex flex-col gap-4">
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScorePanel
                players={players}
                scoreHistory={scoreHistory}
                currentRound={currentGameRound}
                gameStatus={currentGameStatus}
                onUpdateScore={updateScore}
                onResetScores={handleResetScores}
              />
            </div>
            <div className="h-80 min-h-[320px]">
              <ChatPanel messages={messages} onSendMessage={sendMessage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
