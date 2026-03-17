'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatWelcomeProps {
  onClose: () => void;
}

export default function ChatWelcome({ onClose }: ChatWelcomeProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState('');

  const handleJoin = () => {
    if (!nickname.trim()) {
      alert('Введите ваше имя');
      return;
    }
    
    // Сохраняем никнейм в localStorage для гостевого доступа
    localStorage.setItem('chat_nickname', nickname);
    
    // В реальном приложении здесь должна быть регистрация/авторизация
    router.push('/chat/general');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-12 max-w-md w-full relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Добро пожаловать в чат!
          </h1>
          <p className="text-gray-600">
            Общайтесь с другими покупателями и делитесь опытом
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Введите ваше имя"
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-lg"
            maxLength={20}
            autoFocus
          />

          <button
            onClick={handleJoin}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
          >
            Присоединиться к чату
          </button>
        </div>
      </motion.div>
    </div>
  );
}
