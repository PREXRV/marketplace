'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, Notification } from '@/lib/api';
import Link from 'next/link';
import { Bell, X, Check, Package, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function NotificationBell() {
  const { tokens } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tokens) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 600000);
      return () => clearInterval(interval);
    }
  }, [tokens]);

  useEffect(() => {
    if (isOpen && tokens) {
      loadNotifications();
    }
  }, [isOpen, tokens]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isOpen]);

  const loadUnreadCount = async () => {
    if (!tokens) return;
    try {
      const data = await api.getUnreadCount(tokens.access);
      setUnreadCount(data?.count ?? 0);
    } catch (error) {
      console.error('Ошибка загрузки счетчика уведомлений:', error);
    }
  };

  const loadNotifications = async () => {
    if (!tokens) return;
    try {
      setLoading(true);
      const data = await api.getUnreadNotifications(tokens.access);
      setNotifications(data?.notifications ?? (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!tokens) return;

    try {
      await api.markNotificationAsRead(tokens.access, notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Ошибка отметки уведомления:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!tokens) return;

    try {
      await api.markAllNotificationsAsRead(tokens.access);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Ошибка отметки всех уведомлений:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'order_status_changed':
      case 'order_delivered':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'product_in_stock':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'product_on_sale':
      case 'new_sale':
        return <Sparkles className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!tokens) return;

    try {
      await api.markNotificationAsRead(tokens.access, notification.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Ошибка:', error);
    }

    setIsOpen(false);
  };

  if (!tokens) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary hover:bg-gray-50 transition-all shrink-0"
        aria-label="Уведомления"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 sm:hidden" />

          <div className="fixed left-3 right-3 top-20 z-50 max-h-[calc(100vh-6rem)] rounded-2xl border border-gray-200 bg-white shadow-2xl flex flex-col overflow-hidden sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[24rem] sm:max-h-[36rem]">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 p-4 bg-gradient-to-r from-primary/10 to-blue-600/10">
              <div className="flex items-center gap-2 min-w-0">
                <Bell className="h-5 w-5 text-primary shrink-0" />
                <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">Уведомления</h3>
                {unreadCount > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold shrink-0">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="hidden sm:inline text-sm text-gray-600 hover:text-primary hover:underline font-medium transition"
                  >
                    Прочитать все
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition sm:hidden"
                  aria-label="Закрыть уведомления"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {unreadCount > 0 && (
              <div className="border-b border-gray-100 px-4 py-2 sm:hidden">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary font-medium"
                >
                  Прочитать все
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Загрузка...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Нет новых уведомлений</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Мы сообщим вам о важных событиях
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.link || '/profile'}
                      onClick={() => handleNotificationClick(notification)}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="text-gray-400 hover:text-gray-600 transition flex-shrink-0 p-1 -m-1 rounded-full hover:bg-gray-200"
                              title="Отметить прочитанным"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                            {notification.message}
                          </p>

                          {notification.product_image && (
                            <img
                              src={notification.product_image}
                              alt={notification.product_name || ''}
                              className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg mb-2"
                            />
                          )}

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ru,
                              })}
                            </span>
                            <span className="text-xs text-primary font-medium shrink-0">
                              Перейти →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <Link
                  href="/profile/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-primary hover:text-blue-700 font-medium transition"
                >
                  Посмотреть все уведомления
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}