import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import { Send, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { Danmaku } from '../types';
import { useRoomStore } from '../store/useRoomStore';
import { DANMAKU_COLORS } from '../utils/socket';

interface DanmakuOverlayProps {
  danmakuList: Danmaku[];
  onSendDanmaku: (content: string, color?: string) => void;
  isSpectator: boolean;
}

interface ActiveDanmaku extends Danmaku {
  left: number;
  animationDuration: number;
  key: string;
}

export function DanmakuOverlay({ danmakuList, onSendDanmaku, isSpectator }: DanmakuOverlayProps) {
  const [input, setInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(DANMAKU_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeDanmaku, setActiveDanmaku] = useState<ActiveDanmaku[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showDanmaku, setShowDanmaku } = useRoomStore();

  useEffect(() => {
    if (danmakuList.length === 0) return;

    const latestDanmaku = danmakuList[danmakuList.length - 1];
    const existingKey = `${latestDanmaku.id}-${latestDanmaku.timestamp}`;

    setActiveDanmaku(prev => {
      if (prev.some(d => d.key === existingKey)) return prev;

      const newActiveDanmaku: ActiveDanmaku = {
        ...latestDanmaku,
        left: 100,
        animationDuration: 8 + Math.random() * 6,
        key: existingKey,
      };

      setTimeout(() => {
        setActiveDanmaku(p => p.filter(d => d.key !== existingKey));
      }, (newActiveDanmaku.animationDuration + 1) * 1000);

      return [...prev, newActiveDanmaku];
    });
  }, [danmakuList]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (content && isSpectator) {
      onSendDanmaku(content, selectedColor);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!showDanmaku) {
    return (
      <button
        onClick={() => setShowDanmaku(true)}
        className="fixed top-4 right-4 z-50 bg-emerald-900/90 backdrop-blur-sm text-emerald-300 px-4 py-2 rounded-xl border border-emerald-700/50 hover:bg-emerald-800/90 transition-all flex items-center gap-2"
      >
        <Eye size={18} />
        <span>显示弹幕</span>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {activeDanmaku.map((danmaku) => (
        <div
          key={danmaku.key}
          className="absolute whitespace-nowrap text-xl font-bold drop-shadow-lg pointer-events-none"
          style={{
            top: `${danmaku.top ?? 10}%`,
            left: `${danmaku.left}%`,
            color: danmaku.color || '#ffffff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)',
            animation: `danmakuScroll ${danmaku.animationDuration}s linear forwards`,
          }}
        >
          <span className="mr-2 opacity-80">{danmaku.avatar}</span>
          <span>{danmaku.content}</span>
        </div>
      ))}

      <style>{`
        @keyframes danmakuScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-120vw);
          }
        }
      `}</style>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-emerald-950/90 backdrop-blur-sm rounded-2xl border border-emerald-700/50 p-3 shadow-2xl">
          {isSpectator ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-8 h-8 rounded-lg border-2 border-emerald-600/50 hover:border-amber-500/50 transition-all flex-shrink-0"
                style={{ backgroundColor: selectedColor }}
                title="选择颜色"
              />
              {showColorPicker && (
                <div className="absolute bottom-full mb-2 left-0 bg-emerald-950/95 rounded-xl p-2 border border-emerald-700/50 flex gap-1">
                  {DANMAKU_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded-md transition-all hover:scale-110 ${
                        selectedColor === color ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-emerald-950' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 min-w-[320px]">
                <MessageSquare size={18} className="text-amber-400 flex-shrink-0" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="发送弹幕，与其他观战者互动..."
                  maxLength={50}
                  className="flex-1 bg-emerald-900/50 border border-emerald-700/50 rounded-xl px-4 py-2 text-emerald-100 placeholder-emerald-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1 flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
              <button
                onClick={() => setShowDanmaku(false)}
                className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-800/50 rounded-lg transition-all"
                title="隐藏弹幕"
              >
                <EyeOff size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <MessageSquare size={18} className="text-amber-400" />
              <span className="text-emerald-300 text-sm">弹幕模式 - 仅观战者可见</span>
              <span className="text-emerald-500 text-xs bg-emerald-900/50 px-2 py-1 rounded-lg">
                观战 {danmakuList.length} 条
              </span>
              <button
                onClick={() => setShowDanmaku(false)}
                className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-800/50 rounded-lg transition-all"
                title="隐藏弹幕"
              >
                <EyeOff size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
