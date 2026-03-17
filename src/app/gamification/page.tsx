'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LevelCard from '@/components/LevelCard';
import DailyBonusCard from '@/components/DailyBonusCard';
import { useGamification } from '@/context/GamificationContext';
import Link from 'next/link';

export default function GamificationPage() {
  const { myQuests, loading } = useGamification();
  const [activeTab, setActiveTab] = useState<'quests' | 'rewards' | 'leaderboard'>('quests');

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <div className="mb-6 text-sm text-gray-600 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition">Главная</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Геймификация</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">🎮 Игровой профиль</h1>

        {/* Карточки */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <LevelCard />
          </div>
          <div>
            <DailyBonusCard />
          </div>
        </div>

        {/* Табы */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('quests')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'quests'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🎯 Квесты
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'rewards'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🏆 Награды
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'leaderboard'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              👑 Лидерборд
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'quests' && (
              <div>
                {loading ? (
                  <p className="text-center text-gray-600">Загрузка квестов...</p>
                ) : myQuests.length === 0 ? (
                  <p className="text-center text-gray-600">Нет активных квестов</p>
                ) : (
                  <div className="space-y-4">
                    {myQuests.map((userQuest) => (
                      <div
                        key={userQuest.id}
                        className="border rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{userQuest.quest.name}</h3>
                            <p className="text-sm text-gray-600">{userQuest.quest.description}</p>
                          </div>
                          {userQuest.is_completed && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                              ✅ Выполнен
                            </span>
                          )}
                        </div>

                        {/* Прогресс */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Прогресс: {userQuest.progress} / {userQuest.quest.target_value}</span>
                            <span>{Math.round(userQuest.progress_percent)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-full rounded-full transition-all"
                              style={{ width: `${userQuest.progress_percent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Награды */}
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-600">⚡ +{userQuest.quest.experience_reward} XP</span>
                          <span className="text-yellow-600">💰 +{userQuest.quest.bonus_points_reward} баллов</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">🏆</p>
                <h3 className="text-xl font-bold mb-2">Магазин наград</h3>
                <p className="text-gray-600 mb-6">Обменивай баллы на крутые награды!</p>
                <Link
                  href="/gamification/rewards"
                  className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  Перейти в магазин
                </Link>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">👑</p>
                <h3 className="text-xl font-bold mb-2">Таблица лидеров</h3>
                <p className="text-gray-600 mb-6">Соревнуйся с другими игроками!</p>
                <Link
                  href="/gamification/leaderboard"
                  className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  Посмотреть лидерборд
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
