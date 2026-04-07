'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { partnershipAPI } from '@/services/api';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Package, Video, Eye, CheckCircle, Clock, TrendingUp, RefreshCw } from 'lucide-react';

export default function PartnershipPage() {
  const [partner, setPartner] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    youtube_url: '',
    instagram_url: '',
    tiktok_url: '',
    telegram_url: '',
    total_followers: '',
    about: '',
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const partnerRes = await partnershipAPI.getPartnerProfile();
      if (partnerRes.data) {
        setPartner(partnerRes.data);
        const dashboardRes = await partnershipAPI.getPartnerDashboard();
        setDashboard(dashboardRes.data);
        setApplication(null);
      } else {
        const appRes = await partnershipAPI.getMyApplication();
        setApplication(appRes.data);
        setPartner(null);
        setDashboard(null);
      }
    } catch {
      try {
        const appRes = await partnershipAPI.getMyApplication();
        setApplication(appRes.data);
      } catch {
        setApplication(null);
      }
      setPartner(null);
      setDashboard(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    checkStatus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('Примите условия программы');
      return;
    }
    const hasSocial = formData.youtube_url || formData.instagram_url ||
                      formData.tiktok_url || formData.telegram_url;
    if (!hasSocial) {
      toast.error('Укажите хотя бы одну социальную сеть');
      return;
    }
    setSubmitting(true);
    try {
      await partnershipAPI.applyForPartnership({
        agreed_to_terms: true,
        ...formData,
        total_followers: formData.total_followers ? parseInt(formData.total_followers) : 0,
      });
      toast.success('Заявка отправлена! Ожидайте одобрения');
      checkStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка отправки заявки');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600" />
      </div>
    );
  }

  // ✅ Партнёр с дашбордом
  if (partner && dashboard) {
    const { stats, recent_requests, recent_videos } = dashboard;
    return (
      <div>
        <div className="mb-6 md:mb-8">
          <Link href="/profile" className="text-primary hover:underline mb-4 inline-block text-sm">
            ← Вернуться в профиль
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Привет, {partner.username}! 👋</h1>
          <p className="text-sm md:text-base text-gray-600">
            Статус:{' '}
            <span className="font-bold text-purple-600">{partner.status_display}</span>
            {' '}|{' '}
            Код:{' '}
            <span className="font-mono font-bold">{partner.partner_code}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          {[
            {
              icon: Package,
              label: 'Всего запросов',
              value: stats.total_requests,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              icon: CheckCircle,
              label: 'Одобрено',
              value: stats.approved_requests,
              color: 'from-green-500 to-emerald-500',
            },
            {
              icon: Clock,
              label: 'На рассмотрении',
              value: stats.pending_requests,
              color: 'from-yellow-500 to-orange-500',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm"
            >
              <div
                className={`bg-gradient-to-r ${stat.color} w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-2 md:mb-3`}
              >
                <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <p className="text-gray-500 text-xs font-semibold mb-1">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <Link href="/profile/partnership/request-product">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 cursor-pointer shadow-sm border-2 border-purple-100 hover:border-purple-300 transition"
            >
              <Package className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 text-purple-600" />
              <h3 className="text-base md:text-lg font-bold mb-1">Запросить товар</h3>
              <p className="text-gray-500 text-xs md:text-sm">Получите товар бесплатно</p>
            </motion.div>
          </Link>
          <Link href="/profile/partnership/videos">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 cursor-pointer shadow-sm border-2 border-purple-100 hover:border-purple-300 transition"
            >
              <Video className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 text-purple-600" />
              <h3 className="text-base md:text-lg font-bold mb-1">Мои видео</h3>
              <p className="text-gray-500 text-xs md:text-sm">Загрузите видео с товаром</p>
            </motion.div>
          </Link>
          <Link href="/profile/partnership/social-media">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 cursor-pointer shadow-sm border-2 border-purple-100 hover:border-purple-300 transition"
            >
              <TrendingUp className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 text-purple-600" />
              <h3 className="text-base md:text-lg font-bold mb-1">Мои соцсети</h3>
              <p className="text-gray-500 text-xs md:text-sm">Управление соцсетями</p>
            </motion.div>
          </Link>
        </div>

        {recent_requests?.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold">Последние запросы</h2>
              <Link
                href="/profile/partnership/products"
                className="text-xs md:text-sm text-primary hover:underline"
              >
                Все запросы →
              </Link>
            </div>
            <div className="space-y-3">
              {recent_requests.map((request: any) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    {request.product_image && (
                      <img
                        src={request.product_image}
                        alt={request.product_title}
                        className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-sm md:text-base">{request.product_title}</h3>
                      <p className="text-gray-400 text-xs">
                        {new Date(request.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`self-start sm:self-center px-2 py-1 rounded-full text-xs font-bold ${
                      request.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {request.status_display}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recent_videos?.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold">Последние видео</h2>
              <Link
                href="/profile/partnership/videos"
                className="text-xs md:text-sm text-primary hover:underline"
              >
                Все видео →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {recent_videos.map((video: any) => (
                <div
                  key={video.id}
                  className="border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Video className="w-6 h-6 md:w-7 md:h-7 text-purple-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base truncate">{video.product_title}</h3>
                      <p className="text-xs text-gray-400">{video.platform_display}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                        video.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : video.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {video.status_display}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs md:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      {video.views_count}
                    </span>
                    <span>👍 {video.likes_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ✅ Заявка одобрена
  if (application?.status === 'approved') {
    return (
      <div>
        <Link href="/profile" className="text-primary hover:underline mb-4 inline-block text-sm">← Вернуться в профиль</Link>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 md:p-8 shadow-xl text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <span className="text-4xl md:text-5xl">🎉</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Заявка одобрена!</h2>
            <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
              Поздравляем! Вы стали партнёром.<br />
              Нажмите кнопку чтобы войти в партнёрский кабинет.
            </p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleRefresh} disabled={refreshing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 md:px-10 md:py-4 rounded-xl font-bold text-base md:text-lg disabled:opacity-70 flex items-center gap-2 md:gap-3 mx-auto"
            >
              {refreshing
                ? <><RefreshCw className="w-5 h-5 animate-spin" /> Загрузка...</>
                : <><span>🚀</span> Войти в партнёрку</>}
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ✅ Заявка отклонена
  if (application?.status === 'rejected') {
    return (
      <div>
        <Link href="/profile" className="text-primary hover:underline mb-4 inline-block text-sm">← Вернуться в профиль</Link>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <span className="text-3xl md:text-4xl">❌</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Заявка отклонена</h2>
            {application.admin_notes && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 md:p-4 mb-6 text-left">
                <p className="text-xs md:text-sm font-semibold text-red-700 mb-1">Причина отказа:</p>
                <p className="text-xs md:text-sm text-red-600">{application.admin_notes}</p>
              </div>
            )}
            <p className="text-gray-600 mb-6 text-sm md:text-base">Вы можете исправить данные и подать новую заявку.</p>
            <button onClick={() => setApplication(null)}
              className="bg-purple-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-xl font-bold text-sm md:text-base hover:bg-purple-700 transition">
              Подать новую заявку
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Заявка на рассмотрении
  if (application?.status === 'pending') {
    return (
      <div>
        <Link href="/profile" className="text-primary hover:underline mb-4 inline-block text-sm">← Вернуться в профиль</Link>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <span className="text-3xl md:text-4xl">⏳</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Заявка на рассмотрении</h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Ваша заявка отправлена и ожидает одобрения администратором.<br />
              Обычно это занимает 1-2 рабочих дня.
            </p>

            <div className="bg-gray-50 rounded-xl p-3 md:p-4 mb-6 text-left space-y-2">
              <p className="text-xs md:text-sm text-gray-500 font-semibold mb-2">Ваши данные из заявки:</p>
              {application.youtube_url && (
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span>▶️</span>
                  <a href={application.youtube_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">{application.youtube_url}</a>
                </div>
              )}
              {application.instagram_url && (
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span>📸</span>
                  <a href={application.instagram_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">{application.instagram_url}</a>
                </div>
              )}
              {application.tiktok_url && (
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span>🎵</span>
                  <a href={application.tiktok_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">{application.tiktok_url}</a>
                </div>
              )}
              {application.telegram_url && (
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span>✈️</span>
                  <a href={application.telegram_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">{application.telegram_url}</a>
                </div>
              )}
              {application.total_followers > 0 && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <span>👥</span> {application.total_followers.toLocaleString()} подписчиков
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs md:text-sm text-gray-500">
                <span>Отправлена: {new Date(application.created_at).toLocaleDateString('ru-RU')}</span>
                <span className="font-bold text-yellow-600">На рассмотрении</span>
              </div>
            </div>

            <button onClick={handleRefresh} disabled={refreshing}
              className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-2 mx-auto transition">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Проверить статус
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Форма подачи заявки
  return (
    <div>
      <Link href="/profile" className="text-primary hover:underline mb-4 inline-block text-sm">
        ← Вернуться в профиль
      </Link>

      <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-5 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">🤝 Партнёрская программа</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {[
              '🎁 Получайте товары бесплатно',
              '📱 Создавайте контент и зарабатывайте',
              '🚀 Ранний доступ к новинкам',
              '💬 Персональная поддержка',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 md:p-8 shadow-xl space-y-5 md:space-y-6">
          <h3 className="text-xl md:text-2xl font-bold">Заполните заявку</h3>

          <div>
            <h4 className="font-bold text-gray-800 mb-1 text-sm md:text-base">📱 Ваши социальные сети</h4>
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">Укажите хотя бы одну платформу</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {[
                { key: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/@channel', icon: '▶️' },
                { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/username', icon: '📸' },
                { key: 'tiktok_url', label: 'TikTok', placeholder: 'https://tiktok.com/@username', icon: '🎵' },
                { key: 'telegram_url', label: 'Telegram', placeholder: 'https://t.me/channel', icon: '✈️' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                    {field.icon} {field.label}
                  </label>
                  <input
                    type="url"
                    value={(formData as any)[field.key]}
                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
              👥 Общее количество подписчиков (суммарно по всем платформам)
            </label>
            <input
              type="number"
              value={formData.total_followers}
              onChange={e => setFormData(prev => ({ ...prev, total_followers: e.target.value }))}
              placeholder="Например: 15000"
              min="0"
              className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
              ✍️ О себе и вашем контенте
            </label>
            <textarea
              value={formData.about}
              onChange={e => setFormData(prev => ({ ...prev, about: e.target.value }))}
              placeholder="Расскажите о себе: тематика контента, аудитория, почему хотите стать партнёром..."
              rows={4}
              className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition resize-none text-sm"
            />
          </div>

          <label className="flex items-start gap-2 md:gap-3 cursor-pointer p-3 md:p-4 bg-purple-50 rounded-xl border-2 border-purple-100 hover:border-purple-300 transition">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 md:w-5 md:h-5 accent-purple-600"
            />
            <span className="text-xs md:text-sm text-gray-700 leading-relaxed">
              Я ознакомился и принимаю условия{' '}
              <Link href="/docs/partnership" target="_blank" className="text-purple-600 hover:underline font-semibold">
                Партнёрской программы
              </Link>{' '}
              и{' '}
              <Link href="/docs/gift-conditions" target="_blank" className="text-purple-600 hover:underline font-semibold">
                Дарственной на товар с условиями
              </Link>
              , включая обязательства по созданию контента и ответственность за товар до выполнения условий.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting || !agreed}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Отправка...
              </span>
            ) : '🚀 Подать заявку'}
          </button>
        </form>
      </div>
    </div>
  );
}