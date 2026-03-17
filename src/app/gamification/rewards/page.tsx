'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGamification } from '@/context/GamificationContext';
import { useAuth } from '@/context/AuthContext';
import { api, RewardItem } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function RewardsPage() {
  const { stats, refreshStats } = useGamification();
  const { tokens } = useAuth();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    loadRewards();
  }, [tokens]);

  const loadRewards = async () => {
    if (!tokens) return;

    try {
      setLoading(true);
      const data = await api.getRewards(tokens.access);
      setRewards(data);
    } catch (error) {
      console.error('Error loading rewards:', error);
      toast.error('Не удалось загрузить награды');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (reward: RewardItem) => {
    if (!tokens || !stats) return;

    if (stats.bonus_points < reward.cost) {
      toast.error('Недостаточно баллов!');
      return;
    }

    setPurchasing(reward.id);

    try {
      const result = await api.purchaseReward(reward.id, tokens.access);
      toast.success(`🎉 ${result.detail}`);
      await Promise.all([loadRewards(), refreshStats()]);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка покупки');
    } finally {
      setPurchasing(null);
    }
  };

  const getItemTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      user_tag: '🏷️ Тег профиля',
      promo_code: '🎟️ Промокод',
      free_product: '🎁 Товар',
      bonus_points: '💰 Баллы',
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <div className="mb-6 text-sm text-gray-600 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition">Главная</Link>
          <span>›</span>
          <Link href="/gamification" className="hover:text-primary transition">Геймификация</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Магазин наград</span>
        </div>

        {/* Шапка */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🏆 Магазин наград</h1>
              <p className="text-lg opacity-90">Обменяй баллы на крутые награды!</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Ваши баллы</p>
              <p className="text-4xl font-bold">💰 {stats?.bonus_points || 0}</p>
            </div>
          </div>
        </div>

        {/* Список наград */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Нет доступных наград</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const canAfford = stats ? stats.bonus_points >= reward.cost : false;

              return (
                <div
                  key={reward.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  {/* Изображение */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100">
                    {reward.image ? (
                      <Image
                        src={reward.image}
                        alt={reward.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🎁
                      </div>
                    )}
                    {/* Бейдж типа */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">
                      {getItemTypeLabel(reward.item_type)}
                    </div>
                  </div>

                  {/* Контент */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{reward.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{reward.description}</p>

                    {/* Запас */}
                    {reward.stock > 0 && reward.stock <= 10 && (
                      <p className="text-sm text-orange-600 mb-3">
                        ⚠️ Осталось всего {reward.stock} шт.
                      </p>
                    )}

                    {/* Цена и кнопка */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-primary">
                          💰 {reward.cost}
                        </p>
                        <p className="text-xs text-gray-500">баллов</p>
                      </div>

                      <button
                        onClick={() => handlePurchase(reward)}
                        disabled={!canAfford || !reward.available || purchasing === reward.id}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${
                          canAfford && reward.available
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {purchasing === reward.id ? (
                          'Покупка...'
                        ) : !reward.available ? (
                          'Недоступно'
                        ) : !canAfford ? (
                          'Мало баллов'
                        ) : (
                          'Купить'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
