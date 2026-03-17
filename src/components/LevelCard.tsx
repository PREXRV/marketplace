'use client';

import { useGamification } from '@/context/GamificationContext';

export default function LevelCard() {
  const { userLevel, stats, loading } = useGamification();

  // ✅ Безопасная проверка данных
  if (loading || !userLevel || !stats) {
    return (
      <div className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl animate-pulse">
        <div className="h-24 bg-white/20 rounded-xl mb-6"></div>
        <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
        <div className="h-2 bg-white/20 rounded-full mb-6"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-white/20 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ Безопасные значения с fallback
  const level = userLevel.level || 1;
  const experience = userLevel.experience || 0;
  const bonusPoints = stats.bonus_points || 0;
  const totalQuests = stats.total_quests_completed || 0;
  const badgesCount = stats.badges_count || 0;
  const dailyStreak = stats.daily_streak || 0;
  const rank = stats.rank || 0;
  const progressPercent = Math.min((userLevel.progress_percent || 0), 100);

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl border border-white/20">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <div className="text-4xl font-black bg-white/20 px-4 py-2 rounded-2xl">
              Ур. {level}
            </div>
            <span className="text-2xl opacity-90">({totalQuests} квестов)</span>
          </div>
          <p className="text-lg opacity-90">
            Опыт: {experience.toLocaleString()}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm opacity-80 mb-1">Баллы</p>
          <div className="text-4xl font-black bg-white/20 px-6 py-3 rounded-2xl">
            💰 {bonusPoints.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Прогресс бар */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-3 opacity-90">
          <span>Текущий: {experience.toLocaleString()}</span>
          <span>До следующего: {(userLevel.next_level_exp || 0).toLocaleString()}</span>
        </div>
        <div className="relative">
          <div className="w-full bg-white/20 rounded-full h-4"></div>
          <div 
            className="absolute top-0 left-0 h-4 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full shadow-lg transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
          </div>
        </div>
        <p className="text-center text-sm mt-2 opacity-80">
          {Math.round(progressPercent)}% до уровня {level + 1}
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-white/10 backdrop-blur rounded-xl">
          <div className="text-2xl font-bold mb-1">{totalQuests}</div>
          <div className="text-xs opacity-80">Квестов</div>
        </div>
        <div className="text-center p-4 bg-white/10 backdrop-blur rounded-xl">
          <div className="text-2xl font-bold mb-1">{badgesCount}</div>
          <div className="text-xs opacity-80">Бейджей</div>
        </div>
        <div className="text-center p-4 bg-white/10 backdrop-blur rounded-xl">
          <div className="text-2xl font-bold mb-1">{dailyStreak}</div>
          <div className="text-xs opacity-80">Дней подряд</div>
        </div>
        <div className="text-center p-4 bg-white/10 backdrop-blur rounded-xl">
          <div className="text-2xl font-bold mb-1">#{rank || '—'}</div>
          <div className="text-xs opacity-80">Ранг</div>
        </div>
      </div>
    </div>
  );
}
