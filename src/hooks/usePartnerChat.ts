import { useState, useEffect, useRef, useCallback } from 'react';
import { createPartnerChatWS } from '@/services/api';
export interface ChatMessage {
  id: number;
  sender: 'partner' | 'admin';
  text: string;
  file: string | null;
  file_name: string;
  is_read: boolean;
  created_at: string;
}

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 
  (typeof window !== 'undefined' 
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`
    : 'ws://localhost:8000');

export function usePartnerChat(partnerId: number | null) {
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading,   setLoading]   = useState(true);

  const wsRef           = useRef<WebSocket | null>(null);
  const reconnectTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCount  = useRef(0);
  const manualClose     = useRef(false);
  const partnerIdRef    = useRef(partnerId);

  partnerIdRef.current = partnerId;

  const clearReconnect = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const connect = useCallback(() => {
    const pid = partnerIdRef.current;
    if (!pid) return;

    // Закрываем старое соединение без реконнекта
    if (wsRef.current && wsRef.current.readyState < 2) {
      manualClose.current = true;
      wsRef.current.close();
    }
    const ws = createPartnerChatWS(pid);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      reconnectCount.current = 0;
      clearReconnect();
    };

    ws.onclose = (e) => {
      setConnected(false);

      // 4001 = не авторизован, 4003 = нет прав — не реконнектимся
      if (manualClose.current || e.code === 4001 || e.code === 4003) {
        manualClose.current = false;
        return;
      }

      // Экспоненциальный backoff: 1s, 2s, 4s, 8s, max 16s
      const delay = Math.min(1000 * 2 ** reconnectCount.current, 16000);
      reconnectCount.current += 1;

      reconnectTimer.current = setTimeout(() => {
        if (partnerIdRef.current) connect();
      }, delay);
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'history') {
          setMessages(data.messages || []);
          setLoading(false);
          return;
        }

        if (data.type === 'message') {
          setMessages(prev => {
            // Избегаем дублей (по id)
            if (prev.some(m => m.id === data.id)) return prev;
            return [...prev, {
              id:         data.id,
              sender:     data.sender,
              text:       data.text     || '',
              file:       data.file     || null,
              file_name:  data.file_name || '',
              is_read:    false,
              created_at: data.created_at,
            }];
          });
          return;
        }

        if (data.type === 'messages_read') {
          // Если admin прочитал — помечаем наши сообщения
          if (data.reader === 'admin') {
            setMessages(prev =>
              prev.map(m => m.sender === 'partner' ? { ...m, is_read: true } : m)
            );
          }
          return;
        }
      } catch {
        // ignore malformed frames
      }
    };
  }, []);

  // Подключаемся когда есть partnerId
  useEffect(() => {
    if (!partnerId) return;
    manualClose.current = false;
    setLoading(true);
    setMessages([]);
    connect();

    return () => {
      clearReconnect();
      manualClose.current = true;
      wsRef.current?.close();
    };
  }, [partnerId, connect]);

  const sendMessage = useCallback((text: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !text.trim()) return;
    ws.send(JSON.stringify({ action: 'send_message', text: text.trim() }));
  }, []);

  const markRead = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ action: 'mark_read' }));
  }, []);

  // Добавить сообщение от REST (chat_upload ответ)
  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  return { messages, connected, loading, sendMessage, markRead, addMessage };
}