'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { api, Address, DeliveryMethod, PaymentMethod, getImageUrl } from '@/lib/api';

export default function CheckoutPage() {
  const {
    cart,
    clearCart,
    promoCode,
    getFinalTotal,
    getDiscountAmount,
    getTotalPrice
  } = useCart();

  const { user, tokens, isAuthenticated } = useAuth();
  const router = useRouter();

  const hasFreeRewardItem = cart.some(item => item.is_free_reward === true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [defaultAddressDeliveryMethodId, setDefaultAddressDeliveryMethodId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethod | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_city: '',
    delivery_address: '',
    comment: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
      return;
    }
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        customer_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        customer_phone: user.phone || '',
        customer_email: user.email || '',
        delivery_city: user.city || '',
      }));
    }
    initializeCheckout();
  }, [cart, isAuthenticated, user, tokens]);

  const initializeCheckout = async () => {
    await loadDeliveryAndPaymentMethods();
    if (isAuthenticated && tokens) {
      await loadAddresses();
    }
  };

  const loadDeliveryAndPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const orderAmount = getTotalPrice();
      const [deliveryData, paymentData] = await Promise.all([
        api.getDeliveryMethods(orderAmount),
        api.getPaymentMethods()
      ]);
      setDeliveryMethods(deliveryData);
      setPaymentMethods(paymentData);
      if (paymentData.length > 0) setSelectedPaymentMethod(paymentData[0]);
    } catch (error) {
      console.error('Ошибка загрузки способов доставки/оплаты:', error);
      setError('Не удалось загрузить способы доставки и оплаты');
    } finally {
      setLoadingMethods(false);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const data = await api.getAddresses(tokens!.access);
      let addressList: Address[] = Array.isArray(data) ? data : (data as any)?.results || [];
      setAddresses(addressList);

      const defaultAddress = addressList.find(addr => addr.is_default);
      if (defaultAddress && defaultAddress.delivery_method) {
        setDefaultAddressDeliveryMethodId(defaultAddress.delivery_method);
        const matchingDeliveryMethod = deliveryMethods.find(m => m.id === defaultAddress.delivery_method);
        setSelectedDeliveryMethod(matchingDeliveryMethod || deliveryMethods[0] || null);
        autoFillAddress(defaultAddress);
      } else if (deliveryMethods.length > 0) {
        setSelectedDeliveryMethod(deliveryMethods[0]);
      }
    } catch (error) {
      console.error('Ошибка загрузки адресов:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const autoFillAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    setFormData(prev => ({
      ...prev,
      delivery_city: address.city,
      delivery_address: `${address.street}, д. ${address.house}${address.apartment ? `, кв. ${address.apartment}` : ''}${address.entrance ? `, подъезд ${address.entrance}` : ''}${address.floor ? `, этаж ${address.floor}` : ''}`,
    }));
  };

  const handleDeliveryMethodChange = (method: DeliveryMethod) => {
    setSelectedDeliveryMethod(method);
    const matchingAddress = addresses.find(addr => addr.delivery_method === method.id);
    if (matchingAddress) {
      autoFillAddress(matchingAddress);
    } else if (addresses.length > 0) {
      autoFillAddress(addresses.find(a => a.is_default) || addresses[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliveryMethod) { setError('Выберите способ доставки'); return; }
    if (!selectedPaymentMethod) { setError('Выберите способ оплаты'); return; }

    setLoading(true);
    setError('');

    try {
      const subtotal = getTotalPrice();
      const discountAmount = getDiscountAmount();
      const deliveryPrice = hasFreeRewardItem
        ? 0
        : selectedDeliveryMethod 
          ? parseFloat((selectedDeliveryMethod as any).current_price || '0')
          : 0;
      const originalDeliveryPrice = selectedDeliveryMethod 
        ? parseFloat((selectedDeliveryMethod as any).current_price || '0') 
        : 0;
      const finalTotal = getFinalTotal() + deliveryPrice;

      const refToken = typeof window !== 'undefined'
        ? (cart.find(item => item.ref_token)?.ref_token ?? sessionStorage.getItem('ref_token'))
        : null;

      const orderData = {
        ...formData,
        address_id: selectedAddressId,
        delivery_method_id: selectedDeliveryMethod.id,
        payment_method_id: selectedPaymentMethod.id,
        delivery_type: selectedDeliveryMethod.code,
        payment_type: selectedPaymentMethod.code,
        delivery_price: deliveryPrice.toString(),
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.is_free_reward ? '0.00' : item.price.toString(),
          is_free_reward: item.is_free_reward ?? false,
          original_price: item.is_free_reward ? item.price.toString() : null,
        })),
        ref_token: refToken ?? null,
        user_id: user?.id || null,
        promo_code: promoCode?.code || null,
        discount_amount: discountAmount.toString(),
        subtotal: subtotal.toString(),
        total_amount: finalTotal.toString(),
        free_reward_purchase_id: hasFreeRewardItem
          ? cart.find(i => i.is_free_reward)?.free_purchase_id || null
          : null,
      };

      const order = await api.createOrder(orderData);

      // ✅ Трекинг партнёра
      if (refToken) {
        const { partnershipAPI } = await import('@/services/api');
        await partnershipAPI.trackPurchase(refToken);
      }

      clearCart();

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ref_token');
      }

      // ✅ ЮКАССА: если выбрана онлайн-оплата — создаём платёж и редиректим
      if (selectedPaymentMethod.code === 'online') {
        const paymentRes = await api.createPayment(order.order_id);
        if (paymentRes.success && paymentRes.payment_url) {
          window.location.href = paymentRes.payment_url;
          return;
        } else {
          // Платёж не создался — всё равно идём на страницу успеха, оплатить можно будет там
          router.push(`/order-success?order=${order.order_number}&payment=pending`);
          return;
        }
      }

      // Для других способов оплаты — обычный редирект
      window.location.href = `/order-success?order=${order.order_number}`;

    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getTotalPrice();
  const discountAmount = getDiscountAmount();
  const deliveryPrice = hasFreeRewardItem
    ? 0
    : selectedDeliveryMethod 
      ? parseFloat((selectedDeliveryMethod as any).current_price || '0')
      : 0;

  const originalDeliveryPrice = selectedDeliveryMethod 
    ? parseFloat((selectedDeliveryMethod as any).current_price || '0') 
    : 0;
  const finalTotal = getFinalTotal() + deliveryPrice;

  if (loadingMethods) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 text-sm text-gray-600 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition">Главная</Link>
          <span>›</span>
          <Link href="/cart" className="hover:text-primary transition">Корзина</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Оформление заказа</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>

        {hasFreeRewardItem && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <div className="text-4xl">🎁</div>
            <div>
              <p className="font-bold text-lg">Бесплатная доставка!</p>
              <p className="text-sm opacity-90">
                В вашем заказе есть бесплатный товар из магазина наград — доставка в подарок 🎉
              </p>
            </div>
            {originalDeliveryPrice > 0 && (
              <div className="ml-auto text-right flex-shrink-0">
                <p className="text-sm opacity-75 line-through">{originalDeliveryPrice} ₽</p>
                <p className="font-black text-xl">0 ₽</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {isAuthenticated && user && (
                <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                      {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Оформляете заказ как</p>
                      <p className="text-xl font-bold">{user.first_name || user.username}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Шаг 1: Контактные данные */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">1</span>
                  Контактные данные
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ФИО <span className="text-red-500">*</span></label>
                    <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Иван Иванов" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Телефон <span className="text-red-500">*</span></label>
                    <input type="tel" name="customer_phone" value={formData.customer_phone} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="+7 (999) 123-45-67" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                    <input type="email" name="customer_email" value={formData.customer_email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="ivan@example.com" />
                  </div>
                </div>
              </div>

              {/* Шаг 2: Способ доставки */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Способ доставки
                  {hasFreeRewardItem && (
                    <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                      🎁 Бесплатно для вас
                    </span>
                  )}
                </h2>

                {deliveryMethods.length === 0 ? (
                  <p className="text-gray-600">Нет доступных способов доставки</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {deliveryMethods.map((method) => {
                        const price = parseFloat((method as any).current_price || '0');
                        const originalPrice = parseFloat((method as any).price || '0');
                        const isFreeByAmount = price === 0 && originalPrice > 0;
                        const isDefaultMethod = defaultAddressDeliveryMethodId === method.id;

                        return (
                          <label
                            key={method.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition relative ${
                              selectedDeliveryMethod?.id === method.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <input type="radio" name="delivery_method" checked={selectedDeliveryMethod?.id === method.id} onChange={() => handleDeliveryMethodChange(method)} className="sr-only" />

                            {isDefaultMethod && (
                              <span className="absolute top-2 right-2 text-xs bg-primary text-white px-2 py-1 rounded-full">Основной</span>
                            )}

                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                                {method.icon_url ? (
                                  <Image src={method.icon_url} alt={method.name} width={48} height={48} className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-2xl">🚚</span>
                                )}
                              </div>
                              <div className="flex-1 pr-16">
                                <p className="font-semibold">{method.name}</p>
                                <p className="text-sm text-gray-600">
                                  {hasFreeRewardItem ? (
                                    <>
                                      {price > 0 && <span className="line-through text-gray-400">{price} ₽ </span>}
                                      <span className="text-green-600 font-bold">Бесплатно 🎁</span>
                                    </>
                                  ) : isFreeByAmount ? (
                                    <>
                                      <span className="line-through text-gray-400">{originalPrice} ₽</span>
                                      {' '}<span className="text-green-600 font-bold">Бесплатно!</span>
                                    </>
                                  ) : price === 0 ? 'Бесплатно' : `${price} ₽`}
                                  {' • '}{method.delivery_time}
                                </p>
                                {method.description && <p className="text-xs text-gray-500 mt-1">{method.description}</p>}
                                {(method as any).free_from_amount && !isFreeByAmount && !hasFreeRewardItem && (
                                  <p className="text-xs text-primary mt-1">
                                    Бесплатно от {parseFloat((method as any).free_from_amount).toLocaleString('ru-RU')} ₽
                                  </p>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {selectedDeliveryMethod && selectedDeliveryMethod.code !== 'pickup' && (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Город <span className="text-red-500">*</span></label>
                          <input type="text" name="delivery_city" value={formData.delivery_city} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Москва" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Адрес доставки <span className="text-red-500">*</span></label>
                          <input type="text" name="delivery_address" value={formData.delivery_address} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="ул. Пушкина, д. 10, кв. 5" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Шаг 3: Способ оплаты */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">3</span>
                  Способ оплаты
                </h2>
                {paymentMethods.length === 0 ? (
                  <p className="text-gray-600">Нет доступных способов оплаты</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                          selectedPaymentMethod?.id === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input type="radio" name="payment_method" checked={selectedPaymentMethod?.id === method.id} onChange={() => setSelectedPaymentMethod(method)} className="sr-only" />
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                            {method.icon_url ? (
                              <Image src={method.icon_url} alt={method.name} width={64} height={64} className="w-full h-full object-contain p-2" />
                            ) : method.code === 'online' ? (
                              <svg viewBox="0 0 80 40" className="w-14 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="80" height="40" rx="6" fill="#FFFFFF"/>
                                <path d="M10 28V12h4.5c2.5 0 4.2 1.4 4.2 3.8 0 1.6-.8 2.8-2 3.4l2.8 4.8h-3.2l-2.4-4.2H13V28h-3zm3-6.8h1.3c1 0 1.6-.6 1.6-1.5 0-.9-.6-1.4-1.6-1.4H13v2.9z" fill="#1A1A2E"/>
                                <path d="M21 28V12h8.5v2.6H24v3.6h5v2.5h-5v4.7h5.6V28H21z" fill="#1A1A2E"/>
                                <path d="M38.5 28.3c-3.8 0-6.4-2.8-6.4-6.5 0-3.7 2.6-6.5 6.4-6.5 2.2 0 4 1 5 2.6l-2.3 1.5c-.6-1-1.6-1.5-2.7-1.5-2 0-3.3 1.6-3.3 3.9s1.3 3.9 3.3 3.9c1.1 0 2.1-.6 2.7-1.6l2.3 1.4c-1 1.7-2.8 2.8-5 2.8z" fill="#FF6600"/>
                                <path d="M45 28V12h3v6.5l4.8-6.5H56l-5 6.7 5.3 9.3h-3.4l-3.8-7-1.1 1.5V28H45z" fill="#FF6600"/>
                                <path d="M57 28V12h3v16h-3z" fill="#FF6600"/>
                                <path d="M62 21.8c0-3.7 2.7-6.5 6.5-6.5s6.5 2.8 6.5 6.5-2.7 6.5-6.5 6.5-6.5-2.8-6.5-6.5zm9.9 0c0-2.3-1.4-3.9-3.4-3.9s-3.4 1.6-3.4 3.9 1.4 3.9 3.4 3.9 3.4-1.6 3.4-3.9z" fill="#FF6600"/>
                              </svg>
                            ) : (
                              <span className="text-3xl">
                                {method.code === 'cash' ? '💵' : '🏦'}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold">{method.name}</p>
                          {method.additional_info && <p className="text-xs text-gray-600 mt-1">{method.additional_info}</p>}
                          {/* ✅ Подсказка для онлайн-оплаты */}
                          {method.code === 'online' && (
                            <p className="text-xs text-primary mt-1 font-medium">
                              Оплата через ЮКассу →
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* ✅ Инфо-блок когда выбрана онлайн-оплата */}
                {selectedPaymentMethod?.code === 'online' && (
                  <div className="mt-4 p-4 bg-[#FFF3EC] border border-[#FF6600]/20 rounded-lg flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-[#1A1A2E] text-sm">Безопасная онлайн-оплата</p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        Visa, Mastercard, МИР, СБП и другие способы. После оформления вы будете перенаправлены на страницу ЮКассы.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Комментарий */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Комментарий к заказу</h2>
                <textarea name="comment" value={formData.comment} onChange={handleChange} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Дополнительная информация,можете указать удобный способ связи" />
              </div>
              {/* Правовые ссылки перед оплатой */}
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <Link href="/docs/terms" target="_blank" className="text-primary hover:underline">
                  офертой
                </Link>
                ,{' '}
                <Link href="/docs/payment" target="_blank" className="text-primary hover:underline">
                  условиями оплаты
                </Link>{' '}
                ,{' '}
                <Link href="/docs/returns" target="_blank" className="text-primary hover:underline">
                  возврата 
                </Link>
                {' '}и{' '}
                <Link href="/docs/delivery" target="_blank" className="text-primary hover:underline">
                  доставки
                </Link>
              </p>

              {/* ✅ Кнопка меняет текст в зависимости от способа оплаты */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? (selectedPaymentMethod?.code === 'online' ? 'Переходим к оплате...' : 'Оформляем заказ...')
                  : selectedPaymentMethod?.code === 'online'
                    ? `Перейти к оплате ${finalTotal.toLocaleString('ru-RU')} ₽`
                    : `Оформить заказ на ${finalTotal.toLocaleString('ru-RU')} ₽`
                }
              </button>
            </form>
          </div>

          {/* Правая колонка */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.variantId || 'default'}`} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                      {item.image ? (
                        <Image src={getImageUrl(item.image)} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                      )}
                      {item.is_free_reward && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs">🎁</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                      <p className="text-sm text-gray-600">
                        {item.quantity} ×{' '}
                        {item.is_free_reward ? (
                          <span className="text-green-600 font-bold">0 ₽ 🎁</span>
                        ) : (
                          `${item.price.toLocaleString('ru-RU')} ₽`
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Товары ({cart.length}):</span>
                  <span className="font-semibold">{subtotal.toLocaleString('ru-RU')} ₽</span>
                </div>

                {promoCode && discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">🎟️ Промокод {promoCode.code}</span>
                    <span className="font-semibold text-green-600">−{discountAmount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Доставка:</span>
                  <div className="text-right">
                    {hasFreeRewardItem ? (
                      <>
                        {originalDeliveryPrice > 0 && (
                          <span className="line-through text-gray-400 text-xs mr-1">
                            {originalDeliveryPrice.toLocaleString('ru-RU')} ₽
                          </span>
                        )}
                        <span className="font-bold text-green-600">0 ₽ 🎁</span>
                      </>
                    ) : (
                      <span className="font-semibold">
                        {deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice.toLocaleString('ru-RU')} ₽`}
                      </span>
                    )}
                    {selectedDeliveryMethod && 
                     (selectedDeliveryMethod as any).free_from_amount && 
                     deliveryPrice > 0 && !hasFreeRewardItem &&
                     subtotal < parseFloat((selectedDeliveryMethod as any).free_from_amount) && (
                      <div className="text-xs text-primary mt-1">
                        Бесплатно от {parseFloat((selectedDeliveryMethod as any).free_from_amount).toLocaleString('ru-RU')} ₽
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Итого:</span>
                  <span className="text-primary">{finalTotal.toLocaleString('ru-RU')} ₽</span>
                </div>

                {hasFreeRewardItem && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                    🎁 Бесплатный товар из магазина наград + бесплатная доставка!
                  </div>
                )}

                {promoCode && discountAmount > 0 && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                    ✨ Вы экономите {discountAmount.toLocaleString('ru-RU')} ₽ по промокоду!
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-green-500">✓</span><span>Безопасная оплата</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-green-500">✓</span><span>Гарантия качества</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-green-500">✓</span><span>Возврат 14 дней</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
