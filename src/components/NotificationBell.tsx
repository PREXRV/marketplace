'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, Notification } from '@/lib/api';
import Link from 'next/link';
import { Bell, X, Check, Package, Heart, ShoppingBag, Sparkles } from 'lucide-react';
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
      
      // Обновляем счетчик каждые 600 секунд
      const interval = setInterval(loadUnreadCount, 600000);
      return () => clearInterval(interval);
    }
  }, [tokens]);

  useEffect(() => {
    if (isOpen && tokens) {
      loadNotifications();
    }
  }, [isOpen, tokens]);

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const loadUnreadCount = async () => {
    if (!tokens) return;
    
    try {
      const data = await api.getUnreadCount(tokens.access);
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Ошибка загрузки счетчика уведомлений:', error);
    }
  };

  const loadNotifications = async () => {
    if (!tokens) return;
    
    try {
      setLoading(true);
      const data = await api.getUnreadNotifications(tokens.access);
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
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
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
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
    
    // Отмечаем как прочитанное
    try {
      await api.markNotificationAsRead(tokens.access, notification.id);
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Ошибка:', error);
    }
    
    setIsOpen(false);
  };

  if (!tokens) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ✅ Иконка колокольчика - ТОЧНО КАК У КОРЗИНЫ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative py-4"
      >
        <div className="flex items-center gap-2 text-gray-700 hover:text-primary transition">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Заголовок */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h3 className="font-bold text-lg">Уведомления</h3>
              {unreadCount > 0 && (
                <span className="bg-white text-primary text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs hover:underline text-white/90 hover:text-white transition"
              >
                Прочитать все
              </button>
            )}
          </div>

          {/* Список уведомлений */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
                    className="block p-4 hover:bg-blue-50 transition group"
                  >
                    <div className="flex gap-3">
                      {/* Иконка */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Контент */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm group-hover:text-primary transition">
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                            title="Отметить прочитанным"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>

                        {/* Изображение товара */}
                        {notification.product_image && (
                          <img
                            src={notification.product_image}
                            alt={notification.product_name || ''}
                            className="w-16 h-16 object-cover rounded-lg mb-2"
                          />
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ru
                            })}
                          </span>
                          <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition">
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

          {/* Футер */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <Link
                href="/profile/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-primary hover:text-blue-700 font-medium"
              >
                Посмотреть все уведомления
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
