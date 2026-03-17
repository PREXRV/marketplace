import { useState, useEffect, useRef, useCallback } from 'react';

export interface ChatMessage {
  id: number;
  sender: 'partner' | 'admin';
  text: string;
  is_read: boolean;
  file?: string | null;
  file_name?: string;
  created_at: string;
}

export function usePartnerChat(partnerId: number | null) {
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading]     = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  const markRead = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'mark_read' }));
    }
    setMessages(prev =>
      prev.map(m => m.sender === 'admin' ? { ...m, is_read: true } : m)
    );
  }, []);

  useEffect(() => {
    if (!partnerId) return;

    const token = JSON.parse(localStorage.getItem('auth_tokens') || '{}')?.access;
    if (!token) { setLoading(false); return; }

    const ws = new WebSocket(
      `ws://localhost:8000/ws/partner-chat/${partnerId}/?token=${token}`
    );
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'history') {
        setMessages(data.messages);
        setLoading(false);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ action: 'mark_read' }));
        }

      } else if (data.type === 'message') {
        // ✅ Добавляем с file и file_name
        setMessages(prev => [...prev, {
          id:        data.id,
          sender:    data.sender,
          text:      data.text || '',
          is_read:   data.sender === 'partner',
          file:      data.file || null,
          file_name: data.file_name || '',
          created_at: data.created_at,
        }]);
        if (data.sender === 'admin') {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ action: 'mark_read' }));
          }
          setMessages(prev =>
            prev.map(m => m.sender === 'admin' ? { ...m, is_read: true } : m)
          );
        }

      } else if (data.type === 'messages_read') {
        // ✅ Если партнёр прочитал — помечаем сообщения партнёра как прочитанные
        const isPartnerRead = data.reader === 'partner';
        setMessages(prev =>
          prev.map(m =>
            m.sender === (isPartnerRead ? 'partner' : 'admin')
              ? { ...m, is_read: true }
              : m
          )
        );
      }
    };

    ws.onclose = () => { setConnected(false); setLoading(false); };
    ws.onerror = () => { setConnected(false); setLoading(false); };

    return () => ws.close();
  }, [partnerId]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'send_message', text }));
    }
  }, []);

  return { messages, connected, loading, sendMessage, markRead };
}
