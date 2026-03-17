'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle, Users, TrendingUp } from 'lucide-react';
import { chatAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import ChatWelcome from '@/components/chat/ChatWelcome';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [showWelcome, setShowWelcome] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
    }
  }, [isAuthenticated]);

  const fetchRooms = async () => {
    try {
      const response = await chatAPI.getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const joinRoom = (roomSlug: string) => {
    if (!isAuthenticated) {
      setShowWelcome(true);
      return;
    }
    router.push(`/chat/${roomSlug}`);
  };

  if (showWelcome && !isAuthenticated) {
    return <ChatWelcome onClose={() => setShowWelcome(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            💬 Чат покупателей
          </h1>
          <p className="text-xl text-gray-600">
            Общайтесь с другими покупателями, делитесь опытом и получайте советы
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room: any, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => joinRoom(room.slug)}
              className="bg-white rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center gap-2 text-green-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">{room.online_count} онлайн</span>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 text-gray-800">{room.name}</h3>
              <p className="text-gray-600 mb-4">{room.description}</p>

              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                Присоединиться
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
