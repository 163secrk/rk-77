import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { Message } from '../types';
import { useUserStore } from '../store/useUserStore';
import { formatTime } from '../utils/socket';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { playerId } = useUserStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (content) {
      onSendMessage(content);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-emerald-950/80 backdrop-blur rounded-2xl border border-emerald-700/50 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-emerald-700/50 flex items-center gap-2">
        <MessageCircle size={18} className="text-amber-400" />
        <h2 className="text-lg font-bold text-amber-200" style={{ fontFamily: "'Playfair Display', serif" }}>
          聊天
        </h2>
        <span className="ml-auto text-xs text-emerald-400">
          {messages.length} 条消息
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-emerald-400 py-8 text-sm">
            还没有消息，开始聊天吧~
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.playerId === playerId;
            const isSystem = msg.isSystem;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-emerald-800/50 text-emerald-300 text-xs px-4 py-1.5 rounded-full max-w-xs text-center">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="text-2xl flex-shrink-0 w-8 h-8 rounded-full bg-emerald-800/50 flex items-center justify-center">
                  {msg.avatar}
                </div>

                <div className={`max-w-[70%] ${isSelf ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`flex items-center gap-2 mb-1 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-xs text-emerald-400 font-medium">{msg.nickname}</span>
                    <span className="text-xs text-emerald-500">{formatTime(msg.timestamp)}</span>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-2xl break-words
                      ${isSelf
                        ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white rounded-tr-sm'
                        : 'bg-emerald-800/70 text-emerald-100 rounded-tl-sm'
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-emerald-700/50">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter发送)"
            className="flex-1 bg-emerald-900/50 border border-emerald-700/50 rounded-xl px-4 py-2 text-emerald-100 placeholder-emerald-500 resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            rows={1}
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
