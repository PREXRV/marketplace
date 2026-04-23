'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import OptimizedImage from '@/components/OptimizedImage';

export default function LeaderboardWidget() {
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopPlayers = async () => {
      try {
        setLoading(true);
        const players = await api.getTopPlayers();
        setTopPlayers(players);
      } catch (error) {
        console.error('Failed to load top players:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTopPlayers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">🏆 Топ игроков</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {topPlayers?.length > 0 ? (
          topPlayers.slice(0, 5).map((player: any, index: number) => (
            <div key={player.id || index} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                #{index + 1}
              </div>
              <OptimizedImage
                src={player.avatar || '/default-avatar.png'}
                alt={player.username}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{player.username}</p>
                <p className="text-sm text-gray-500">Ур. {player.level || 1}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-lg">
                  {player.experience?.toLocaleString() || '0'} XP
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">👑</div>
            <p>Топ пока пуст</p>
          </div>
        )}
      </div>
    </div>
  );
}
