'use client';

import { useEffect, useRef, useState } from 'react';
import { createPublicChatWebSocket, publicChatAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface Channel {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_default: boolean;
  is_active: boolean;
  channel_type: string;
}

interface Message {
  id: number;
  channel: number | string;
  text: string;
  username: string;
  avatar_letter: string;
  user_role: string;
  created_at: string;
  file_url?: string | null;
  file_name?: string;
}

export default function CommunityChatPage() {
  const { tokens, user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Подключение...');
  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (!activeChannel) return;
    loadMessages(activeChannel);
  }, [activeChannel]);

  useEffect(() => {
    if (!tokens?.access || !activeChannel || !user) return;

    const ws = createPublicChatWebSocket(activeChannel, tokens.access);
    wsRef.current = ws;

    ws.onopen = () => setStatus('В сети');
    ws.onclose = () => setStatus('Отключено');
    ws.onerror = () => setStatus('Ошибка соединения');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        setMessages((prev) => {
          const exists = prev.some((item) => item.id === data.id);
          if (exists) return prev;
          return [...prev, data];
        });
      }

      if (data.type === 'message_deleted') {
        setMessages((prev) => prev.filter((item) => item.id !== data.id));
      }

      if (data.type === 'message_approved') {
        setMessages((prev) => {
          const exists = prev.some((item) => item.id === data.id);
          if (exists) return prev;
          return [...prev, data];
        });
      }

      if (data.type === 'error') {
        alert(data.message);
      }

      if (data.type === 'pending') {
        alert(data.message);
      }
    };

    return () => {
      ws.close();
    };
  }, [tokens?.access, activeChannel, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChannels = async () => {
    try {
      const res = await publicChatAPI.getChannels();
      const list = res.data || [];
      setChannels(list);

      const general = list.find((c: Channel) => c.slug === 'general');
      if (general) {
        setActiveChannel(general.slug);
      } else if (list[0]) {
        setActiveChannel(list[0].slug);
      }
    } catch (error) {
      console.error('Ошибка загрузки каналов:', error);
    }
  };

  const loadMessages = async (slug: string) => {
    try {
      const res = await publicChatAPI.getMessages(slug);
      setMessages(res.data || []);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert('Нет подключения к чату');
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        action: 'send_message',
        text,
      })
    );

    setInput('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-2xl font-bold mb-3">Общий чат</h1>
          <p className="text-white/70">Чтобы писать в чат, нужно авторизоваться.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white flex">
      <aside className="w-[280px] border-r border-white/10 bg-[#18181b] p-4">
        <h1 className="text-xl font-bold mb-4">Каналы</h1>

        <div className="space-y-2">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.slug)}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${
                activeChannel === channel.slug
                  ? 'bg-[#9147ff] text-white'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="font-semibold">{channel.name}</div>
              <div className="text-xs text-white/60">{channel.description}</div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-[#18181b]">
          <div>
            <div className="font-semibold text-lg">#{activeChannel}</div>
            <div className="text-xs text-white/60">{status}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#9147ff] flex items-center justify-center font-bold">
                {message.avatar_letter}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold">{message.username}</span>
                  <span className="text-xs text-white/50">{message.user_role}</span>
                  <span className="text-xs text-white/40">
                    {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {message.text && <div className="text-white/90 mt-1 break-words">{message.text}</div>}

                {message.file_url && (
                  <a
                    href={message.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex mt-2 text-sm text-[#a970ff] hover:underline"
                  >
                    📎 {message.file_name || 'Файл'}
                  </a>
                )}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-white/10 p-4 bg-[#18181b] flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Написать сообщение..."
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
          />

          <button
            onClick={sendMessage}
            className="px-5 py-3 rounded-xl bg-[#9147ff] hover:bg-[#7c3aed] font-semibold"
          >
            Отправить
          </button>
        </div>
      </main>
    </div>
  );
}