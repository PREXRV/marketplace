'use client';

import { useEffect, useState } from 'react';
import { api, GamificationProfile as GamificationProfileType, RewardItem, UserBadge, RewardPurchase, AllUserTags } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { gamificationAPI } from '@/services/api';
import OptimizedImage from '@/components/OptimizedImage';

export default function GamificationProfile() {
  const { isAuthenticated, tokens } = useAuth();
  const [profile, setProfile] = useState<GamificationProfileType | null>(null);
  const [shopItems, setShopItems] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'quests' | 'shop' | 'badges'>('overview');
  const [questsTab, setQuestsTab] = useState<'daily' | 'weekly' | 'achievements'>('daily');
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated && tokens?.access) {
      loadProfile();
      loadShop();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, tokens]);

  // Обработчик переключения вкладок
  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      setActiveTab(e.detail);
    };
    
    window.addEventListener('switchTab', handleSwitchTab);
    
    return () => {
      window.removeEventListener('switchTab', handleSwitchTab);
    };
  }, []);

  const loadProfile = async () => {
    if (!tokens?.access) {
      setError('Токен авторизации не найден');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getGamificationProfile(tokens.access);
      setProfile(data);
    } catch (error: any) {
      console.error('Failed to load gamification profile:', error);
      setError(error.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadShop = async () => {
    try {
      const res = await gamificationAPI.getAchievements();
      const data = res.data;
      setShopItems(data);
    } catch (error) {
      console.error('Failed to load shop:', error);
    }
  };

  const handlePurchase = async (item: RewardItem) => {
    if (!tokens || purchasing) return;

    if (!confirm(`Купить "${item.name}" за ${item.cost} 💎?`)) return;

    try {
      setPurchasing(item.id);
      const result = await api.purchaseReward(item.id, tokens.access);
      
      alert(`✅ Куплено! ${result.promo_code ? `Ваш промокод: ${result.promo_code}` : ''}`);
      
      // Обновить данные
      loadProfile();
      loadShop();
      
      // Переключить на вкладку наград если купили значок
      if (item.item_type === 'user_tag') {
        setActiveTab('badges');
      }
      
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    } finally {
      setPurchasing(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-gray-600 text-lg font-medium">Войдите, чтобы увидеть геймификацию</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка геймификации...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-bold text-red-900 mb-2">Ошибка загрузки</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button onClick={loadProfile} className="btn-primary">
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
        <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-yellow-900 font-medium">Данные геймификации недоступны</p>
      </div>
    );
  }

  const { level_info, quests, personal_promo_codes, history } = profile;

  // Группировка товаров магазина
  const groupedItems = {
    promo_code: shopItems.filter(i => i.item_type === 'promo_code'),
    badge: shopItems.filter(i => i.item_type === 'user_tag'),
    free_product: shopItems.filter(i => i.item_type === 'free_product'),
  };

  return (
    <div className="space-y-6">
      {/* Уровень и опыт (всегда видно) */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">Уровень {level_info.level}</h2>
            <p className="text-purple-100">
              {level_info.experience} / {level_info.experience_needed} XP
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{level_info.bonus_points}</div>
            <div className="text-sm text-purple-100">💎 Баллов</div>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="bg-white/20 rounded-full h-4 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${level_info.progress_percent}%` }}
          />
        </div>
        <p className="text-sm text-purple-100 mt-2 text-center">
          {level_info.progress_percent}% до следующего уровня
        </p>

        {/* Награда за следующий уровень */}
        {level_info.next_level_reward && (
          <div className="mt-4 bg-white/10 rounded-lg p-3 text-center">
            <p className="text-sm text-purple-100 mb-1">🎁 Награда за уровень {level_info.level + 1}:</p>
            <div className="flex items-center justify-center gap-4">
              <span className="font-semibold">💎 {level_info.next_level_reward.bonus_points} баллов</span>
              {level_info.next_level_reward.promo_discount && (
                <span className="font-semibold">🎟️ Промокод -{level_info.next_level_reward.promo_discount}%</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Табы навигации */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'overview'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📊 Обзор
          </button>
          <button
            onClick={() => setActiveTab('quests')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'quests'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📋 Задания
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'shop'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            🏪 Магазин
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'badges'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            🏅 Мои награды
          </button>
        </div>

        <div className="p-6">
          {/* ОБЗОР */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Персональные промокоды */}
              {personal_promo_codes.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">🎟️ Ваши промокоды</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personal_promo_codes.map((promo) => (
                      <div
                        key={promo.id}
                        className="border-2 border-dashed border-primary rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-2xl text-primary">{promo.code}</span>
                          <span className="bg-primary text-white px-3 py-1 rounded-full font-bold">
                            -{promo.discount_value}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{promo.reason}</p>
                        <p className="text-xs text-gray-500">
                          Действует до {new Date(promo.end_date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* История */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* История опыта */}
                <div>
                  <h3 className="text-lg font-bold mb-4">⭐ История опыта</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.experience.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">История пуста</p>
                    ) : (
                      history.experience.map((log, index) => (
                        <div key={index} className="flex items-center justify-between text-sm py-2 border-b">
                          <span className="text-gray-600">{log.reason}</span>
                          <span className="font-bold text-green-600">+{log.amount} XP</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* История баллов */}
                <div>
                  <h3 className="text-lg font-bold mb-4">💎 История баллов</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.bonus_points.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">История пуста</p>
                    ) : (
                      history.bonus_points.map((log, index) => (
                        <div key={index} className="flex items-center justify-between text-sm py-2 border-b">
                          <span className="text-gray-600">{log.reason}</span>
                          <span
                            className={`font-bold ${
                              log.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {log.amount > 0 ? '+' : ''}{log.amount}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ЗАДАНИЯ */}
          {activeTab === 'quests' && (
            <div>
              <h3 className="text-2xl font-bold mb-4">📋 Задания</h3>

              {/* Подтабы */}
              <div className="flex gap-2 mb-6 border-b">
                <button
                  onClick={() => setQuestsTab('daily')}
                  className={`px-4 py-2 font-medium transition ${
                    questsTab === 'daily'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ежедневные ({quests.daily.length})
                </button>
                <button
                  onClick={() => setQuestsTab('weekly')}
                  className={`px-4 py-2 font-medium transition ${
                    questsTab === 'weekly'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Еженедельные ({quests.weekly.length})
                </button>
                <button
                  onClick={() => setQuestsTab('achievements')}
                  className={`px-4 py-2 font-medium transition ${
                    questsTab === 'achievements'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Достижения
                </button>
              </div>

              {/* Список заданий */}
              <div className="space-y-3">
                {quests[questsTab].length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Нет активных заданий</p>
                ) : (
                  quests[questsTab].map((userQuest) => (
                    <div
                      key={userQuest.id}
                      className={`border-2 rounded-xl p-4 transition ${
                        userQuest.is_completed
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Иконка */}
                        <div className="text-4xl">{userQuest.quest.icon}</div>

                        <div className="flex-1">
                          {/* Название */}
                          <h4 className="font-bold text-lg mb-1">{userQuest.quest.name}</h4>
                          <p className="text-gray-600 text-sm mb-3">{userQuest.quest.description}</p>

                          {/* Прогресс */}
                          <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Прогресс:</span>
                              <span className="font-medium">
                                {userQuest.progress} / {userQuest.quest.condition_value}
                              </span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  userQuest.is_completed ? 'bg-green-500' : 'bg-primary'
                                }`}
                                style={{ width: `${userQuest.progress_percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Награды */}
                          <div className="flex flex-wrap gap-2 text-sm">
                            {userQuest.quest.experience_reward > 0 && (
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                ⭐ {userQuest.quest.experience_reward} XP
                              </span>
                            )}
                            {userQuest.quest.bonus_points_reward > 0 && (
                              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                                💎 {userQuest.quest.bonus_points_reward} баллов
                              </span>
                            )}
                            {userQuest.quest.promo_code_discount > 0 && (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                🎟️ -{userQuest.quest.promo_code_discount}%
                              </span>
                            )}
                          </div>

                          {/* Время истечения */}
                          {userQuest.time_left && !userQuest.is_completed && (
                            <p className="text-xs text-orange-600 mt-2">⏰ {userQuest.time_left}</p>
                          )}

                          {/* Статус выполнения */}
                          {userQuest.is_completed && (
                            <div className="mt-2 inline-flex items-center gap-1 text-green-600 font-medium text-sm">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Выполнено!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* МАГАЗИН */}
          {activeTab === 'shop' && (
            <div className="space-y-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">🏪 Магазин наград</h3>
                <p className="text-gray-600">
                  У вас: <span className="font-bold text-primary text-xl">{level_info.bonus_points} 💎</span>
                </p>
              </div>

              {/* Промокоды */}
              {groupedItems.promo_code.length > 0 && (
                <div>
                  <h4 className="text-xl font-bold mb-4">🎟️ Промокоды</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedItems.promo_code.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:border-primary transition"
                      >
                        <div className="text-4xl mb-3">{item.icon}</div>
                        <h5 className="font-bold text-lg mb-2">{item.name}</h5>
                        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">{item.cost} 💎</span>
                          
                          <button
                            onClick={() => handlePurchase(item)}
                            disabled={!item.available || purchasing === item.id || level_info.bonus_points < item.cost}
                            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {purchasing === item.id ? 'Покупка...' : 'Купить'}
                          </button>
                        </div>
                        
                        {!item.available && (
                          <p className="text-red-500 text-sm mt-2">Недоступно</p>
                        )}
                        {level_info.bonus_points < item.cost && item.available && (
                          <p className="text-orange-500 text-sm mt-2">Недостаточно баллов</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Значки */}
              {groupedItems.badge.length > 0 && (
                <div>
                  <h4 className="text-xl font-bold mb-4">🏅 Значки и титулы</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedItems.badge.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:border-primary transition"
                      >
                        <div className="mb-4">
                          <span
                            className="inline-block px-4 py-2 rounded-full font-bold text-lg"
                            style={{
                              backgroundColor: item.badge_color,
                              color: item.badge_text_color,
                            }}
                          >
                            {item.icon} {item.tag_name || item.name}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">{item.cost} 💎</span>
                          
                          <button
                            onClick={() => handlePurchase(item)}
                            disabled={!item.available || purchasing === item.id || level_info.bonus_points < item.cost}
                            className="btn-primary text-sm disabled:opacity-50"
                          >
                            {purchasing === item.id ? 'Покупка...' : 'Купить'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Бесплатные товары */}
              {groupedItems.free_product.length > 0 && (
                <div>
                  <h4 className="text-xl font-bold mb-4">🎁 Бесплатные товары</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedItems.free_product.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:border-primary transition"
                      >
                        {item.image && (
                          <OptimizedImage
                            src={item.image}
                            alt={item.name}
                            width={400}
                            height={200}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        
                        <div className="text-4xl mb-3">{item.icon}</div>
                        <h5 className="font-bold text-lg mb-2">{item.name}</h5>
                        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                        
                        {item.stock > 0 && (
                          <p className="text-sm text-orange-600 mb-2">
                            Осталось: {item.stock - item.purchased_count}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">{item.cost} 💎</span>
                          
                          <button
                            onClick={() => handlePurchase(item)}
                            disabled={!item.available || purchasing === item.id || level_info.bonus_points < item.cost}
                            className="btn-primary text-sm disabled:opacity-50"
                          >
                            {purchasing === item.id ? 'Покупка...' : 'Получить'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shopItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Магазин пуст. Скоро появятся новые награды!</p>
                </div>
              )}
            </div>
          )}

          {/* МОИ НАГРАДЫ */}
          {activeTab === 'badges' && (
            <MyBadgesSection token={tokens?.access || ''} onUpdate={loadProfile} />
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== КОМПОНЕНТ ДЛЯ УПРАВЛЕНИЯ ЗНАЧКАМИ ====================

interface MyBadgesSectionProps {
  token: string;
  onUpdate: () => void;
}

function MyBadgesSection({ token, onUpdate }: MyBadgesSectionProps) {
  const [allTags, setAllTags] = useState<AllUserTags | null>(null);
  const [purchases, setPurchases] = useState<RewardPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | number | null>(null);

  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [tagsData, purchasesData] = await Promise.all([
        api.getMyAllTags(token),
        api.getMyPurchases(token),
      ]);
      setAllTags(tagsData);
      setPurchases(purchasesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBadge = async (badgeId: number) => {
    try {
      setToggling(badgeId);
      await api.toggleBadge(token, badgeId);
      await loadAllData();
      onUpdate();
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!allTags) return null;

  return (
    <div className="space-y-8">
      {/* Все значки (админские + купленные) */}
      {allTags.all_badges.length > 0 && (
        <div>
          <h4 className="text-xl font-bold mb-4">✨ Все мои значки</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTags.all_badges.map((badge: any) => {
              const isAdminTag = badge.type === 'admin_tag';
              const badgeId = badge.id;
              
              return (
                <div
                  key={badgeId}
                  className={`bg-white rounded-xl p-6 shadow-md border-2 transition ${
                    badge.is_active
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="mb-4">
                    <span
                      className="inline-block px-4 py-2 rounded-full font-bold text-lg"
                      style={{
                        backgroundColor: badge.badge_color,
                        color: badge.badge_text_color,
                      }}
                    >
                      {badge.badge_icon} {badge.badge_name}
                    </span>
                    
                    {isAdminTag && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        👑 Админ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {isAdminTag ? 'Выдан администратором' : `Получен: ${new Date(badge.obtained_at).toLocaleDateString('ru-RU')}`}
                    </div>
                    
                    {!isAdminTag && (
                      <button
                        onClick={() => handleToggleBadge(badge.id as number)}
                        disabled={toggling === badge.id}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          badge.is_active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-primary text-white hover:bg-blue-700'
                        }`}
                      >
                        {toggling === badge.id
                          ? '⏳'
                          : badge.is_active
                          ? '❌ Скрыть'
                          : '✅ Показать'}
                      </button>
                    )}
                  </div>

                  {badge.is_active && (
                    <div className="mt-3 text-sm text-green-600 font-medium">
                      ✓ Отображается в профиле и отзывах
                    </div>
                  )}
                  
                  {isAdminTag && (
                    <div className="mt-3 text-xs text-gray-500 italic">
                      Админские значки отображаются всегда
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Совет:</strong> Активные значки отображаются рядом с вашим именем в профиле и отзывах. 
              Админские значки (👑) отображаются всегда и не могут быть скрыты.
            </p>
          </div>
        </div>
      )}

      {/* История покупок */}
      {purchases.length > 0 && (
        <div>
          <h4 className="text-xl font-bold mb-4">📦 История покупок</h4>
          <div className="space-y-3">
            {purchases.map((purchase) => (
  <div
    key={purchase.id}
    className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{purchase.reward?.icon || '🎁'}</div>
        
        <div>
          <h5 className="font-bold text-lg">{purchase.reward?.name || 'Награда'}</h5>
          <p className="text-gray-600 text-sm mb-2">
            {purchase.reward?.description || ''}
          </p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              {new Date(purchase.created_at).toLocaleDateString('ru-RU')}
            </span>
            
            {purchase.reward?.item_type === 'user_tag' ? (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                🏅 Значок
              </span>
            ) : purchase.reward?.item_type === 'promo_code' ? (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                🎟️ Промокод
              </span>
            ) : (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                🎁 Товар
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-2xl font-bold text-primary">{purchase.cost} 💎</div>
        {purchase.is_used ? (
          <span className="text-sm text-gray-500">Использовано</span>
        ) : (
          <span className="text-sm text-green-600 font-medium">Активно</span>
        )}
      </div>
    </div>
  </div>
))}
          </div>
        </div>
      )}

      {/* Пустое состояние */}
      {allTags.all_badges.length === 0 && purchases.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎁</div>
          <h4 className="text-xl font-bold text-gray-700 mb-2">
            У вас пока нет наград
          </h4>
          <p className="text-gray-600 mb-6">
            Покупайте значки в магазине или получайте их от администрации!
          </p>
          <button
            onClick={() => {
              const event = new CustomEvent('switchTab', { detail: 'shop' });
              window.dispatchEvent(event);
            }}
            className="btn-primary"
          >
            🏪 Перейти в магазин
          </button>
        </div>
      )}
    </div>
  );
}
