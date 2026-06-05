import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomHeader } from '../components/RoomHeader';
import { PlayerList } from '../components/PlayerList';
import { GameTable } from '../components/GameTable';
import { ChatPanel } from '../components/ChatPanel';
import { useRoom } from '../hooks/useRoom';
import { useUserStore } from '../store/useUserStore';
import { useRoomStore } from '../store/useRoomStore';
import { checkRoomExists } from '../utils/socket';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { nickname, avatar } = useUserStore();
  const { roomId: storeRoomId, roomName, players, messages, isConnected, isKicked, isLeaving } = useRoomStore();
  const { players: roomPlayers, joinRoom, leaveRoom, sendMessage, toggleReady, kickPlayer } = useRoom();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col">
      <RoomHeader
        roomId={currentRoomId}
        roomName={roomName || `${currentRoomId} 号房间`}
        playerCount={players.length}
        maxPlayers={4}
        onLeave={leaveRoom}
      />

      <div className="flex-1 p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-12 gap-6">
          <div className="col-span-3 h-full min-h-0">
            <PlayerList players={players} onKick={kickPlayer} />
          </div>

          <div className="col-span-6 h-full min-h-0">
            <GameTable players={players} onToggleReady={toggleReady} />
          </div>

          <div className="col-span-3 h-full min-h-0">
            <ChatPanel messages={messages} onSendMessage={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
