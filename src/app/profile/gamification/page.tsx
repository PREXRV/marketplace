'use client';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, RewardItem } from '@/lib/api';
import {
  Trophy, Target, Gift, Sparkles, Zap,
  Star, ChevronRight, ShoppingBag,
  Calendar, TrendingUp, Flame, Package,
  CheckCircle, Clock, Users, Video, ExternalLink, Tag, Ticket
} from 'lucide-react';

type TabType = 'daily' | 'weekly' | 'special' | 'rewards' | 'purchases';

const PlatformIcon = ({ platform }: { platform: string }) => {
  const icons: Record<string, { color: string; svg: JSX.Element }> = {
    telegram: {
      color: 'from-blue-400 to-blue-600',
      svg: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M23.55 3.39a1.2 1.2 0 0 0-1.24-.17L2.8 11.05c-.5.2-.48.92.03 1.1l4.95 1.64 1.9 6.1c.15.5.8.64 1.14.24l2.76-3.25 4.98 3.66c.48.35 1.16.08 1.27-.5l3.84-15.4a1.2 1.2 0 0 0-.12-.95ZM9.03 13.2l9.67-6.1c.17-.1.35.13.2.27l-8 7.2a1.1 1.1 0 0 0-.34.6l-.3 2.27c-.03.2-.31.24-.39.05l-1.23-3.08a1.1 1.1 0 0 1 .39-1.21Z" />
        </svg>
      ),
    },
    youtube: {
      color: 'from-red-500 to-red-700',
      svg: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.4.53A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.9.53 9.4.53 9.4.53s7.5 0 9.4-.53a3 3 0 0 0 2.1-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.7V8.3l6.5 3.7-6.5 3.7Z" />
        </svg>
      ),
    },
    tiktok: {
      color: 'from-gray-800 to-black',
      svg: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M14.2 2h3.05c.22 1.18.9 2.33 1.86 3.16A5.38 5.38 0 0 0 22 6.42v3.02a8.58 8.58 0 0 1-4.75-1.43v6.2a6.2 6.2 0 1 1-6.2-6.2c.38 0 .76.04 1.12.1v3.1a3.08 3.08 0 1 0 2.03 2.9V2Z" />
        </svg>
      ),
    },
    vk: {
      color: 'from-blue-500 to-blue-700',
      svg: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M12.79 17.6h1.42s.43-.05.65-.28c.2-.22.2-.63.2-.63s-.03-1.92.86-2.2c.88-.28 2 1.86 3.2 2.68.9.6 1.58.47 1.58.47l3.17-.04s1.66-.1.87-1.4c-.06-.11-.44-.93-2.25-2.61-1.9-1.77-1.64-1.48.64-4.52 1.39-1.85 1.95-2.98 1.77-3.46-.17-.45-1.2-.33-1.2-.33l-3.57.02s-.27-.04-.47.08c-.19.12-.3.39-.3.39s-.57 1.52-1.34 2.82c-1.63 2.75-2.28 2.9-2.55 2.72-.62-.4-.46-1.62-.46-2.49 0-2.7.4-3.83-.78-4.12-.39-.1-.68-.16-1.69-.17-1.28-.01-2.36 0-2.98.3-.41.2-.73.63-.54.65.24.03.8.15 1.1.57.38.54.37 1.74.37 1.74s.21 3.18-.5 3.58c-.5.27-1.18-.28-2.64-2.76-.75-1.27-1.31-2.68-1.31-2.68s-.1-.25-.29-.38a1.33 1.33 0 0 0-.54-.21l-3.39.02s-.5.01-.68.24c-.16.21-.01.65-.01.65s2.65 6.17 5.65 9.28c2.74 2.84 5.85 2.65 5.85 2.65Z" />
        </svg>
      ),
    },
    instagram: {
      color: 'from-pink-500 to-purple-600',
      svg: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.95 1.35a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 6.6A5.4 5.4 0 1 1 6.6 12 5.4 5.4 0 0 1 12 6.6Zm0 1.8A3.6 3.6 0 1 0 15.6 12 3.6 3.6 0 0 0 12 8.4Z" />
        </svg>
      ),
    },
    other: {
      color: 'from-gray-400 to-gray-600',
      svg: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
      ),
    },
  };

  const current = icons[platform] || icons.other;

  return (
    <div className={`flex h-5 w-5 items-center justify-center rounded-xl bg-gradient-to-br ${current.color} text-white shadow-sm`}>
      {current.svg}
    </div>
  );
};

