'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { api, UserLevel } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default function LeaderboardPage() {
  const { tokens } = useAuth();
  const [topPlayers, setTopPlayers] = useState<UserLevel[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [tokens]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const [players, rank] = await Promise.all([
        api.getTopPlayers(),
        tokens ? api.getMyRank(tokens.access) : Promise.resolve(null),
      ]);

      setTopPlayers(players);
      setMyRank(rank);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <div className="mb-6 text-sm text-gray-600 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition">Главная</Link>
          <span>›</span>
          <Link href="/gamification" className="hover:text-primary transition">Геймификация</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Лидерборд</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">👑 Таблица лидеров</h1>

        {/* Моё место */}
        {myRank && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Ваше место</p>
                <p className="text-4xl font-bold">#{myRank.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Уровень</p>
                <p className="text-4xl font-bold">{myRank.level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Опыт</p>
                <p className="text-2xl font-bold">{myRank.experience} XP</p>
              </div>
            </div>
          </div>
        )}

        {/* Топ-3 */}
        {!loading && topPlayers.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 2 место */}
            <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl p-6 text-center text-white transform md:translate-y-8">
              <div className="text-5xl mb-3">🥈</div>
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                {topPlayers[1].username[0].toUpperCase()}
              </div>
              <h3 className="text-xl font-bold mb-1">{topPlayers[1].username}</h3>
              <p className="text-lg font-semibold">Уровень {topPlayers[1].level}</p>
              <p className="text-sm opacity-90">{topPlayers[1].experience} XP</p>
            </div>

            {/* 1 место */}
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-6 text-center text-white transform md:scale-110">
              <div className="text-6xl mb-3">🥇</div>
              <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
                {topPlayers[0].username[0].toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold mb-1">{topPlayers[0].username}</h3>
              <p className="text-xl font-semibold">Уровень {topPlayers[0].level}</p>
              <p className="opacity-90">{topPlayers[0].experience} XP</p>
            </div>

            {/* 3 место */}
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-6 text-center text-white transform md:translate-y-8">
              <div className="text-5xl mb-3">🥉</div>
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                {topPlayers[2].username[0].toUpperCase()}
              </div>
              <h3 className="text-xl font-bold mb-1">{topPlayers[2].username}</h3>
              <p className="text-lg font-semibold">Уровень {topPlayers[2].level}</p>
              <p className="text-sm opacity-90">{topPlayers[2].experience} XP</p>
            </div>
          </div>
        )}

        {/* Остальные места */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Место</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Игрок</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Уровень</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Опыт</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Баллы</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Загрузка...
                    </td>
                  </tr>
                ) : topPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Нет данных
                    </td>
                  </tr>
                ) : (
                  topPlayers.slice(3).map((player, index) => {
                    const rank = index + 4;
                    return (
                      <tr key={player.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-gray-700">#{rank}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {player.username[0].toUpperCase()}
                            </div>
                            <span className="font-semibold">{player.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                            Ур. {player.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          {player.experience.toLocaleString()} XP
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-yellow-600">
                          💰 {player.bonus_points.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
