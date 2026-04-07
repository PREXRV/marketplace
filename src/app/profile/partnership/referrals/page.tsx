'use client';

import { useState, useEffect } from 'react';
import { partnershipAPI } from '@/services/api';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Copy, Check, Users, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReferralsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await partnershipAPI.getReferrals();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Скопировано!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Нет данных</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        <Link href="/profile/partnership" className="text-primary hover:underline mb-4 inline-block text-sm md:text-base">
          ← Назад
        </Link>

        <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">🤝 Реферальная программа</h1>

        {/* Stats — адаптивная сетка */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              <p className="text-gray-600 text-xs md:text-sm">Всего рефералов</p>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{data.total_referrals}</p>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              <p className="text-gray-600 text-xs md:text-sm">Заработано</p>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{data.total_earnings}₽</p>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              <p className="text-gray-600 text-xs md:text-sm">Средний доход</p>
            </div>
            <p className="text-2xl md:text-3xl font-bold">
              {data.total_referrals > 0 
                ? Math.round(parseFloat(data.total_earnings) / data.total_referrals) 
                : 0}₽
            </p>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl mb-8 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Ваша реферальная ссылка</h2>
          <p className="text-sm md:text-base opacity-90 mb-4 md:mb-6">
            Поделитесь этой ссылкой и получайте бонусы за каждого приглашенного партнера!
          </p>
          
          <div className="bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4 mb-3 md:mb-4">
            <p className="text-xs md:text-sm opacity-75 mb-1 md:mb-2">Реферальный код:</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <code className="text-lg md:text-2xl font-bold font-mono break-all">{data.referral_code}</code>
              <button
                onClick={() => copyToClipboard(data.referral_code)}
                className="bg-white text-purple-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {copied ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Copy className="w-4 h-4 md:w-5 md:h-5" />}
                {copied ? 'Скопировано' : 'Копировать'}
              </button>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4">
            <p className="text-xs md:text-sm opacity-75 mb-1 md:mb-2">Полная ссылка:</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <code className="text-xs md:text-sm flex-1 break-all">{data.referral_link}</code>
              <button
                onClick={() => copyToClipboard(data.referral_link)}
                className="bg-white text-purple-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {copied ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Copy className="w-4 h-4 md:w-5 md:h-5" />}
                Копировать
              </button>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl mb-8 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">Мои рефералы</h2>
          {data.referrals.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <Users className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-gray-400" />
              <p className="text-gray-600 text-base md:text-lg">У вас пока нет рефералов</p>
              <p className="text-gray-500 text-sm md:text-base mt-2">Поделитесь своей ссылкой чтобы пригласить других!</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {data.referrals.map((referral: any) => (
                <div key={referral.id} className="border rounded-lg md:rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-base md:text-lg">{referral.username}</h3>
                      <p className="text-xs md:text-sm text-gray-600 break-all">{referral.email}</p>
                      <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                        Присоединился: {new Date(referral.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs md:text-sm text-gray-600">Видео</p>
                      <p className="text-xl md:text-2xl font-bold text-purple-600">{referral.total_videos}</p>
                      <p className="text-[10px] md:text-xs text-gray-500 mt-1">{referral.total_views} просмотров</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Rewards */}
        {data.recent_rewards.length > 0 && (
          <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl">
            <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">Последние награды</h2>
            <div className="space-y-3 md:space-y-4">
              {data.recent_rewards.map((reward: any) => (
                <div key={reward.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 bg-green-50 rounded-lg md:rounded-xl">
                  <div>
                    <p className="font-bold text-base md:text-lg">+{reward.amount}₽</p>
                    <p className="text-xs md:text-sm text-gray-600">{reward.reason}</p>
                    <p className="text-[10px] md:text-xs text-gray-500">
                      От: {reward.referred_username}
                    </p>
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">
                    {new Date(reward.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}