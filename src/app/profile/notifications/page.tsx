'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api, Notification } from '@/lib/api';
import Link from 'next/link';
import Header from '@/components/Header';  // ✅ ДОБАВЛЕНО
import Footer from '@/components/Footer';  // ✅ ДОБАВЛЕНО
import { Bell, Trash2, Check, Package, Heart, Sparkles, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function NotificationsPage() {
  const { tokens, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (tokens?.access) {
      loadNotifications();
    }
  }, [isAuthenticated, tokens, filter]);

  const loadNotifications = async () => {
    if (!tokens?.access) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      if (filter === 'unread') {
        const data = await api.getUnreadNotifications(tokens.access);
        setNotifications(data.notifications || []);
      } else {
        const data = await api.getNotifications(tokens.access);
        const notificationsList = Array.isArray(data)
          ? data
          : ((data as any).results || (data as any).notifications || []);
        setNotifications(notificationsList);
      }
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    if (!tokens) return;

    try {
      await api.markNotificationAsRead(tokens.access, notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    if (!tokens || !confirm('Удалить уведомление?')) return;

    try {
      await api.deleteNotification(tokens.access, notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!tokens) return;

    try {
      await api.markAllNotificationsAsRead(tokens.access);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'order_status_changed':
      case 'order_delivered':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'product_in_stock':
        return <Check className="w-6 h-6 text-green-500" />;
      case 'product_on_sale':
      case 'new_sale':
        return <Sparkles className="w-6 h-6 text-orange-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <Header />  {/* ✅ ДОБАВЛЕНО */}
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Назад в профиль
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Bell className="w-8 h-8 text-primary" />
                Уведомления
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                    {unreadCount} новых
                  </span>
                )}
              </h1>
              <p className="text-gray-600">Следите за важными событиями</p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn-primary flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Прочитать все
              </button>
            )}
          </div>

          {/* Фильтры */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Все ({notifications.length})
            </button>
            <button
              onClick={() => handleFilterChange('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'unread'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Непрочитанные ({unreadCount})
            </button>
          </div>

          {/* Список уведомлений */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">Нет уведомлений</h3>
              <p className="text-gray-600">
                {filter === 'unread'
                  ? 'Все уведомления прочитаны'
                  : 'Мы сообщим вам о важных событиях'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-md p-6 transition ${
                    !notification.is_read
                      ? 'border-l-4 border-primary'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ru
                            })}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Отметить прочитанным"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Удалить"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{notification.message}</p>

                      {notification.product_image && (
                        <div className="mb-3">
                          <img
                            src={notification.product_image}
                            alt={notification.product_name || ''}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                        >
                          Перейти →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />  {/* ✅ ДОБАВЛЕНО */}
    </>
  );
}
