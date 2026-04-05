'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createPublicChatWebSocket, publicChatAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: number;
  text: string;
  username: string;
  avatar_letter: string;
  user_role: string;
  created_at: string;
}

export default function PublicChatWidget() {
  const pathname = usePathname();
  const { tokens, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  const hiddenOnPages = pathname === '/community-chat' || pathname === '/chat';

  useEffect(() => {
    if (!open || !tokens?.access || hiddenOnPages || !user) return;

    publicChatAPI.getMessages('general').then((res) => {
      const list = res.data || [];
      setMessages(list.slice(-20));
    }).catch((error) => {
      console.error('Ошибка загрузки мини-чата:', error);
    });

    const ws = createPublicChatWebSocket('general', tokens.access);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        setMessages((prev) => {
          const exists = prev.some((item) => item.id === data.id);
          if (exists) return prev;
          return [...prev.slice(-19), data];
        });
      }

      if (data.type === 'message_deleted') {
        setMessages((prev) => prev.filter((item) => item.id !== data.id));
      }
    };

    return () => ws.close();
  }, [open, tokens?.access, hiddenOnPages, user]);

  if (!user || hiddenOnPages) return null;

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      action: 'send_message',
      text,
    }));

    setInput('');
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#9147ff] text-white shadow-2xl hover:bg-[#7c3aed]"
        aria-label="Открыть общий чат"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] h-[520px] rounded-2xl overflow-hidden bg-[#18181b] text-white border border-white/10 shadow-2xl flex flex-col">
          <div className="px-4 py-3 bg-[#9147ff] font-semibold flex items-center justify-between">
            <span>Общий чат</span>
            <Link
              href="/community-chat"
              className="text-sm text-white/90 hover:text-white underline underline-offset-4"
            >
              Открыть
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-[#a970ff] flex items-center justify-center text-sm font-bold">
                  {message.avatar_letter}
                </div>

                <div className="min-w-0">
                  <div className="text-sm">
                    <span className="font-semibold">{message.username}</span>
                    <span className="text-white/40 ml-2">{message.user_role}</span>
                  </div>
                  <div className="text-sm text-white/90 break-words">{message.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none"
              placeholder="Написать..."
            />
            <button
              onClick={sendMessage}
              className="px-3 py-2 rounded-xl bg-[#9147ff] hover:bg-[#7c3aed]"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}