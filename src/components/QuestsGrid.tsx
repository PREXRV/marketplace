'use client';

import { useGamification } from '@/context/GamificationContext';

export default function QuestsGrid() {
  const { myQuests, loading } = useGamification();

  if (loading) return <div className="animate-pulse">Загрузка квестов...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6">🎯 Активные квесты</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myQuests?.length ? (
          myQuests.map(quest => (
            <div key={quest.id} className="border rounded-xl p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold mb-2">{quest.quest.name}</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                  style={{ width: `${quest.progress_percent}%` }}
                />
              </div>
              <p className="text-sm opacity-75 mb-3">
                {quest.progress} / {quest.quest.target_value}
              </p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl font-medium">
                {quest.is_completed ? 'Завершено! ✅' : 'Выполнить'}
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 opacity-50">
            <p className="text-xl mb-4">Нет активных квестов</p>
            <p>Совершайте покупки и оставляйте отзывы!</p>
          </div>
        )}
      </div>
    </div>
  );
}
