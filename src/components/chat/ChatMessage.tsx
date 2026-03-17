'use client';

import { motion } from 'framer-motion';
import { Reply, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';

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

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  onReply: (message: Message) => void;
  onDelete: (messageId: number) => void;
}

export default function ChatMessage({ message, isOwn, onReply, onDelete }: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-xl ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* User Info */}
        {!isOwn && (
          <div className="flex items-center gap-2 mb-2 ml-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: message.user.avatar_color }}
            >
              {message.user.nickname.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-gray-800">{message.user.nickname}</span>
            <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
          </div>
        )}

        {/* Reply Preview */}
        {message.reply_to && (
          <div className="mb-2 ml-12 p-2 bg-gray-100 rounded-lg border-l-4 border-purple-500">
            <p className="text-xs font-semibold text-purple-600">{message.reply_to.user}</p>
            <p className="text-sm text-gray-600 truncate">{message.reply_to.content}</p>
          </div>
        )}

        {/* Message Content */}
        <div className="relative group">
          <div
            className={`px-4 py-3 rounded-2xl ${
              isOwn
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white ml-12'
                : 'bg-white shadow-md mr-12'
            }`}
          >
            <p className="leading-relaxed break-words">{message.content}</p>
            {isOwn && (
              <span className="text-xs opacity-75 mt-1 block text-right">
                {formatTime(message.created_at)}
              </span>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute top-0 ${isOwn ? 'left-0' : 'right-0'} flex gap-1`}
            >
              <button
                onClick={() => onReply(message)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-purple-50 transition-colors"
                title="Ответить"
              >
                <Reply className="w-4 h-4 text-purple-600" />
              </button>
              
              {isOwn && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
