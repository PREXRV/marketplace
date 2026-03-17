'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    promoCode,
    applyPromoCode,
    removePromoCode,
    getFinalTotal,
    getDiscountAmount
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const subtotal = getTotalPrice();
  const discount = getDiscountAmount();
  const finalTotal = getFinalTotal();

  // ✅ Есть ли наградной товар в корзине
  const hasFreeRewardItem = cart.some(item => item.is_free_reward === true);

  const handlePromoApply = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    await applyPromoCode(promoInput.trim());
    setIsApplyingPromo(false);
  };

  const handlePromoRemove = () => {
    removePromoCode();
    setPromoInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">

        {/* Заголовок */}
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h1 className="text-3xl font-bold">Корзина</h1>
          {cart.length > 0 && (
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
              {cart.length} {cart.length === 1 ? 'товар' : 'товара'}
            </span>
          )}
        </div>

        {/* ✅ Баннер бесплатной доставки */}
        {hasFreeRewardItem && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <div className="text-3xl">🎁</div>
            <div>
              <p className="font-bold">Бесплатная доставка!</p>
              <p className="text-sm opacity-90">В корзине есть наградной товар — доставка будет бесплатной</p>
            </div>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold mb-3">Корзина пуста</h2>
            <p className="text-gray-600 mb-6">Добавьте товары из каталога, чтобы оформить заказ</p>
            <Link href="/catalog" className="btn-primary inline-block">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Список товаров */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map(item => (
                <div
                  key={`${item.id}-${item.variantId || 'base'}`}
                  className={`bg-white rounded-xl shadow-md p-5 flex gap-5 hover:shadow-lg transition ${
                    item.is_free_reward ? 'border-2 border-green-200' : ''
                  }`}
                >
                  {/* Изображение */}
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EНет фото%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {/* ✅ Бейдж наградного товара */}
                    {item.is_free_reward && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                        Бесплатно
                      </div>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1 text-gray-900">{item.name}</h3>
                      {item.variant && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Вариант:</span> {item.variant}
                        </p>
                      )}
                      {item.is_free_reward ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-green-600">0 ₽</span>
                          <span className="text-sm line-through text-gray-400">
                            {/* Оригинальная цена не хранится, просто показываем бейдж */}
                          </span>
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                            Награда
                          </span>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-primary">
                          {item.price.toLocaleString('ru-RU')} ₽
                        </p>
                      )}
                    </div>

                    {/* Количество и итог */}
                    <div className="flex items-center justify-between mt-3">

                      {/* ✅ Счётчик — для наградного заблокирован */}
                      {item.is_free_reward ? (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                          <span className="text-green-700 text-sm font-medium">🎁 × 1 (бесплатно)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow transition font-bold text-gray-700"
                          >
                            −
                          </button>
                          <span className="w-10 text-center font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow transition font-bold text-gray-700"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* Сумма за товар */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Итого:</p>
                        <p className="text-xl font-bold text-primary">
                          {item.is_free_reward
                            ? '0 ₽'
                            : (item.price * item.quantity).toLocaleString('ru-RU') + ' ₽'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Кнопка удаления */}
                  <button
                    onClick={() => removeFromCart(item.id, item.variantId)}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition"
                    title="Удалить из корзины"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Правая колонка */}
            <div className="space-y-4">

              {/* Промокод */}
              <div className="bg-white rounded-xl shadow-md p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Промокод
                </h3>

                {!promoCode ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handlePromoApply()}
                      placeholder="Введите промокод"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition uppercase"
                      disabled={isApplyingPromo}
                    />
                    <button
                      onClick={handlePromoApply}
                      disabled={isApplyingPromo || !promoInput.trim()}
                      className="w-full sm:w-auto whitespace-nowrap px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isApplyingPromo ? 'Проверяем...' : 'Применить'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold text-green-700">{promoCode.code}</span>
                      </div>
                      <button onClick={handlePromoRemove} className="text-red-500 hover:text-red-700 font-semibold text-sm">
                        Удалить
                      </button>
                    </div>
                    <p className="text-sm text-green-700">
                      Скидка: <strong>{discount.toLocaleString('ru-RU')} ₽</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Итого */}
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Итого к оплате
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Сумма товаров:</span>
                    <span className="font-semibold">{subtotal.toLocaleString('ru-RU')} ₽</span>
                  </div>

                  {/* ✅ Строка бесплатной доставки по награде */}
                  {hasFreeRewardItem && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Доставка (награда):</span>
                      <span className="font-bold">Бесплатно</span>
                    </div>
                  )}

                  {discount > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          Промокод <strong className="ml-1">{promoCode?.code}</strong>:
                        </span>
                        <span className="font-bold">−{discount.toLocaleString('ru-RU')} ₽</span>
                      </div>
                      <div className="h-px bg-gray-200" />
                    </>
                  )}

                  <div className="flex justify-between text-xl font-bold text-primary pt-2">
                    <span>Итого:</span>
                    <span>{finalTotal.toLocaleString('ru-RU')} ₽</span>
                  </div>

                  {discount > 0 && (
                    <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm text-center font-medium">
                      💰 Вы экономите {discount.toLocaleString('ru-RU')} ₽
                    </div>
                  )}
                </div>

                <Link href="/checkout" className="block">
                  <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                    Оформить заказ
                  </button>
                </Link>

                <div className="mt-6 space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Бесплатная доставка при заказе от 3000 ₽</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Возврат в течение 14 дней</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Гарантия качества товаров</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
