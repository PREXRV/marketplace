'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, X, Reply, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createChatWebSocket } from '@/services/api';
import ChatSidebar from './ChatSidebar';
import ChatMessage from './ChatMessage';
import EmojiPicker from './EmojiPicker';
import { toast } from 'react-hot-toast';

interface Message {
  id: number;
  user: {
    id: number;
    username: string;
    nickname: string;
    avatar_color: string;
  };
  content: string;
  created_at: string;
  reply_to?: {
    id: number;
    content: string;
    user: string;
  };
}

interface ChatRoomProps {
  roomSlug: string;
}

export default function ChatRoom({ roomSlug }: ChatRoomProps) {
  const { user, tokens } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !tokens?.access) return;
    const websocket = createChatWebSocket(Number(roomSlug));

    websocket.onopen = () => {
      console.log('WebSocket connected');
      toast.success('Подключено к чату');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Ошибка подключения к чату');
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
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
      case 'message_history':
        setMessages(data.messages);
        break;
      
      case 'chat_message':
        setMessages((prev) => [...prev, data.message]);
        break;
      
      case 'user_list':
        setOnlineUsers(data.users);
        break;
      
      case 'user_join':
        toast.success(`${data.user.nickname} присоединился`);
        break;
      
      case 'user_leave':
        toast(`${data.user.username} вышел`, { icon: '👋' });
        break;
      
      case 'user_typing':
        if (data.is_typing) {
          setTypingUsers((prev) => [...prev, data.user.username]);
        } else {
          setTypingUsers((prev) => prev.filter((u) => u !== data.user.username));
        }
        break;
      
      case 'message_deleted':
        setMessages((prev) => prev.filter((m) => m.id !== data.message_id));
        break;
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !ws) return;

    const messageData = {
      type: 'chat_message',
      message: messageInput,
      reply_to: replyTo?.id || null,
    };

    ws.send(JSON.stringify(messageData));
    setMessageInput('');
    setReplyTo(null);
    setShowEmojiPicker(false);
    
    // Останавливаем индикатор печати
    stopTyping();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    if (!isTyping && ws) {
      setIsTyping(true);
      ws.send(JSON.stringify({ type: 'typing_start' }));
    }

    // Сброс таймера печати
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (isTyping && ws) {
      setIsTyping(false);
      ws.send(JSON.stringify({ type: 'typing_stop' }));
    }
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
      {/* Sidebar */}
      <ChatSidebar users={onlineUsers} roomSlug={roomSlug} />

      {/* Main Chat */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          <AnimatePresence>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.user.id === user?.id}
                onReply={handleReply}
                onDelete={handleDeleteMessage}
              />
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-500 italic ml-14"
            >
              {typingUsers[0]} печатает
              <span className="inline-flex ml-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
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
                  Ответ на {replyTo.user.nickname}
                </p>
                <p className="text-sm text-gray-600 truncate">{replyTo.content}</p>
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

        {/* Input */}
        <div className="p-6 bg-white border-t-2 border-gray-100">
          <div className="flex items-center gap-3">
            {/* Emoji Picker */}
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

            {/* Message Input */}
            <input
              ref={messageInputRef}
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-500 transition-colors"
            />

            {/* Send Button */}
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
