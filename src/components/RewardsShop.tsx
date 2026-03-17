'use client';

import { useGamification } from '@/context/GamificationContext';

export default function RewardsShop() {
  const { rewards } = useGamification();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6">🛒 Магазин наград</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards?.slice(0, 6).map(reward => (
          <div key={reward.id} className="border rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="font-bold mb-2">{reward.name}</h3>
            <p className="opacity-75 mb-4 text-sm">{reward.description}</p>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">
                {reward.cost} 💰
              </div>
              <button 
                className="bg-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-purple-700"
                disabled={reward.stock <= 0}
              >
                {reward.stock > 0 ? 'Купить' : 'Нет в наличии'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
