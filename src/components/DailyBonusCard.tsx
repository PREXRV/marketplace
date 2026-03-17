'use client';

import { useState } from 'react';
import { useGamification } from '@/context/GamificationContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DailyBonusCard() {
  const { dailyBonus, refreshDailyBonus, refreshStats } = useGamification();
  const { tokens } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState('');

  const handleClaim = async () => {
    if (!tokens || !dailyBonus?.can_claim || claiming) return;

    setClaiming(true);
    setMessage('');

    try {
      const result = await api.claimDailyBonus(tokens.access);
      toast.success(`🎉 Получено ${result.bonus.bonus_points} баллов! Серия: ${result.bonus.streak_day}`);
      await Promise.all([refreshDailyBonus(), refreshStats()]);
    } catch (error: any) {
      toast.error(error.message || 'Не удалось получить бонус');
    } finally {
      setClaiming(false);
    }
  };

  if (!dailyBonus) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-16 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold">🎁 Ежедневный бонус</h3>
          <p className="opacity-90">Не пропусти свой бонус!</p>
        </div>
        <div className="text-4xl font-bold">
          {dailyBonus.streak_days}
        </div>
      </div>

      <div className="text-center">
        <p className="text-xl mb-4">
          Следующий бонус: <span className="text-3xl font-bold">{dailyBonus.next_bonus}</span> 💰
        </p>

        {dailyBonus.can_claim ? (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full bg-white text-yellow-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
          >
            {claiming ? 'Получение...' : 'Получить бонус! 🎉'}
          </button>
        ) : (
          <div className="bg-white/20 backdrop-blur px-6 py-4 rounded-2xl">
            <p className="text-lg font-bold">✅ Получено сегодня!</p>
            <p className="opacity-90">Возвращайся завтра за большим бонусом</p>
          </div>
        )}
      </div>

      {message && (
        <div className="mt-4 p-3 bg-white/20 rounded-xl text-center">
          {message}
        </div>
      )}
    </div>
  );
}
