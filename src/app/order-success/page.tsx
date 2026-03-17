'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { tokens } = useAuth();
  const orderNumber = searchParams.get('order');
  const paymentParam = searchParams.get('payment');

  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'paid' | 'pending' | 'cancelled' | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [retryLoading, setRetryLoading] = useState(false);

  const fetchOrderAndCheck = async () => {
    if (!orderNumber) return;
    try {
      if (!tokens?.access) {
        setPaymentStatus('pending');
        return;
      }

      const orders = await api.getUserOrders(tokens.access);
      const order = orders?.find((o: any) => o.order_number === orderNumber);

      if (order) {
        setOrderId(order.id);
        const res = await api.checkPaymentStatus(order.id);
        if (res.payment_status === 'paid') {
          setPaymentStatus('paid');
        } else if (res.payment_status === 'cancelled') {
          setPaymentStatus('cancelled');
        } else {
          setPaymentStatus('pending');
        }
      } else {
        setPaymentStatus('pending');
      }
    } catch {
      setPaymentStatus('pending');
    }
  };

  useEffect(() => {
    if (!orderNumber) {
      router.push('/');
      return;
    }

    if (paymentParam === 'pending') {
      setPaymentStatus('pending');
    } else if (paymentParam === 'cancelled') {
      setPaymentStatus('cancelled');
    } else {
      setPaymentStatus('checking');
      fetchOrderAndCheck();
    }
  }, [orderNumber, paymentParam, tokens]);

  // Polling если pending и orderId известен
  useEffect(() => {
    if (!orderId || paymentStatus !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const res = await api.checkPaymentStatus(orderId);
        if (res.payment_status === 'paid') {
          setPaymentStatus('paid');
          clearInterval(interval);
        } else if (res.payment_status === 'cancelled') {
          setPaymentStatus('cancelled');
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, paymentStatus]);

  const handleRetryPayment = async () => {
    if (!orderId) return;
    setRetryLoading(true);
    try {
      const res = await api.createPayment(orderId);
      if (res.success && res.payment_url) {
        window.location.href = res.payment_url;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRetryLoading(false);
    }
  };

  if (!orderNumber) return null;

  const renderIcon = () => {
    if (paymentStatus === 'paid') {
      return (
        <div className="inline-flex items-center justify-center w-32 h-32 bg-green-100 rounded-full mb-6 animate-bounce">
          <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (paymentStatus === 'cancelled') {
      return (
        <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-6">
          <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    if (paymentStatus === 'checking') {
      return (
        <div className="inline-flex items-center justify-center w-32 h-32 bg-yellow-100 rounded-full mb-6">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-yellow-500" />
        </div>
      );
    }
    return (
      <div className="inline-flex items-center justify-center w-32 h-32 bg-green-100 rounded-full mb-6 animate-bounce">
        <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  };

  const renderTitle = () => {
    if (paymentStatus === 'paid') return { title: 'Оплата прошла успешно! 🎉', sub: 'Заказ подтверждён и принят в работу' };
    if (paymentStatus === 'cancelled') return { title: 'Оплата отменена ❌', sub: 'Заказ отменён — оформите новый и оплатите' };
    if (paymentStatus === 'checking') return { title: 'Проверяем оплату...', sub: 'Пожалуйста, подождите' };
    return { title: 'Заказ оформлен! 🎉', sub: 'Ожидает оплаты' };
  };

  const { title, sub } = renderTitle();

  return (
    <div className={`min-h-screen ${paymentStatus === 'cancelled' ? 'bg-gradient-to-br from-red-50 to-orange-50' : 'bg-gradient-to-br from-green-50 to-blue-50'}`}>
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-8">
            {renderIcon()}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-xl text-gray-600">{sub}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-6 pb-6 border-b">
              <p className="text-gray-600 mb-2">Номер вашего заказа:</p>
              <p className="text-3xl font-bold text-primary">{orderNumber}</p>
            </div>

            {/* Отмена */}
            {paymentStatus === 'cancelled' && (
              <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">❌</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">Оплата не была совершена</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Заказ <strong>{orderNumber}</strong> отменён. Перезакажите и оплатите,
                      чтобы мы могли приступить к работе.
                    </p>
                    <Link href="/cart" className="w-full btn-primary py-3 font-bold text-center block">
                      🛒 Перейти в корзину и оформить заново
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Pending */}
            {paymentStatus === 'pending' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl flex-shrink-0">⏳</span>
                  <div>
                    <p className="font-semibold text-gray-900">Ожидает оплаты</p>
                    <p className="text-sm text-gray-600">Статус обновится автоматически после оплаты</p>
                  </div>
                </div>
                {orderId && (
                  <button
                    onClick={handleRetryPayment}
                    disabled={retryLoading}
                    className="w-full btn-primary py-3 font-bold disabled:opacity-50"
                  >
                    {retryLoading ? 'Создаём ссылку...' : '💳 Оплатить сейчас'}
                  </button>
                )}
              </div>
            )}

            {/* Checking */}
            {paymentStatus === 'checking' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Ожидаем подтверждение оплаты...</p>
                  <p className="text-sm text-gray-600">Это займёт несколько секунд</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">📧</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Мы отправили подтверждение</h3>
                  <p className="text-sm text-gray-600">Детали заказа отправлены на вашу электронную почту</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">✅</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Заказ принят в обработку</h3>
                  <p className="text-sm text-gray-600">Мы свяжемся с вами для подтверждения заказа</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">📦</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Отслеживайте статус</h3>
                  <p className="text-sm text-gray-600">Следите за статусом заказа в личном кабинете</p>
                </div>
              </div>
            </div>
          </div>

          {paymentStatus !== 'cancelled' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <h2 className="text-2xl font-bold mb-6">Что дальше?</h2>
              <div className="space-y-4">
                {[
                  { n: 1, title: 'Обработка заказа', desc: 'Мы проверим наличие товаров и свяжемся с вами' },
                  { n: 2, title: 'Подготовка к отправке', desc: 'Упакуем заказ и подготовим к доставке' },
                  { n: 3, title: 'Доставка', desc: 'Курьер доставит заказ в указанное время' },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{n}</div>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/profile/orders" className="btn-primary text-center py-4 flex items-center justify-center gap-2">
              📦 Мои заказы
            </Link>
            <Link href="/catalog" className="btn-secondary text-center py-4 flex items-center justify-center gap-2">
              🛍️ Продолжить покупки
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
