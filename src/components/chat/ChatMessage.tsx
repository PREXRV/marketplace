'use client';

import { motion } from 'framer-motion';
import { Reply, Trash2 } from 'lucide-react';
import { useState } from 'react';
import OptimizedImage from '@/components/OptimizedImage';

interface Message {
  id: number;
  sender: 'admin' | 'partner';
  text: string;
  file?: string | null;
  file_name?: string;
  is_read?: boolean;
  created_at: string;
}

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: number) => void;
}

export default function ChatMessage({ message, isOwn, onReply, onDelete }: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const isImage = (file?: string | null, fileName?: string) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName || file || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-xl ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center gap-2 mb-2 ml-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
              isOwn ? 'bg-purple-600' : 'bg-gray-500'
            }`}
          >
            {message.sender === 'admin' ? 'A' : 'P'}
          </div>
          <span className="font-semibold text-gray-800">
            {message.sender === 'admin' ? 'Администрация' : 'Партнёр'}
          </span>
          <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
        </div>

        <div className="relative group">
          <div
            className={`px-4 py-3 rounded-2xl ${
              isOwn
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white ml-12'
                : 'bg-white shadow-md mr-12'
            }`}
          >
            {message.text && <p className="leading-relaxed break-words">{message.text}</p>}

            {message.file && isImage(message.file, message.file_name) && (
              <a href={message.file} target="_blank" rel="noopener noreferrer" className="mt-3 block">
                <OptimizedImage
                  src={message.file}
                  alt={message.file_name || 'image'}
                  width={240}
                  height={240}
                  className="max-w-[240px] rounded-xl"
                />
              </a>
            )}

            {message.file && !isImage(message.file, message.file_name) && (
              <a
                href={message.file}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-black/5 px-3 py-2 text-sm text-gray-700 hover:bg-black/10"
              >
                📎 {message.file_name || 'Файл'}
              </a>
            )}

            {isOwn && (
              <span className="text-xs opacity-75 mt-1 block text-right">
                {formatTime(message.created_at)}
              </span>
            )}
          </div>

          {(onReply || onDelete) && showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute top-0 ${isOwn ? 'left-0' : 'right-0'} flex gap-1`}
            >
              {onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-purple-50 transition-colors"
                  title="Ответить"
                >
                  <Reply className="w-4 h-4 text-purple-600" />
                </button>
              )}

              {isOwn && onDelete && (
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