const conditionIcon: Record<string, string> = {
  subscribe_social: '👥',
  view_content:     '👁️',
  engage_content:   '❤️',
  create_content:   '🎬',
  reviews:          '⭐',
  orders_count:     '🛒',
  orders_amount:    '💳',
  referrals:        '🔗',
};

const questTypeEmoji: Record<string, string> = {
  daily:   '🎯',
  weekly:  '🏆',
  special: '🔥',
  social:  '📱',
  content: '🎬',
};

export default function GamificationPage() {
  const { user, tokens, isAuthenticated } = useAuth();
  const router = useRouter();
  const [gamification, setGamification]         = useState<any>(null);
  const [rewards, setRewards]                   = useState<RewardItem[]>([]);
  const [purchases, setPurchases]               = useState<any[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [activeTab, setActiveTab]               = useState<TabType>('daily');
  const [purchasing, setPurchasing]             = useState<number | null>(null);
  const [freeProductModal, setFreeProductModal] = useState<any>(null);
  const [addingToCart, setAddingToCart]         = useState(false);
  const [clickingQuest, setClickingQuest]       = useState<number | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (tokens) loadData();
  }, [isAuthenticated, tokens]);

  const loadData = async () => {
    if (!tokens) return;
    try {
      const [profileData, rewardsData, purchasesData] = await Promise.all([
        api.getGamificationProfile(tokens.access).catch(() => null),
        api.getRewards(tokens.access).catch(() => []),
        api.getMyPurchases(tokens.access).catch(() => []),
      ]);
      setGamification(profileData);
      setRewards(rewardsData || []);
      setPurchases(Array.isArray(purchasesData) ? purchasesData : (purchasesData as any)?.results || []);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestClick = async (questId: number, actionLink: string) => {
    if (!tokens || clickingQuest === questId) return;
    setClickingQuest(questId);

    try {
      await api.clickQuest(questId, tokens.access); // ← только эта строка
      await loadData();
    } catch (e) {
      // игнор
    } finally {
      setClickingQuest(null);
    }

    window.open(actionLink, '_blank', 'noopener,noreferrer');
  };


  const handlePurchaseReward = async (rewardId: number) => {
    if (!tokens || purchasing) return;
    setPurchasing(rewardId);
    try {
      await api.purchaseReward(rewardId, tokens.access);
      alert('🎉 Награда успешно куплена!');
      await loadData();
      setActiveTab('purchases');
    } catch (error: any) {
      alert(error.message || 'Ошибка покупки');
    } finally {
      setPurchasing(null);
    }
  };

  const handleUse = async (purchase: any) => {
    if (!tokens) return;
    const reward = purchase.reward ?? purchase.reward_item;
    if (reward?.item_type === 'free_product') {
      setFreeProductModal(purchase);
      return;
    }
    try {
      const data = await api.useRewardPurchase(purchase.id, tokens.access);
      if (data.type === 'user_tag') {
        alert(`✅ ${data.detail}`);
        await loadData();
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка');
    }
  };

  const handleAddFreeToCart = async () => {
    if (!freeProductModal || addingToCart) return;
    setAddingToCart(true);
    try {
      const productData = freeProductModal.reward.free_product_data;
      addToCart({
        id: productData.id,
        name: productData.name,
        price: 0,
        image: productData.image || '',
        quantity: 1,
        is_free_reward: true,
        free_purchase_id: freeProductModal.id,
      });
      if (tokens) await api.useRewardPurchase(freeProductModal.id, tokens.access);
      setFreeProductModal(null);
      await loadData();
      router.push('/cart');
    } catch {
      alert('Ошибка добавления в корзину');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin" />
            <Trophy className="absolute inset-0 m-auto w-12 h-12 text-yellow-400" />
          </div>
          <p className="text-white text-xl">Загружаем твои достижения...</p>
        </div>
      </div>
    );
  }

  const levelInfo                = gamification?.level_info;
  const dailyQuests: any[]       = gamification?.quests?.daily        || [];
  const weeklyQuests: any[]      = gamification?.quests?.weekly       || [];
  // Особые = achievements + social + content — всё в одной вкладке
  const achievementQuests: any[] = [
    ...(gamification?.quests?.achievements || []),
    ...(gamification?.quests?.social       || []),
    ...(gamification?.quests?.content      || []),
  ];
  const completedQuests: any[]   = gamification?.quests?.completed    || [];

  const currentQuests =
    activeTab === 'daily'   ? dailyQuests
    : activeTab === 'weekly'  ? weeklyQuests
    : activeTab === 'special' ? achievementQuests
    : [];

  const tabConfig = [
    { id: 'daily'     as TabType, label: 'Ежедневные',   icon: Calendar,    count: dailyQuests.filter(q => !q.is_completed).length },
    { id: 'weekly'    as TabType, label: 'Еженедельные', icon: TrendingUp,  count: weeklyQuests.filter(q => !q.is_completed).length },
    { id: 'special'   as TabType, label: 'Особые',       icon: Flame,       count: achievementQuests.filter(q => !q.is_completed).length },
    { id: 'rewards'   as TabType, label: 'Магазин',      icon: ShoppingBag, count: rewards.filter(r => r.is_active && r.stock > 0).length },
    { id: 'purchases' as TabType, label: 'Мои покупки',  icon: Package,     count: purchases.filter(p => !p.is_used).length },
  ];

  const tabColors: Record<string, { active: string; hover: string }> = {
    daily:     { active: 'bg-blue-500 text-white',    hover: 'hover:bg-blue-50 text-gray-700' },
    weekly:    { active: 'bg-green-500 text-white',   hover: 'hover:bg-green-50 text-gray-700' },
    special:   { active: 'bg-orange-500 text-white',  hover: 'hover:bg-orange-50 text-gray-700' },
    rewards:   { active: 'bg-purple-500 text-white',  hover: 'hover:bg-purple-50 text-gray-700' },
    purchases: { active: 'bg-pink-500 text-white',    hover: 'hover:bg-pink-50 text-gray-700' },
  };

  const rewardTypeLabel: Record<string, string> = {
    promo_code:   '🎟️ Промокод',
    user_tag:     '🏷️ Значок',
    free_product: '🎁 Товар',
    bonus_points: '💰 Баллы',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ─── Hero ─── */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border-2 border-white/30">
                <Trophy className="w-10 h-10 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-5xl font-black mb-1">Уровень {levelInfo?.level || 1}</h1>
                <p className="text-xl opacity-90">{user?.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: Sparkles, label: 'Опыт',    value: levelInfo?.experience || 0,   color: 'text-yellow-300' },
                { icon: Zap,      label: 'Баллы',   value: levelInfo?.bonus_points || 0, color: 'text-yellow-300' },
                { icon: Target,   label: 'Квестов', value: completedQuests.length,        color: 'text-green-300' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-2xl font-bold">{value}</span>
                  </div>
                  <p className="text-sm opacity-80">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">До уровня {(levelInfo?.level || 1) + 1}</span>
                <span className="text-sm">{levelInfo?.experience || 0} / {levelInfo?.experience_needed || 1000}</span>
              </div>
              <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-full transition-all duration-1000"
                  style={{ width: `${levelInfo?.progress_percent || 0}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-center mt-2 opacity-80">
                {Math.round(levelInfo?.progress_percent || 0)}% завершено
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">

        {/* ─── Вкладки ─── */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-8">
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const colors = tabColors[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-bold transition-all ${isActive ? colors.active : colors.hover}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden sm:inline text-sm">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 ${isActive ? 'bg-white text-gray-900' : 'bg-red-500 text-white'} rounded-full text-xs font-bold flex items-center justify-center shadow-lg`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Квесты ─── */}
        {['daily', 'weekly', 'special'].includes(activeTab) && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">
                {activeTab === 'daily'   && 'Ежедневные квесты'}
                {activeTab === 'weekly'  && 'Еженедельные квесты'}
                {activeTab === 'special' && 'Особые квесты'}
              </h2>
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-bold">
                {currentQuests.filter((q: any) => !q.is_completed).length} активных
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentQuests.length > 0 ? currentQuests.map((item: any, index: number) => {
                const quest = item.quest || item;
                const hasAction = !!quest.action_link;
                const isClicking = clickingQuest === quest.id;
                const emoji = questTypeEmoji[quest.quest_type] || '⭐';

                return (
                  <div
                    key={item.id ?? quest.id ?? index}
                    className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative">

                      {item.is_completed && (
                        <div className="absolute -top-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <Star className="w-6 h-6 text-white fill-white" />
                        </div>
                      )}

                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg text-2xl relative">
                          {emoji}
                          {quest.social_platform && (
                            <div className="absolute -bottom-1 -right-1">
                              <PlatformIcon platform={quest.social_platform} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition truncate">{quest.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{quest.description || 'Выполните задание'}</p>
                          {quest.condition_type && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {conditionIcon[quest.condition_type] || '📋'} {quest.condition_type_display}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-700 font-medium">{item.progress ?? 0} / {quest.target_value ?? 1}</span>
                          <span className="text-blue-600 font-bold">{Math.round(item.progress_percent ?? 0)}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${item.progress_percent ?? 0}%` }}
                          />
                        </div>
                      </div>
                      {(quest.reward_tag || quest.reward_promo) && (
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl mt-3">
                          {quest.reward_tag && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-100 rounded-lg text-sm font-bold text-emerald-800">
                              🏷️ {quest.reward_tag.name}
                            </div>
                          )}
                          {quest.reward_promo && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg text-sm font-bold text-blue-800">
                              🎫 {quest.reward_promo.code}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="font-bold text-purple-600">+{quest.experience_reward ?? 0} XP</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold text-yellow-600">+{quest.bonus_points_reward ?? 0} 💰</span>
                        </div>
                      </div>

                      {item.is_completed ? (
                        <button disabled className="w-full mt-4 bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                          <Star className="w-5 h-5" /> Завершено!
                        </button>
                      ) : hasAction ? (
                        <button
                          onClick={() => handleQuestClick(quest.id, quest.action_link)}
                          disabled={isClicking}
                          className="w-full mt-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-sky-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200 disabled:opacity-70"
                        >
                          {isClicking
                            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <><ExternalLink className="w-5 h-5" /> {quest.action_button_label || 'Перейти'}</>
                          }
                        </button>
                      ) : (
                        <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 group">
                          Продолжить <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full text-center py-16">
                  <Gift className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                  <p className="text-xl text-gray-500 mb-2">Нет активных квестов</p>
                  <p className="text-gray-400">Следите за обновлениями!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Магазин наград ─── */}
        {activeTab === 'rewards' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Магазин наград</h2>
                <p className="text-gray-600">Потратьте баллы на уникальные награды!</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                💰 {levelInfo?.bonus_points || 0} баллов
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.length > 0 ? rewards.map((reward) => (
                <div key={reward.id} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-transparent hover:border-purple-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="relative p-6">
                    <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                      {reward.image
                        ? <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" />
                        : <span className="text-6xl">🎁</span>}
                    </div>
                    <h3 className="font-bold text-xl mb-2 group-hover:text-purple-600 transition">{reward.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                    <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
                      {rewardTypeLabel[reward.item_type] || '🎁 Награда'}
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Осталось: <span className="font-bold">{reward.stock}</span></p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-xl font-bold text-center text-xl shadow-lg">
                        {reward.cost} 💰
                      </div>
                      <button
                        onClick={() => handlePurchaseReward(reward.id)}
                        disabled={purchasing === reward.id || !reward.is_active || reward.stock <= 0 || (levelInfo?.bonus_points || 0) < reward.cost}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {purchasing === reward.id
                          ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Покупка...</span></div>
                          : (levelInfo?.bonus_points || 0) < reward.cost ? 'Не хватает'
                          : reward.stock <= 0 ? 'Нет в наличии'
                          : 'Купить'}
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-16">
                  <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                  <p className="text-xl text-gray-500 mb-2">Магазин пуст</p>
                  <p className="text-gray-400">Скоро появятся новые награды!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Мои покупки ─── */}
        {activeTab === 'purchases' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Мои покупки</h2>
                <p className="text-gray-600">Все приобретённые награды</p>
              </div>
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-bold">
                {purchases.length} покупок
              </span>
            </div>
            {purchases.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchases.map((purchase: any) => {
                  const reward  = purchase.reward ?? purchase.reward_item;
                  const isUsed  = purchase.is_used ?? false;
                  const isFree  = reward?.item_type === 'free_product';
                  const isTag   = reward?.item_type === 'user_tag';
                  const isPromo = reward?.item_type === 'promo_code';
                  return (
                    <div key={purchase.id}
                      className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all
                        ${isUsed ? 'border-gray-200 opacity-70' : 'border-pink-200 hover:border-pink-400 hover:shadow-xl'}`}
                    >
                      <div className={`absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold
                        ${isUsed ? 'bg-gray-100 text-gray-500' : isFree ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {isUsed
                          ? <><CheckCircle className="w-3 h-3 mr-1" />Использовано</>
                          : isFree ? <><ShoppingBag className="w-3 h-3 mr-1" />Можно получить</>
                          : <><Clock className="w-3 h-3 mr-1" />Активно</>}
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg text-3xl">
                        {isPromo && '🎟️'}{isTag && '🏷️'}{isFree && '🎁'}
                        {reward?.item_type === 'bonus_points' && '💰'}
                      </div>
                      <h3 className="font-bold text-xl mb-1 pr-24">{reward?.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{reward?.description}</p>
                      {reward?.free_product_data && (
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-3">
                          {reward.free_product_data.image && (
                            <img src={reward.free_product_data.image} alt={reward.free_product_data.name} className="w-12 h-12 object-cover rounded-lg" />
                          )}
                          <div>
                            <p className="font-semibold text-sm">{reward.free_product_data.name}</p>
                            <p className="text-xs text-gray-400 line-through">{reward.free_product_data.price} ₽</p>
                            <p className="text-xs text-green-600 font-bold">Бесплатно!</p>
                          </div>
                        </div>
                      )}
                      {reward?.user_tag_data && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 rounded-full text-sm font-bold"
                            style={{ backgroundColor: reward.user_tag_data.background_color, color: reward.user_tag_data.text_color }}>
                            {reward.user_tag_data.icon} {reward.user_tag_data.name}
                          </span>
                        </div>
                      )}
                      {isTag && !isUsed ? (
                        <button onClick={() => handleUse(purchase)}
                          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition">
                          🏷️ Надеть значок
                        </button>
                      ) : isTag ? (
                        <div className="w-full py-3 bg-emerald-100 text-emerald-800 rounded-xl text-center font-bold text-sm">
                          ✅ Тег уже надет
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mb-3">
                        <span className="font-bold text-orange-500">−{purchase.cost} 💰</span>
                        <span className="text-xs text-gray-400">
                          {new Date(purchase.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      {!isUsed && (
                        <div className="space-y-2">
                          {isFree && (
                            <button onClick={() => handleUse(purchase)}
                              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2">
                              <ShoppingBag className="w-5 h-5" /> 🛍️ Получить бесплатно
                            </button>
                          )}
                          {isTag && (
                            <button onClick={() => handleUse(purchase)}
                              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition">
                              🏷️ Надеть значок
                            </button>
                          )}
                          {isPromo && (
                            <button onClick={() => handleUse(purchase)}
                              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transition">
                              🎟️ Показать промокод
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24">
                <Package className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                <p className="text-xl text-gray-500 mb-2">Покупок пока нет</p>
                <p className="text-gray-400 mb-6">Заработайте баллы выполняя квесты и купите награду в магазине</p>
                <button onClick={() => setActiveTab('rewards')}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition">
                  Перейти в магазин
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Модал: бесплатный товар ─── */}
      {freeProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <button onClick={() => setFreeProductModal(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition font-bold">✕</button>
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">🎁</div>
              <h3 className="text-2xl font-black mb-1">Бесплатный товар!</h3>
              <p className="text-gray-500 text-sm">Выберите как хотите получить награду</p>
            </div>
            {freeProductModal.reward?.free_product_data && (
              <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 mb-6">
                {freeProductModal.reward.free_product_data.image && (
                  <img src={freeProductModal.reward.free_product_data.image} alt={freeProductModal.reward.free_product_data.name} className="w-20 h-20 object-cover rounded-xl" />
                )}
                <div>
                  <p className="font-bold text-lg leading-tight">{freeProductModal.reward.free_product_data.name}</p>
                  <p className="text-gray-400 line-through text-sm">{freeProductModal.reward.free_product_data.price} ₽</p>
                  <p className="text-green-600 font-black text-xl">0 ₽ 🎉</p>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <button onClick={handleAddFreeToCart} disabled={addingToCart}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-black text-lg hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-3 shadow-lg shadow-green-200 disabled:opacity-50">
                {addingToCart
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Добавляем...</>
                  : <><ShoppingBag className="w-6 h-6" /> Добавить в корзину (0 ₽)</>}
              </button>
              <button
                onClick={() => { setFreeProductModal(null); router.push(`/product/${freeProductModal.reward.free_product_data?.slug}?free_purchase=${freeProductModal.id}`); }}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition flex items-center justify-center gap-3">
                <ChevronRight className="w-5 h-5" /> Посмотреть товар
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
