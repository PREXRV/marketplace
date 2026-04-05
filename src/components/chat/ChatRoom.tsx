'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createChatWebSocket } from '@/services/api';
import ChatSidebar from './ChatSidebar';
import ChatMessage from './ChatMessage';
import EmojiPicker from './EmojiPicker';
import { toast } from 'react-hot-toast';

interface Message {
  id: number;
  sender: 'admin' | 'partner';
  text: string;
  file?: string | null;
  file_name?: string;
  is_read?: boolean;
  created_at: string;
}

interface ChatRoomProps {
  roomSlug: string;
}

export default function ChatRoom({ roomSlug }: ChatRoomProps) {
  const { user, tokens } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !tokens?.access) return;

    const websocket = createChatWebSocket(Number(roomSlug), tokens.access);

    websocket.onopen = () => {
      toast.success('Подключено к чату');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    websocket.onerror = () => {
      toast.error('Ошибка подключения к чату');
    };

    websocket.onclose = () => {
      toast.error('Отключено от чата');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [roomSlug, user, tokens]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'history':
        setMessages(data.messages || []);
        break;
      case 'message':
        setMessages((prev) => [...prev, data]);
        break;
      case 'user_list':
        setOnlineUsers(data.users || []);
        break;
      case 'message_deleted':
        setMessages((prev) => prev.filter((m) => m.id !== data.message_id));
        break;
      case 'messages_read':
        setMessages((prev) =>
          prev.map((m) =>
            m.sender === 'partner' ? { ...m, is_read: true } : m
          )
        );
        break;
    }
  };

  const sendMessage = () => {
    if ((!messageInput.trim() && !replyTo) || !ws) return;

    const messageData = {
      type: 'chat_message',
      message: messageInput,
      reply_to: replyTo?.id || null,
    };

    ws.send(JSON.stringify(messageData));
    setMessageInput('');
    setReplyTo(null);
    setShowEmojiPicker(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    messageInputRef.current?.focus();
  };

  const handleDeleteMessage = (messageId: number) => {
    if (ws) {
      ws.send(JSON.stringify({
        type: 'delete_message',
        message_id: messageId,
      }));
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <ChatSidebar users={onlineUsers} roomSlug={roomSlug} />

      <div className="flex-1 flex flex-col bg-white">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Общий чат</h2>
              <p className="text-sm opacity-90">
                {onlineUsers.length} пользователей онлайн
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          <AnimatePresence>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.sender === 'partner' && message.sender !== 'admin'}
                onReply={handleReply}
                onDelete={handleDeleteMessage}
              />
            ))}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        <AnimatePresence>
          {replyTo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-6 py-3 bg-purple-50 border-l-4 border-purple-500 flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-semibold text-purple-600">
                  Ответ на {replyTo.sender}
                </p>
                <p className="text-sm text-gray-600 truncate">{replyTo.text}</p>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 bg-white border-t-2 border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-3 hover:bg-purple-50 rounded-full transition-colors"
              >
                <Smile className="w-6 h-6 text-purple-600" />
              </button>

              {showEmojiPicker && (
                <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmojiPicker(false)} />
              )}
            </div>

            <input
              ref={messageInputRef}
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Напишите сообщение..."
              className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-500 transition-colors"
            />

            <button
              onClick={sendMessage}
              disabled={!messageInput.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}