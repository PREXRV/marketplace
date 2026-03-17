'use client';

import { motion } from 'framer-motion';
import { Users, Crown, Shield } from 'lucide-react';

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar_color: string;
  is_moderator: boolean;
}

interface ChatSidebarProps {
  users: User[];
  roomSlug: string;
}

export default function ChatSidebar({ users, roomSlug }: ChatSidebarProps) {
  return (
    <div className="w-80 bg-white border-r-2 border-gray-100 flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <h2 className="text-xl font-bold mb-2">Участники</h2>
        <div className="flex items-center gap-2 text-sm opacity-90">
          <Users className="w-4 h-4" />
          <span>{users.length} онлайн</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold relative"
              style={{ backgroundColor: user.avatar_color }}
            >
              {user.nickname.charAt(0).toUpperCase()}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{user.nickname}</span>
                {user.is_moderator && (
                  <span title="Модератор">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </span>
                )}
              </div>
              <span className="text-xs text-green-500">В сети</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
