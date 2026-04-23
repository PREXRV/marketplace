// src/app/profile/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import { api, Order, getImageUrl } from '@/lib/api';

export default function OrdersPage() {
  const { user, tokens, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [retryingPayment, setRetryingPayment] = useState<number | null>(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [selectedReturnItems, setSelectedReturnItems] = useState<Set<number>>(new Set());
  const [returnReason, setReturnReason] = useState('defective');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnFiles, setReturnFiles] = useState<File[]>([]);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (tokens) loadOrders();
  }, [authLoading, isAuthenticated, tokens]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getUserOrders(tokens!.access);
      setOrders(data);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  const openReviewModal = (order: Order) => {
    setSelectedOrderForReview(order);
    setReviewModalOpen(true);
  };

  const openReturnModal = (order: Order) => {
    setSelectedOrderForReturn(order);
    setReturnModalOpen(true);
    setSelectedReturnItems(new Set());
    setReturnReason('defective');
    setReturnDescription('');
    setReturnFiles([]);
  };

  const toggleReturnItem = (itemId: number) => {
    setSelectedReturnItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const selectAllReturnItems = () => {
    if (!selectedOrderForReturn) return;
    setSelectedReturnItems(new Set(selectedOrderForReturn.items?.map(item => item.id) || []));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setReturnFiles(prev => [...prev, ...filesArray].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setReturnFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReturn = async () => {
    if (!selectedOrderForReturn || !tokens || selectedReturnItems.size === 0) {
      alert('Выберите хотя бы один товар');
      return;
    }
    if (!returnDescription.trim()) {
      alert('Опишите причину возврата');
      return;
    }
    try {
      setSubmittingReturn(true);
      const formData = new FormData();
      formData.append('order_id', selectedOrderForReturn.id.toString());
      formData.append('reason', returnReason);
      formData.append('description', returnDescription);
      const items = Array.from(selectedReturnItems).map(itemId => {
        const item = selectedOrderForReturn.items?.find(i => i.id === itemId);
        return { order_item_id: itemId, quantity: item?.quantity || 1 };
      });
      formData.append('items', JSON.stringify(items));
      returnFiles.forEach(file => formData.append('media', file));
      await api.createReturn(tokens.access, formData);
      alert('Запрос на возврат успешно отправлен!');
      setReturnModalOpen(false);
      await loadOrders();
    } catch (error: any) {
      console.error('Ошибка создания возврата:', error);
      alert(error.message || 'Не удалось создать запрос на возврат');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!tokens || !confirm('Отправить запрос на отмену заказа?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${order.id}/cancel/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.access}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Запрос на отмену от пользователя' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка отмены заказа');
      await loadOrders();
      alert(data.message || 'Запрос на отмену отправлен');
    } catch (error: any) {
      alert(error.message || 'Не удалось отправить запрос на отмену');
    }
  };

  const handleRetryPayment = async (order: Order) => {
    if (!tokens) return;
    setRetryingPayment(order.id);
    try {
      const res = await api.createPayment(order.id);
      if (res.success && res.payment_url) {
        window.location.href = res.payment_url;
      }
    } catch (e) {
      console.error(e);
      alert('Не удалось создать ссылку на оплату');
    } finally {
      setRetryingPayment(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const getPaymentStatusBadge = (order: Order) => {
    const ps = (order as any).payment_status;
    if (!ps || ps === 'not_required') return null;
    const map: Record<string, { label: string; cls: string; icon: string }> = {
      pending:   { label: 'Ожидает оплаты', cls: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⏳' },
      paid:      { label: 'Оплачено',       cls: 'bg-green-100 text-green-800 border-green-300',  icon: '✅' },
      cancelled: { label: 'Оплата отменена', cls: 'bg-red-100 text-red-800 border-red-300',       icon: '❌' },
      refunded:  { label: 'Возвращено',     cls: 'bg-purple-100 text-purple-800 border-purple-300', icon: '↩️' },
      failed:    { label: 'Ошибка оплаты',  cls: 'bg-red-100 text-red-800 border-red-300',        icon: '⚠️' },
    };
    const info = map[ps] ?? { label: ps, cls: 'bg-gray-100 text-gray-700 border-gray-300', icon: '💳' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold border ${info.cls}`}>
        {info.icon} {info.label}
      </span>
    );
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200',
      in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
      shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      awaiting_cancellation: 'bg-orange-50 text-orange-700 border-orange-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusText = (status: string, order?: Order) => {
    if (order?.status_display) return order.status_display;
    const texts: any = {
      pending: 'Ожидает обработки',
      confirmed: 'Подтверждён',
      processing: 'В обработке',
      in_progress: 'В процессе',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      awaiting_cancellation: 'Ожидает отмены',
      cancelled: 'Отменён',
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons: any = {
      pending: '⏱️',
      confirmed: '✓',
      processing: '📦',
      in_progress: '📦',
      shipped: '🚚',
      delivered: '✅',
      awaiting_cancellation: '⏳',
      cancelled: '❌',
    };
    return icons[status] || '📋';
  };

  const getDeliveryTypeText = (order: Order) => {
    if (order.delivery_type_display) return order.delivery_type_display;
    const types: any = {
      courier: 'Курьерская доставка',
      pickup: 'Самовывоз',
      post: 'Почта России',
      express: 'Экспресс-доставка',
      sdek: 'СДЭК',
      boxberry: 'Boxberry',
    };
    return types[order.delivery_type] || order.delivery_type || 'Не указано';
  };

  const getPaymentTypeText = (order: Order) => {
    if (order.payment_type_display) return order.payment_type_display;
    const types: any = {
      cash: 'Наличными при получении',
      card: 'Картой при получении',
      online: 'Оплачено онлайн',
      sbp: 'Оплата по СБП',
      yookassa: 'ЮKassa',
    };
    return types[order.payment_type] || order.payment_type || 'Не указано';
  };

  const getDeliveryCost = (order: Order) => order.delivery_cost || 0;

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    awaiting_cancellation: orders.filter(o => o.status === 'awaiting_cancellation').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(order => order.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-4 md:mb-6 text-sm text-gray-600 flex items-center gap-2">
          <Link href="/profile" className="hover:text-primary transition">Профиль</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Мои заказы</span>
        </div>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Мои заказы
          </h1>

          {/* Статистика - адаптивная сетка */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border-2 border-gray-100">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Всего заказов</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 md:p-4 shadow-sm border-2 border-yellow-100">
              <p className="text-xs md:text-sm text-yellow-700 mb-1">Ожидают</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-3 md:p-4 shadow-sm border-2 border-cyan-100">
              <p className="text-xs md:text-sm text-cyan-700 mb-1">Подтверждены</p>
              <p className="text-xl md:text-2xl font-bold text-cyan-700">{stats.confirmed}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 md:p-4 shadow-sm border-2 border-blue-100">
              <p className="text-xs md:text-sm text-blue-700 mb-1">В процессе</p>
              <p className="text-xl md:text-2xl font-bold text-blue-700">{stats.in_progress}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 md:p-4 shadow-sm border-2 border-green-100">
              <p className="text-xs md:text-sm text-green-700 mb-1">Доставлены</p>
              <p className="text-xl md:text-2xl font-bold text-green-700">{stats.delivered}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 md:p-4 shadow-sm border-2 border-orange-100">
              <p className="text-xs md:text-sm text-orange-700 mb-1">Ожидает отмены</p>
              <p className="text-xl md:text-2xl font-bold text-orange-700">{stats.awaiting_cancellation}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 md:p-4 shadow-sm border-2 border-red-100">
              <p className="text-xs md:text-sm text-red-700 mb-1">Отменены</p>
              <p className="text-xl md:text-2xl font-bold text-red-700">{stats.cancelled}</p>
            </div>
          </div>

          {/* Фильтры - горизонтальная прокрутка на мобильных */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <div className="flex items-center gap-3 flex-wrap md:flex-nowrap overflow-x-auto pb-2 md:pb-0">
              <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-base md:text-lg font-semibold flex-shrink-0">Фильтры</h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { key: 'all', label: `Все (${stats.total})`, color: 'primary' },
                  { key: 'pending', label: `Ожидают (${stats.pending})`, color: 'yellow-500' },
                  { key: 'confirmed', label: `Подтверждены (${stats.confirmed})`, color: 'cyan-500' },
                  { key: 'in_progress', label: `В процессе (${stats.in_progress})`, color: 'blue-500' },
                  { key: 'delivered', label: `Доставлены (${stats.delivered})`, color: 'green-500' },
                  { key: 'awaiting_cancellation', label: `Ожидают отмены (${stats.awaiting_cancellation})`, color: 'orange-500' },
                  { key: 'cancelled', label: `Отменены (${stats.cancelled})`, color: 'red-500' },
                ].map(btn => (
                  <button
                    key={btn.key}
                    onClick={() => setFilter(btn.key)}
                    className={`px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap ${
                      filter === btn.key
                        ? `bg-${btn.color} text-white shadow-lg scale-105`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Загрузка заказов...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-3">
              {filter === 'all' ? 'Заказов пока нет' : 'Нет заказов с таким статусом'}
            </h3>
            <p className="text-gray-600 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base">
              {filter === 'all'
                ? 'Оформите первый заказ в нашем магазине и получите приятные бонусы!'
                : 'Измените фильтр или оформите новый заказ'}
            </p>
            {filter === 'all' && (
              <Link href="/catalog" className="btn-primary inline-flex items-center gap-2 text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Перейти в каталог
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {filteredOrders.map(order => {
              const subtotal =
                order.items?.reduce(
                  (sum, item) => sum + item.quantity * parseFloat((item as any).is_free_reward
                    ? (item as any).original_price || item.price
                    : item.price),
                  0,
                ) || 0;
              const hasDiscount = order.discount_amount && parseFloat(order.discount_amount) > 0;
              const deliveryCost = getDeliveryCost(order);
              const isExpanded = expandedOrders.has(order.id);
              const paymentStatus = (order as any).payment_status;
              const isOnlineUnpaid = (order.payment_type === 'yookassa' || order.payment_type === 'online') && paymentStatus === 'pending';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-primary/20"
                >
                  {/* Заголовок заказа */}
                  <div className="p-4 md:p-6 bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
                          <span className="text-2xl md:text-3xl">{getStatusIcon(order.status)}</span>
                          <div>
                            <h3 className="text-base md:text-xl font-bold text-gray-900">Заказ №{order.order_number}</h3>
                            <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
                              <span
                                className={`inline-block px-2 py-0.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold border-2 ${getStatusColor(order.status)}`}
                              >
                                {getStatusText(order.status, order)}
                              </span>
                              {getPaymentStatusBadge(order)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(order.created_at).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(order.created_at).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="text-left md:text-right bg-white px-4 py-2 md:px-6 md:py-4 rounded-xl border-2 border-primary/20">
                        <p className="text-xs md:text-sm text-gray-600 mb-1 font-medium">Итого к оплате</p>
                        <p className="text-xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                          {parseFloat(order.total_amount).toLocaleString('ru-RU')} ₽
                        </p>
                        {hasDiscount && (
                          <p className="text-[10px] md:text-xs text-green-600 font-medium mt-1">
                            Скидка {parseFloat(order.discount_amount).toLocaleString('ru-RU')} ₽
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {isOnlineUnpaid && (
                    <div className="px-4 md:px-6 py-3 md:py-4 bg-yellow-50 border-b-2 border-yellow-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-xl md:text-2xl">⚠️</span>
                        <div>
                          <p className="font-semibold text-yellow-800 text-sm md:text-base">Заказ не оплачен</p>
                          <p className="text-xs md:text-sm text-yellow-700">Оплатите заказ, чтобы мы начали его обработку</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRetryPayment(order)}
                        disabled={retryingPayment === order.id}
                        className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md text-sm"
                      >
                        {retryingPayment === order.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Загрузка...
                          </>
                        ) : (
                          <>💳 Оплатить сейчас</>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3 md:p-4 border-2 border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p className="font-semibold text-gray-700 text-sm md:text-base">Получатель</p>
                        </div>
                        <p className="font-bold text-gray-900 text-sm md:text-base">{order.customer_name || 'Не указано'}</p>
                        <p className="text-gray-900 text-sm">{order.customer_phone || 'Телефон не указан'}</p>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-3 md:p-4 border-2 border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                          </svg>
                          <p className="font-semibold text-blue-700 text-sm md:text-base">Доставка</p>
                        </div>
                        <p className="font-bold text-blue-900 text-sm md:text-base">{getDeliveryTypeText(order)}</p>
                        {order.delivery_city && (
                          <p className="text-blue-900 text-sm">
                            {order.delivery_city}
                            {order.delivery_address && `, ${order.delivery_address}`}
                          </p>
                        )}
                      </div>

                      <div className="bg-green-50 rounded-xl p-3 md:p-4 border-2 border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <p className="font-semibold text-green-700 text-sm md:text-base">Оплата</p>
                        </div>
                        <p className="font-bold text-green-900 text-sm md:text-base">{getPaymentTypeText(order)}</p>
                        <div className="mt-1">{getPaymentStatusBadge(order)}</div>
                      </div>
                    </div>

                    {order.promo_code && hasDiscount && (
                      <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 md:p-4 border-2 border-green-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center text-xl md:text-2xl">🎟️</div>
                            <div>
                              <p className="text-xs md:text-sm text-green-700 font-medium">Применён промокод</p>
                              <p className="text-base md:text-lg font-bold text-green-900">{order.promo_code.code}</p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs md:text-sm text-green-700">Скидка</p>
                            <p className="text-xl md:text-2xl font-bold text-green-600">
                              -{parseFloat(order.discount_amount).toLocaleString('ru-RU')} ₽
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="mt-4 md:mt-6 space-y-4 md:space-y-6 animate-fadeIn">
                        {order.items && order.items.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3 md:mb-4">
                              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              <h4 className="font-bold text-base md:text-lg">Товары в заказе ({order.items.length})</h4>
                            </div>

                            <div className="space-y-3">
                              {order.items.map(item => {
                                const isFreeReward = (item as any).is_free_reward;
                                const displayPrice = isFreeReward
                                  ? parseFloat(String((item as any).original_price || item.price))
                                  : parseFloat(String(item.price));

                                return (
                                  <div
                                    key={item.id}
                                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 md:p-4 rounded-xl transition border relative ${
                                      isFreeReward
                                        ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                    {item.return_status && (
                                      <div className="absolute top-2 right-2 z-10">
                                        {item.return_status.status === 'pending' && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-orange-500 text-white text-[10px] md:text-xs font-bold rounded-full shadow-lg">⏳ Возврат на рассмотрении</span>
                                        )}
                                        {item.return_status.status === 'approved' && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-green-500 text-white text-[10px] md:text-xs font-bold rounded-full shadow-lg">✅ Возврат одобрен</span>
                                        )}
                                        {item.return_status.status === 'rejected' && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full shadow-lg">❌ Возврат отклонён</span>
                                        )}
                                        {item.return_status.status === 'need_more_info' && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-blue-500 text-white text-[10px] md:text-xs font-bold rounded-full shadow-lg">📋 Нужна доп. информация</span>
                                        )}
                                        {item.return_status.status === 'completed' && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-gray-500 text-white text-[10px] md:text-xs font-bold rounded-full shadow-lg">✔️ Возврат завершён</span>
                                        )}
                                      </div>
                                    )}

                                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-lg flex-shrink-0 overflow-hidden border-2 ${isFreeReward ? 'border-emerald-200' : 'border-gray-200'} bg-white`}>
                                      {item.product_image ? (
                                        <OptimizedImage src={item.product_image} alt={item.product_name} width={80} height={80} className="w-full h-full object-cover" />
                                      ) : item.product?.image ? (
                                        <OptimizedImage src={getImageUrl(item.product.image)} alt={item.product_name} width={80} height={80} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-100">📦</div>
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-900 mb-1 text-sm md:text-base truncate">{item.product_name}</p>
                                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                                        <span>{item.quantity} шт.</span>
                                        <span>×</span>
                                        {isFreeReward ? (
                                          <span className="flex items-center gap-1.5">
                                            {displayPrice > 0 && (
                                              <span className="line-through text-gray-400">{displayPrice.toLocaleString('ru-RU')} ₽</span>
                                            )}
                                            <span className="text-emerald-600 font-bold">Бесплатно</span>
                                          </span>
                                        ) : (
                                          <span className="font-medium">{displayPrice.toLocaleString('ru-RU')} ₽</span>
                                        )}
                                      </div>
                                      {item.return_status && (
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] md:text-xs">
                                          <span className="text-gray-500">Возврат: <span className="font-semibold text-orange-600">{item.return_status.return_number}</span></span>
                                          <span className="text-gray-400">•</span>
                                          <span className="text-gray-500">Количество: <span className="font-semibold">{item.return_quantity} из {item.quantity} шт.</span></span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="text-right">
                                      {isFreeReward ? (
                                        <p className="text-base md:text-lg font-bold text-emerald-600">Бесплатно</p>
                                      ) : (
                                        <p className="text-base md:text-lg font-bold text-primary">
                                          {(item.quantity * displayPrice).toLocaleString('ru-RU')} ₽
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gray-50 rounded-xl space-y-2">
                              <div className="flex justify-between text-xs md:text-sm">
                                <span className="text-gray-600">Сумма товаров:</span>
                                <span className="font-semibold">{subtotal.toLocaleString('ru-RU')} ₽</span>
                              </div>
                              {hasDiscount && (
                                <div className="flex justify-between text-xs md:text-sm">
                                  <span className="text-green-600">Скидка по промокоду:</span>
                                  <span className="font-semibold text-green-600">-{parseFloat(order.discount_amount).toLocaleString('ru-RU')} ₽</span>
                                </div>
                              )}
                              <div className="flex justify-between text-xs md:text-sm">
                                <span className="text-gray-600">Доставка:</span>
                                <span className="font-semibold">
                                  {deliveryCost === 0 ? <span className="text-green-600">Бесплатно</span> : `${deliveryCost} ₽`}
                                </span>
                              </div>
                              <div className="pt-2 border-t-2 border-gray-200 flex justify-between">
                                <span className="font-bold text-sm md:text-base">Итого:</span>
                                <span className="font-bold text-primary text-base md:text-lg">{parseFloat(order.total_amount).toLocaleString('ru-RU')} ₽</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {order.comment && (
                          <div className="p-3 md:p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                            <p className="text-xs md:text-sm font-semibold text-blue-700 mb-2">💬 Комментарий к заказу:</p>
                            <p className="text-xs md:text-sm text-gray-700">{order.comment}</p>
                          </div>
                        )}

                        {order.active_returns && order.active_returns.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">🔄 Активные возвраты:</h5>
                            <div className="space-y-2">
                              {order.active_returns.map(returnItem => (
                                <div key={returnItem.id} className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 md:p-4 space-y-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                      <p className="font-semibold text-gray-900 text-sm md:text-base">Возврат {returnItem.return_number}</p>
                                      <p className="text-xs md:text-sm text-gray-600 mt-1">Причина: {returnItem.reason_display}</p>
                                      {returnItem.admin_comment && (
                                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                          <p className="text-[10px] md:text-xs font-semibold text-blue-700">💬 Комментарий магазина:</p>
                                          <p className="text-xs md:text-sm text-gray-700 mt-1">{returnItem.admin_comment}</p>
                                        </div>
                                      )}
                                      {returnItem.customer_required_action && (
                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                          <p className="text-[10px] md:text-xs font-semibold text-red-700">⚠️ Что требуется от вас:</p>
                                          <p className="text-xs md:text-sm text-red-800 mt-1 font-medium">{returnItem.customer_required_action}</p>
                                        </div>
                                      )}
                                      <p className="text-[10px] md:text-xs text-gray-500 mt-2">Создан: {new Date(returnItem.created_at).toLocaleDateString('ru-RU')}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                      {returnItem.status === 'pending' && <span className="inline-block px-3 py-1 md:px-4 md:py-2 bg-orange-500 text-white text-xs md:text-sm font-bold rounded-lg">⏳ На рассмотрении</span>}
                                      {returnItem.status === 'approved' && <span className="inline-block px-3 py-1 md:px-4 md:py-2 bg-green-500 text-white text-xs md:text-sm font-bold rounded-lg">✅ Одобрен</span>}
                                      {returnItem.status === 'rejected' && <span className="inline-block px-3 py-1 md:px-4 md:py-2 bg-red-500 text-white text-xs md:text-sm font-bold rounded-lg">❌ Отклонён</span>}
                                      {returnItem.status === 'need_more_info' && <span className="inline-block px-3 py-1 md:px-4 md:py-2 bg-blue-500 text-white text-xs md:text-sm font-bold rounded-lg">📋 Нужна информация</span>}
                                    </div>
                                  </div>
                                  {returnItem.status === 'need_more_info' && tokens && (
                                    <ReturnReplyForm returnId={returnItem.id} onSuccess={loadOrders} token={tokens.access} />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-3 md:pt-4 mt-3 md:mt-4 border-t-2 border-gray-100">
                      <button
                        onClick={() => toggleOrderDetails(order.id)}
                        className="flex-1 btn-primary text-center flex items-center justify-center gap-2 text-sm md:text-base py-2 md:py-3 px-3"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {isExpanded ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          )}
                        </svg>
                        {isExpanded ? 'Свернуть' : 'Подробнее'}
                      </button>

                      {isOnlineUnpaid && (
                        <button
                          onClick={() => handleRetryPayment(order)}
                          disabled={retryingPayment === order.id}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 md:py-3 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
                        >
                          {retryingPayment === order.id ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Загрузка...</>
                          ) : (
                            <>💳 Оплатить</>
                          )}
                        </button>
                      )}

                      {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'in_progress') && (
                        <button
                          onClick={() => handleCancelOrder(order)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 md:py-3 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Запросить отмену
                        </button>
                      )}

                      {order.status === 'awaiting_cancellation' && (
                        <div className="flex-1 bg-orange-50 border-2 border-orange-200 px-3 py-2 md:px-6 md:py-3 rounded-lg text-center">
                          <p className="text-orange-700 font-semibold text-xs md:text-sm">⏳ Ожидает подтверждения отмены</p>
                        </div>
                      )}

                      {order.status === 'delivered' && (
                        <>
                          <button
                            onClick={() => openReviewModal(order)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 md:py-3 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 text-sm md:text-base"
                          >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.101c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Оставить отзыв
                          </button>
                          <button
                            onClick={() => openReturnModal(order)}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 md:py-3 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 text-sm md:text-base"
                          >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Оформить возврат
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Модалка отзывов */}
      {reviewModalOpen && selectedOrderForReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 md:p-4" onClick={() => setReviewModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 md:p-6 border-b-2 border-gray-100 flex items-center justify-between">
              <h3 className="text-xl md:text-2xl font-bold">Выберите товар для отзыва</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              {selectedOrderForReview.items?.map(item => {
                const isFreeReward = (item as any).is_free_reward;
                const displayPrice = isFreeReward ? parseFloat(String((item as any).original_price ?? item.price)) : parseFloat(String(item.price));
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.product?.id) {
                        setReviewModalOpen(false);
                        router.push(`/product/${item.product.id}?review=true`);
                      }
                    }}
                    className="w-full flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border-2 border-transparent hover:border-primary cursor-pointer group"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-lg flex-shrink-0 overflow-hidden border-2 border-gray-200">
                      {item.product_image ? (
                        <OptimizedImage src={item.product_image} alt={item.product_name} width={80} height={80} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-100">📦</div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 group-hover:text-primary transition text-sm md:text-base">{item.product_name}</p>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        {item.quantity} шт. ×{' '}
                        {isFreeReward ? (
                          <><span className="line-through text-gray-400">{displayPrice.toLocaleString('ru-RU')} ₽</span>{' '}<span className="text-emerald-600 font-semibold">Бесплатно</span></>
                        ) : (
                          `${displayPrice.toLocaleString('ru-RU')} ₽`
                        )}
                      </p>
                    </div>
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-primary transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Модалка возврата */}
      {returnModalOpen && selectedOrderForReturn && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 p-4 md:p-6 rounded-t-2xl border-b border-orange-500/30 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Оформление возврата
                  </h3>
                  <p className="text-orange-100 text-sm">Заказ {selectedOrderForReturn.order_number}</p>
                </div>
                <button onClick={() => setReturnModalOpen(false)} className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-lg">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <label className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Выберите товары для возврата
                  </label>
                  <button onClick={selectAllReturnItems} className="text-xs md:text-sm text-orange-400 hover:text-orange-300 transition font-medium">Выбрать все</button>
                </div>

                <div className="space-y-2 md:space-y-3">
                  {selectedOrderForReturn.items?.map(item => {
                    const isSelected = selectedReturnItems.has(item.id);
                    const isFreeReward = (item as any).is_free_reward;
                    const displayPrice = isFreeReward ? parseFloat(String((item as any).original_price ?? item.price)) : parseFloat(String(item.price));
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleReturnItem(item.id)}
                        className={`flex items-center gap-3 p-3 md:p-4 rounded-xl cursor-pointer transition border-2 ${isSelected ? 'bg-orange-500/20 border-orange-500' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}
                      >
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 flex items-center justify-center transition flex-shrink-0 ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-600'}`}>
                          {isSelected && <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-900 border border-gray-700 flex-shrink-0">
                          {item.product_image ? (
                            <OptimizedImage src={item.product_image} alt={item.product_name} width={64} height={64} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm md:text-base truncate">{item.product_name}</p>
                          <p className="text-xs md:text-sm text-gray-400 mt-1">
                            Количество: {item.quantity} шт. •{' '}
                            {isFreeReward ? (
                              <><span className="line-through text-gray-500">{displayPrice.toLocaleString('ru-RU')} ₽</span>{' '}<span className="text-emerald-400 font-semibold">Бесплатно</span></>
                            ) : `${displayPrice.toLocaleString('ru-RU')} ₽`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {selectedReturnItems.size === 0 && <p className="text-red-400 text-xs md:text-sm mt-2">Выберите хотя бы один товар</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2 md:mb-3">Причина возврата</label>
                <select value={returnReason} onChange={e => setReturnReason(e.target.value)} className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-orange-500 focus:outline-none transition text-sm">
                  <option value="defective">Брак / неработает</option>
                  <option value="wrong_item">Неправильный товар</option>
                  <option value="not_as_described">Не соответствует описанию</option>
                  <option value="damaged">Повреждён при доставке</option>
                  <option value="changed_mind">Передумал(а)</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2 md:mb-3">Опишите проблему</label>
                <textarea
                  value={returnDescription}
                  onChange={e => setReturnDescription(e.target.value)}
                  rows={4}
                  placeholder="Расскажите, что не так с товаром..."
                  className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition resize-none text-sm"
                />
                {!returnDescription.trim() && <p className="text-red-400 text-xs md:text-sm mt-2">Пожалуйста, опишите причину возврата</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2 md:mb-3">Фото / видео проблемы (до 5 файлов)</label>
                <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="return-file-upload" />
                <label htmlFor="return-file-upload" className="flex items-center justify-center gap-2 md:gap-3 w-full p-4 md:p-6 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-gray-800 transition">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-gray-400 text-sm">Нажмите, чтобы выбрать файлы</span>
                </label>
                {returnFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 md:gap-3 mt-3 md:mt-4">
                    {returnFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                          {file.type.startsWith('image') ? (
                            <img src={URL.createObjectURL(file)} alt={`Превью ${index + 1}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 md:w-12 md:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </div>
                          )}
                        </div>
                        <button onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <p className="text-[10px] md:text-xs text-gray-400 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 border-t border-gray-700">
                <button onClick={() => setReturnModalOpen(false)} disabled={submittingReturn} className="flex-1 px-4 py-2 md:px-6 md:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition disabled:opacity-50 text-sm md:text-base">Отмена</button>
                <button
                  onClick={handleSubmitReturn}
                  disabled={submittingReturn || selectedReturnItems.size === 0 || !returnDescription.trim()}
                  className="flex-1 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 text-sm md:text-base"
                >
                  {submittingReturn ? (
                    <><svg className="animate-spin h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Отправка...</>
                  ) : (
                    <><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Отправить запрос</>
                  )}
                </button>
              </div>
              <p className="text-[10px] md:text-xs text-gray-400 text-center px-2">
                Ознакомьтесь с{' '}
                <Link href="/docs/returns" target="_blank" className="text-orange-400 hover:underline">
                  условиями возврата
                </Link>{' '}
                перед подачей заявки
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function ReturnReplyForm({ returnId, token, onSuccess }: { returnId: number; token: string; onSuccess: () => void }) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5));
  };
  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!message.trim() && files.length === 0) { alert('Добавьте сообщение или файлы'); return; }
    try {
      setLoading(true);
      const formData = new FormData();
      if (message.trim()) formData.append('message', message.trim());
      files.forEach(file => formData.append('media', file));
      await api.replyReturn(token, returnId, formData);
      setMessage(''); setFiles([]);
      onSuccess();
      alert('Ответ отправлен');
    } catch (e: any) {
      alert(e.message || 'Ошибка отправки ответа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 bg-white/70 border border-orange-300 rounded-xl p-3 md:p-4 space-y-3">
      <p className="text-xs md:text-sm font-semibold text-gray-800 flex items-center gap-2">
        <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
        Ответ на запрос магазина
      </p>
      <textarea className="w-full text-sm border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" rows={3} placeholder="Напишите ответ или уточнение" value={message} onChange={e => setMessage(e.target.value)} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-orange-700 cursor-pointer hover:text-orange-800 font-medium flex items-center gap-2">
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFiles} />
          <span>Добавить файлы (до 5)</span>
        </label>
        {files.length > 0 && <span className="text-xs text-gray-600">Файлов: {files.length}</span>}
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, idx) => (
            <div key={idx} className="px-2 py-1 md:px-3 md:py-1.5 bg-orange-100 border border-orange-300 rounded-full text-xs flex items-center gap-2">
              <span className="truncate max-w-[100px] md:max-w-[120px]">{f.name}</span>
              <button onClick={() => removeFile(idx)} className="text-red-500 hover:text-red-700 font-bold text-sm">×</button>
            </div>
          ))}
        </div>
      )}
      <button onClick={handleSubmit} disabled={loading} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition">
        {loading ? (
          <><svg className="animate-spin h-3 w-3 md:h-4 md:w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Отправка...</>
        ) : (
          <><svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Отправить ответ</>
        )}
      </button>
    </div>
  );
}