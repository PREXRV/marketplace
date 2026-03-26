'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AvatarUpload from '@/components/AvatarUpload';
import { api, GamificationProfile } from '@/lib/api';
import {
  User, Package, Heart, Star, Settings, MapPin, Bell,
  ShoppingBag, ChevronRight, Trophy, Sparkles, Gift, Handshake,
} from 'lucide-react';

interface ProfileStats {
  orders_count: number;
  favorites_count: number;
  reviews_count: number;
  unread_notifications: number;
}

interface UserQuest {
  id: number;
  quest: { name: string; target_value: number };
  progress: number;
  progress_percent: number;
  is_completed: boolean;
}

interface UserTag {
  id: number;
  name: string;
  slug: string;
  background_color: string;
  text_color: string;
  icon: string;
  is_permanent?: boolean;
}

type PartnerStatus = 'none' | 'pending' | 'approved';

export default function ProfilePage() {
  const { user, tokens, isAuthenticated, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<ProfileStats>({
    orders_count: 0, favorites_count: 0, reviews_count: 0, unread_notifications: 0,
  });
  const [gamification, setGamification]       = useState<GamificationProfile | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [badgesCount, setBadgesCount]         = useState(0);
  const [partnerStatus, setPartnerStatus]     = useState<PartnerStatus>('none');
  const [userTags, setUserTags]               = useState<UserTag[]>([]);
  const [activeTags, setActiveTags]           = useState<UserTag[]>([]);
  const [tagLoading, setTagLoading]           = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      setUserTags((user as any).tags || []);
      setActiveTags((user as any).active_tags || []);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (!authLoading && isAuthenticated && tokens) loadProfileData();
  }, [authLoading, isAuthenticated, tokens]);

  const loadProfileData = async () => {
    if (!tokens) return;
    setLoading(true);
    try {
      let ordersCount = 0;
      try { const o = await api.getUserOrders(tokens.access); ordersCount = Array.isArray(o) ? o.length : 0; } catch {}
      let favoritesCount = 0;
      try { const f = await api.getFavorites(tokens.access); favoritesCount = Array.isArray(f) ? f.length : 0; } catch {}
      let reviewsCount = 0;
      try { const r = await api.getMyReviews(tokens.access); reviewsCount = Array.isArray(r) ? r.length : 0; } catch {}
      let unreadNotifications = 0;
      try { const n = await api.getUnreadCount(tokens.access); unreadNotifications = n.count || 0; } catch {}
      setStats({ orders_count: ordersCount, favorites_count: favoritesCount, reviews_count: reviewsCount, unread_notifications: unreadNotifications });

      try {
        const g = await api.getGamificationProfile(tokens.access);
        if (g?.level_info) {
          setGamification(g);
          setBadgesCount((g as any).stats?.badges_count || (g as any).badges_count || 0);
        }
      } catch {}

      try {
        const { partnershipAPI } = await import('@/services/api');
        const partnerRes = await partnershipAPI.getPartnerProfile();
        if (partnerRes?.data) {
          setPartnerStatus('approved');
        } else {
          const appRes = await partnershipAPI.getMyApplication();
          if (appRes?.data?.status === 'pending') setPartnerStatus('pending');
          else if (appRes?.data?.status === 'approved') setPartnerStatus('approved');
          else setPartnerStatus('none');
        }
      } catch {
        setPartnerStatus('none');
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleTagToggle = async (tag: UserTag) => {
    if (!tokens || tagLoading !== null) return;
    const isActive = activeTags.some(t => t.id === tag.id);
    if (isActive && tag.is_permanent) return;
    setTagLoading(tag.id);
    setActiveTags(prev => isActive ? prev.filter(t => t.id !== tag.id) : [...prev, tag]);
    try {
      await api.setActiveTag(tokens.access, tag.id);
      const updated = await api.getProfile(tokens.access);
      setActiveTags((updated as any).active_tags || []);
      setUserTags((updated as any).tags || []);
    } catch {
      setActiveTags(prev => isActive ? [...prev, tag] : prev.filter(t => t.id !== tag.id));
    } finally {
      setTagLoading(null);
    }
  };

  const handleClearAllTags = async () => {
    if (!tokens || tagLoading !== null) return;
    const prev = activeTags;
    setActiveTags(activeTags.filter(t => t.is_permanent));
    try {
      await api.setActiveTag(tokens.access, null);
      const updated = await api.getProfile(tokens.access);
      setActiveTags((updated as any).active_tags || []);
      setUserTags((updated as any).tags || []);
    } catch { setActiveTags(prev); }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  const levelInfo = gamification?.level_info;
  const allQuests = [
    ...((gamification?.quests?.daily as any) || []),
    ...((gamification?.quests?.weekly as any) || []),
    ...((gamification?.quests?.achievements as any) || []),
  ];
  const activeQuests: UserQuest[] = allQuests.filter((q: any) => !q.is_completed);

  const navItems = [
    { icon: Package,   label: 'Мои заказы',   href: '/profile/orders',        badge: stats.orders_count },
    { icon: Heart,     label: 'Избранное',     href: '/profile/favorites',     badge: stats.favorites_count },
    { icon: Star,      label: 'Отзывы',        href: '/profile/reviews',       badge: stats.reviews_count },
    { icon: Trophy,    label: 'Геймификация',  href: '/profile/gamification',  badge: activeQuests.length },
    { icon: Handshake, label: 'Партнёрка',     href: '/profile/partnership',   badge: 0, partnerStatus },
    { icon: MapPin,    label: 'Адреса',        href: '/profile/addresses' },
    { icon: Bell,      label: 'Уведомления',   href: '/profile/notifications', badge: stats.unread_notifications },
    { icon: Settings,  label: 'Настройки',     href: '/profile/settings' },
  ];

  const bannerStyle = {
    approved: {
      wrap:   'bg-gradient-to-r from-purple-600 to-blue-600 text-white',
      icon:   'bg-white/20', iconEl: 'text-white', arrow: 'text-white/60',
    },
    pending: {
      wrap:   'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200',
      icon:   'bg-yellow-100', iconEl: 'text-yellow-600', arrow: 'text-yellow-400',
    },
    none: {
      wrap:   'bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-100',
      icon:   'bg-purple-100', iconEl: 'text-purple-600', arrow: 'text-purple-300',
    },
  }[partnerStatus];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Мой профиль</h1>
          <p className="text-gray-500">Управление аккаунтом и активностями</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ===== ЛЕВАЯ КОЛОНКА ===== */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex flex-col items-center text-center">

                {/* ✅ Используем переписанный AvatarUpload с поддержкой бакета */}
                <div className="mb-4">
                  <AvatarUpload
                    size={96}
                    showDelete={false}
                  />
                </div>

                <h2 className="text-xl font-bold mb-0.5">
                  {user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.username}
                </h2>
                <p className="text-white/70 text-sm mb-2">{user.email}</p>

                {activeTags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                    {activeTags.map(tag => (
                      <span
                        key={tag.slug}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shadow"
                        style={{ backgroundColor: tag.background_color, color: tag.text_color }}
                      >
                        {tag.icon && <span>{tag.icon}</span>}
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {levelInfo && (
                  <div className="w-full bg-white/15 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4" />
                        <span className="font-semibold">Уровень {levelInfo.level}</span>
                      </div>
                      <span className="text-white/80">{levelInfo.experience} / {levelInfo.experience_needed} XP</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-500"
                        style={{ width: `${levelInfo.progress_percent}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/20">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="font-bold text-sm">{levelInfo.bonus_points}</span>
                        </div>
                        <p className="text-xs text-white/60">Баллов</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <Gift className="w-3.5 h-3.5" />
                          <span className="font-bold text-sm">{activeQuests.length}</span>
                        </div>
                        <p className="text-xs text-white/60">Квестов</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Навигация */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const ps = (item as any).partnerStatus as PartnerStatus | undefined;
                  const isApproved = ps === 'approved';
                  const isPending  = ps === 'pending';
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition group ${
                        isApproved ? 'bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100'
                        : isPending ? 'bg-yellow-50 hover:bg-yellow-100'
                        : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 transition ${
                          isApproved ? 'text-purple-500'
                          : isPending ? 'text-yellow-500'
                          : 'text-gray-400 group-hover:text-primary'
                        }`} />
                        <span className={`text-sm transition ${
                          isApproved ? 'text-purple-700 font-semibold'
                          : isPending ? 'text-yellow-700 font-semibold'
                          : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {item.label}
                        </span>
                        {isApproved && (
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">
                            Партнёр ✓
                          </span>
                        )}
                        {isPending && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                            На рассмотрении
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 transition ${
                          isApproved ? 'text-purple-300'
                          : isPending ? 'text-yellow-300'
                          : 'text-gray-300 group-hover:text-primary'
                        }`} />
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* ===== ПРАВАЯ КОЛОНКА ===== */}
          <div className="lg:col-span-2 space-y-6">

            {/* Статистика */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: ShoppingBag, label: 'Заказов',   value: stats.orders_count,    color: 'bg-blue-500',   href: '/profile/orders' },
                { icon: Heart,       label: 'Избранное', value: stats.favorites_count, color: 'bg-pink-500',   href: '/profile/favorites' },
                { icon: Star,        label: 'Отзывов',   value: stats.reviews_count,   color: 'bg-yellow-500', href: '/profile/reviews' },
                { icon: Trophy,      label: 'Уровень',   value: levelInfo?.level || 1, color: 'bg-purple-500', href: '/profile/gamification' },
              ].map((stat) => (
                <Link key={stat.href} href={stat.href} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition group">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </Link>
              ))}
            </div>

            {/* Баннер партнёрки */}
            <Link href="/profile/partnership">
              <div className={`rounded-2xl p-6 flex items-center gap-5 shadow-sm transition hover:shadow-md cursor-pointer ${bannerStyle.wrap}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${bannerStyle.icon}`}>
                  <Handshake className={`w-7 h-7 ${bannerStyle.iconEl}`} />
                </div>
                <div className="flex-1 min-w-0">
                  {partnerStatus === 'approved' ? (
                    <>
                      <p className="font-bold text-lg">Партнёрская программа</p>
                      <p className="text-white/80 text-sm">Управляйте запросами, видео и аналитикой</p>
                    </>
                  ) : partnerStatus === 'pending' ? (
                    <>
                      <p className="font-bold text-lg text-yellow-900">Заявка на рассмотрении</p>
                      <p className="text-yellow-700 text-sm">Мы рассматриваем вашу заявку. Ожидайте ответа.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-purple-900">Стать партнёром</p>
                      <p className="text-purple-600 text-sm">Получайте товары бесплатно и зарабатывайте на контенте</p>
                    </>
                  )}
                </div>
                <ChevronRight className={`w-6 h-6 flex-shrink-0 ${bannerStyle.arrow}`} />
              </div>
            </Link>

            {/* Активные квесты */}
            {activeQuests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    🎯 Активные квесты
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{activeQuests.length}</span>
                  </h3>
                  <Link href="/profile/gamification" className="text-sm text-primary hover:underline">Все квесты →</Link>
                </div>
                <div className="space-y-3">
                  {activeQuests.slice(0, 3).map((quest) => (
                    <div key={quest.id ?? quest.quest.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{quest.quest.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${quest.progress_percent}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {quest.progress} / {quest.quest.target_value}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary">{Math.round(quest.progress_percent)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Теги пользователя */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-lg">🏷️ Мои теги</h3>
                {activeTags.length > 0 && (
                  <span className="text-xs text-gray-400">
                    Активно: <span className="font-semibold text-gray-600">{activeTags.length}</span>
                  </span>
                )}
              </div>
              {userTags.length > 0 ? (
                <>
                  <p className="text-sm text-gray-400 mb-5">Нажмите на тег чтобы надеть или снять его</p>
                  <div className="flex flex-wrap gap-3">
                    {userTags.map((tag) => {
                      const isActive    = activeTags.some(t => t.id === tag.id);
                      const isLoading   = tagLoading === tag.id;
                      const isPermanent = isActive && tag.is_permanent;
                      return (
                        <button
                          key={tag.slug}
                          onClick={() => handleTagToggle(tag)}
                          disabled={tagLoading !== null || isPermanent}
                          title={isPermanent ? '🔒 Тег закреплён администратором' : isActive ? 'Снять тег' : 'Надеть тег'}
                          className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105 shadow-md select-none
                            ${isActive ? 'ring-4 ring-offset-2 ring-blue-400 scale-105 shadow-lg' : 'opacity-70 hover:opacity-100'}
                            ${isPermanent || tagLoading !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          style={{ backgroundColor: tag.background_color, color: tag.text_color }}
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                              {tag.name}
                            </span>
                          ) : (
                            <>
                              {isPermanent && <span className="mr-1">🔒</span>}
                              {!isPermanent && tag.icon && <span className="mr-1">{tag.icon}</span>}
                              {tag.name}
                              {isActive && <span className="ml-1.5 text-xs bg-white/30 rounded-full px-1.5 py-0.5">✓</span>}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {activeTags.some(t => !t.is_permanent) && (
                    <button
                      onClick={handleClearAllTags}
                      disabled={tagLoading !== null}
                      className="mt-4 text-sm text-gray-400 hover:text-red-500 transition flex items-center gap-1 disabled:opacity-50"
                    >
                      <span>✕</span> Снять все теги
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="text-4xl mb-3">🎖️</div>
                  <p className="text-gray-600 font-medium mb-1">У вас пока нет тегов</p>
                  <p className="text-sm text-gray-400 mb-4">Получайте теги в магазине наград за баллы или выполняя квесты</p>
                  <Link href="/profile/gamification" className="bg-primary text-white text-sm px-5 py-2 rounded-lg hover:bg-primary/90 transition">
                    Открыть геймификацию
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
