'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function NotificationBell() {
  const { user, tokens } = useAuth(); // ✅ Получаем tokens из контекста!
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && tokens) {
      loadNotifications();
      // Обновляем каждые 30 секунд
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, tokens]);

  const loadNotifications = async () => {
    if (!user || !tokens) {
      console.log('❌ Пользователь не авторизован или нет токенов');
      return;
    }
    
    try {
      setLoading(true);
      
      // ✅ Используем токен из контекста
      const token = tokens.access;
      
      console.log('✅ Токен из контекста:', token.substring(0, 30) + '...');
      console.log('📡 Отправляем запрос...');
      
      // ✅ Используем обновленный метод API
      const data = await api.getNotifications(token);
      
      setNotifications(data || []);
      setUnreadCount(data.length || 0);
      
      console.log('✅ Уведомления загружены:', data);
    } catch (error) {
      console.error('❌ Ошибка загрузки уведомлений:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    if (!tokens) return;
    
    try {
      await api.markNotificationAsRead(tokens.access, notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Ошибка отметки уведомления:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!tokens) return;
    
    try {
      await api.markAllNotificationsAsRead(tokens.access);
      loadNotifications();
    } catch (error) {
      console.error('Ошибка отметки всех уведомлений:', error);
    }
  };

  // Функция для получения иконки по типу уведомления
  const getNotificationIcon = (type: string) => {
    const icons: any = {
      order_created: '📦',
      order_status_changed: '🔄',
      order_delivered: '✅',
      price_drop: '💰',
      back_in_stock: '🎉',
      sale_started: '🔥',
    };
    return icons[type] || '📬';
  };

  // Функция для получения цвета фона иконки
  const getNotificationColor = (type: string) => {
    const colors: any = {
      order_created: 'bg-blue-500',
      order_status_changed: 'bg-purple-500',
      order_delivered: 'bg-green-500',
      price_drop: 'bg-yellow-500',
      back_in_stock: 'bg-teal-500',
      sale_started: 'bg-red-500',
    };
    return colors[type] || 'bg-primary';
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-primary transition-colors"
        aria-label="Уведомления"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
            {/* Заголовок */}
            <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-blue-50 flex justify-between items-center">
              <h3 className="font-bold text-lg">🔔 Уведомления</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary hover:text-blue-700 font-medium hover:underline"
                >
                  ✓ Прочитать все
                </button>
              )}
            </div>

            {/* Список уведомлений */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Загрузка...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="text-6xl mb-4">🔕</div>
                  <p className="font-medium">Нет уведомлений</p>
                  <p className="text-sm mt-1">Вы увидите здесь важные обновления</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-blue-50 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => {
                      handleMarkAsRead(notification.id);
                      if (notification.order) {
                        window.location.href = `/profile/orders`;
                      }
                      setShowDropdown(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Иконка */}
                      <div className={`flex-shrink-0 w-12 h-12 ${getNotificationColor(notification.type)} rounded-full flex items-center justify-center text-white text-2xl shadow-md`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Контент */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3">
                          <p className="text-xs text-gray-500">
                            {new Date(notification.created_at).toLocaleString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {notification.order && (
                            <span className="text-xs text-primary">→ К заказу</span>
                          )}
                        </div>
                      </div>

                      {/* Индикатор непрочитанного */}
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ссылка на все уведомления */}
            <Link
              href="/profile/notifications"
              className="block p-3 text-center text-primary hover:bg-primary/10 font-semibold border-t transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              Посмотреть все уведомления →
            </Link>
          </div>

          {/* Оверлей для закрытия */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          ></div>
        </>
      )}
    </div>
  );
}
