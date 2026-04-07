'use client';

import { useState, useEffect, useRef } from 'react';
import { partnershipAPI } from '@/services/api';
import { usePartnerChat } from '@/hooks/usePartnerChat';
import { Send, Wifi, WifiOff, MessageCircle, Smile, Paperclip, X, File, Download } from 'lucide-react';

const EMOJIS = [
  '😊','😂','❤️','👍','🔥','✅','🎉','🙏','😍','🤔',
  '👋','💪','😅','🥳','😎','💯','🚀','⭐','💬','📦',
  '📸','🎁','💰','📊','🛒','✨','😢','😡','🤝','👀',
];

const isImage = (name?: string) => !!name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

export default function PartnerChatPage() {
  const [partner, setPartner]     = useState<any>(null);
  const [input, setInput]         = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [files, setFiles]         = useState<File[]>([]);
  const [sending, setSending]     = useState(false);
  const messagesRef               = useRef<HTMLDivElement>(null);
  const isFirstLoad               = useRef(true);
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const emojiRef                  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    partnershipAPI.getPartnerProfile()
      .then(res => setPartner(res.data))
      .catch(() => setPartner(null));
  }, []);

  const { messages, connected, loading, sendMessage, markRead } =
    usePartnerChat(partner?.id ?? null);

  useEffect(() => {
    partnershipAPI.chatMarkRead?.().catch(() => {});
    if (connected) markRead();
  }, [connected, messages.length]);

  useEffect(() => {
    if (messages.length === 0) return;
    const container = messagesRef.current;
    if (!container) return;
    if (isFirstLoad.current) {
      container.scrollTop = container.scrollHeight;
      isFirstLoad.current = false;
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && files.length === 0) || !connected || sending) return;

    setSending(true);
    try {
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          await partnershipAPI.chatUpload(files[i], i === 0 ? text : '');
        }
      } else {
        sendMessage(text);
      }
      setInput('');
      setFiles([]);
      setShowEmoji(false);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected].slice(0, 5));
    e.target.value = '';
  };
  const insertEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  const grouped = messages.reduce((acc, msg) => {
    const date = formatDate(msg.created_at);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, typeof messages>);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">

      {/* Шапка */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-3 md:px-6 md:py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg md:rounded-xl flex items-center justify-center">
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm md:text-base">Поддержка</p>
            <p className="text-[10px] md:text-xs text-gray-400">Администрация магазина</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-[10px] md:text-xs font-medium px-2 py-1 md:px-3 md:py-1 rounded-full ${
          connected ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
        }`}>
          {connected
            ? <><Wifi className="w-3 h-3" /> Онлайн</>
            : <><WifiOff className="w-3 h-3" /> Офлайн</>
          }
        </div>
      </div>

      {/* Сообщения */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-3 py-3 md:px-6 md:py-4" style={{ minHeight: 0 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 md:gap-3">
            <MessageCircle className="w-10 h-10 md:w-12 md:h-12 opacity-20" />
            <p className="text-xs md:text-sm">Напишите нам — мы всегда на связи</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex items-center gap-2 my-3 md:my-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] md:text-xs text-gray-400 font-medium">{date}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {msgs.map((msg) => {
                const isPartner = msg.sender === 'partner';
                return (
                  <div key={msg.id} className={`flex mb-2 md:mb-3 ${isPartner ? 'justify-end' : 'justify-start'}`}>
                    {!isPartner && (
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] md:text-xs font-bold mr-1 md:mr-2 flex-shrink-0 self-end">
                        A
                      </div>
                    )}
                    <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isPartner ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm leading-relaxed ${
                        isPartner
                          ? 'bg-purple-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.text && <p className="break-words">{msg.text}</p>}

                        {msg.file && isImage(msg.file_name) && (
                          <a href={msg.file} target="_blank" rel="noopener noreferrer">
                            <img
                              src={msg.file}
                              alt={msg.file_name || 'Изображение'}
                              className="mt-1 md:mt-2 max-w-[180px] md:max-w-[220px] rounded-lg cursor-pointer hover:opacity-90 transition"
                            />
                          </a>
                        )}

                        {msg.file && !isImage(msg.file_name) && (
                          <a
                            href={msg.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={msg.file_name}
                            className={`flex items-center gap-1.5 md:gap-2 mt-1 md:mt-2 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-[10px] md:text-xs font-medium transition ${
                              isPartner
                                ? 'bg-white/20 hover:bg-white/30 text-white'
                                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                            }`}
                          >
                            <File className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                            <span className="truncate max-w-[120px] md:max-w-[160px]">{msg.file_name || 'Файл'}</span>
                            <Download className="w-2.5 h-2.5 md:w-3 md:h-3 ml-auto flex-shrink-0 opacity-60" />
                          </a>
                        )}
                      </div>

                      <div className={`flex items-center gap-1 mt-0.5 md:mt-1 ${isPartner ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] md:text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                        {isPartner && (
                          <span className={`text-[10px] md:text-xs ${msg.is_read ? 'text-purple-500' : 'text-gray-300'}`}>
                            {msg.is_read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Поле ввода */}
      <div className="flex-shrink-0 px-3 py-3 md:px-6 md:py-4 border-t border-gray-100">

        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs text-purple-700">
                {isImage(file.name) ? (
                  <img src={URL.createObjectURL(file)} alt="" className="w-6 h-6 md:w-8 md:h-8 rounded object-cover" />
                ) : (
                  <File className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                )}
                <span className="max-w-[80px] md:max-w-[120px] truncate">{file.name}</span>
                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                  className="ml-0.5 md:ml-1 hover:text-red-500 transition">
                  <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-1.5 md:gap-2">
          <button onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg md:rounded-xl transition flex-shrink-0">
            <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <input ref={fileInputRef} type="file" multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            className="hidden" onChange={handleFileChange} />

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написать сообщение..."
            rows={1}
            className="flex-1 resize-none px-3 py-2 md:px-4 md:py-3 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition max-h-28"
            style={{ minHeight: 36 }}
          />

          <div className="relative flex-shrink-0" ref={emojiRef}>
            <button onClick={() => setShowEmoji(prev => !prev)}
              className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl transition ${
                showEmoji ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
              }`}>
              <Smile className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            {showEmoji && (
              <div className="absolute bottom-10 md:bottom-12 right-0 bg-white border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-2 md:p-3 w-72 md:w-64 z-50">
                <div className="grid grid-cols-8 md:grid-cols-10 gap-0.5 md:gap-1">
                  {EMOJIS.map(emoji => (
                    <button key={emoji} onClick={() => insertEmoji(emoji)}
                      className="w-7 h-7 md:w-7 md:h-7 flex items-center justify-center text-base md:text-lg hover:bg-purple-50 rounded-lg transition">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleSend}
            disabled={(!input.trim() && files.length === 0) || !connected || sending}
            className="w-9 h-9 md:w-11 md:h-11 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg md:rounded-xl flex items-center justify-center transition flex-shrink-0">
            {sending
              ? <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
            }
          </button>
        </div>
        <p className="text-[10px] md:text-xs text-gray-400 mt-1 ml-0.5 md:ml-1">Shift+Enter — новая строка</p>
      </div>
    </div>
  );
}