'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  variantId?: number;
  is_free_reward?: boolean;
  free_purchase_id?: number;
  ref_token?: string | null; // ✅
}

interface PromoCode {
  code: string;
  discount_type: string;
  discount_value: string;
  discount_amount: string;
  final_total: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: number, variantId?: number) => void;
  updateQuantity: (id: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getItemCount: (id: number, variantId?: number) => number;
  promoCode: PromoCode | null;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
  getFinalTotal: () => number;
  getDiscountAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedPromo = localStorage.getItem('promoCode');

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
        localStorage.removeItem('cart');
      }
    }

    if (savedPromo) {
      try {
        setPromoCode(JSON.parse(savedPromo));
      } catch (error) {
        console.error('Ошибка загрузки промокода:', error);
        localStorage.removeItem('promoCode');
      }
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(cart));
      if (promoCode) {
        revalidatePromoCode();
      }
    }
  }, [cart, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      if (promoCode) {
        localStorage.setItem('promoCode', JSON.stringify(promoCode));
      } else {
        localStorage.removeItem('promoCode');
      }
    }
  }, [promoCode, isInitialized]);

  const findCartItem = (id: number, variantId?: number, isFreeReward?: boolean) => {
    return cart.find((item) => {
      if (variantId) {
        return item.id === id && item.variantId === variantId && !!item.is_free_reward === !!isFreeReward;
      }
      return item.id === id && !item.variantId && !!item.is_free_reward === !!isFreeReward;
    });
  };

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    // ✅ Подхватываем ref_token из sessionStorage если не передан явно
    const refToken = item.ref_token !== undefined
      ? item.ref_token
      : (typeof window !== 'undefined' ? sessionStorage.getItem('ref_token') : null);

    setCart((prevCart) => {
      const existingItem = findCartItem(item.id, item.variantId, item.is_free_reward);

      if (existingItem) {
        if (existingItem.is_free_reward) {
          showNotification('🎁 Бесплатный товар уже в корзине!', 'info');
          return prevCart;
        }
        return prevCart.map((cartItem) => {
          const isMatch = item.variantId
            ? cartItem.id === item.id && cartItem.variantId === item.variantId
            : cartItem.id === item.id && !cartItem.variantId;
          if (isMatch) {
            return { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) };
          }
          return cartItem;
        });
      }

      return [
        ...prevCart,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.is_free_reward ? 1 : (item.quantity || 1),
          image: item.image,
          variant: item.variant,
          variantId: item.variantId,
          is_free_reward: item.is_free_reward ?? false,
          free_purchase_id: item.free_purchase_id ?? undefined,
          ref_token: refToken ?? null, // ✅
        },
      ];
    });

    showNotification('✅ Товар добавлен в корзину!', 'success');
  };

  const removeFromCart = (id: number, variantId?: number) => {
    setCart((prevCart) => {
      return prevCart.filter((item) => {
        if (variantId) return !(item.id === id && item.variantId === variantId);
        return !(item.id === id && !item.variantId);
      });
    });
    showNotification('🗑️ Товар удален из корзины', 'info');
  };

  const updateQuantity = (id: number, quantity: number, variantId?: number) => {
    if (quantity <= 0) {
      removeFromCart(id, variantId);
      return;
    }
    setCart((prevCart) => {
      return prevCart.map((item) => {
        const isMatch = variantId
          ? item.id === id && item.variantId === variantId
          : item.id === id && !item.variantId;
        if (isMatch) return { ...item, quantity };
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode(null);
    showNotification('🧹 Корзина очищена', 'info');
  };

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const getTotalItems = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  const getItemCount = (id: number, variantId?: number) => {
    const item = findCartItem(id, variantId);
    return item ? item.quantity : 0;
  };

  const applyPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const cartTotal = getTotalPrice();
      const response = await fetch('https://fulfilling-success-production-3288.up.railway.app/api/promo-codes/validate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase(), order_amount: cartTotal }),
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        setPromoCode({
          code: data.code,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          discount_amount: data.discount_amount.toString(),
          final_total: (cartTotal - data.discount_amount).toString(),
        });
        showNotification(`✅ ${data.message || 'Промокод применён!'}`, 'success');
        return { success: true, message: data.message || 'Промокод применён!' };
      } else {
        showNotification(`❌ ${data.error || 'Промокод недействителен'}`, 'error');
        return { success: false, message: data.error || 'Ошибка применения промокода' };
      }
    } catch (error) {
      console.error('Ошибка применения промокода:', error);
      showNotification('❌ Ошибка соединения с сервером', 'error');
      return { success: false, message: 'Ошибка сервера' };
    }
  };

  const removePromoCode = () => {
    setPromoCode(null);
    showNotification('🗑️ Промокод удален', 'info');
  };

  const getFinalTotal = () => {
    const total = getTotalPrice();
    if (promoCode) return parseFloat(promoCode.final_total);
    return total;
  };

  const getDiscountAmount = () => {
    if (promoCode) return parseFloat(promoCode.discount_amount);
    return 0;
  };

  const revalidatePromoCode = async () => {
    if (promoCode && cart.length > 0) {
      const cartTotal = getTotalPrice();
      try {
        const response = await fetch('https://fulfilling-success-production-3288.up.railway.app/api/promo-codes/validate/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: promoCode.code, order_amount: cartTotal }),
        });
        const data = await response.json();
        if (response.ok && data.valid) {
          setPromoCode({
            code: data.code,
            discount_type: data.discount_type,
            discount_value: data.discount_value,
            discount_amount: data.discount_amount.toString(),
            final_total: (cartTotal - data.discount_amount).toString(),
          });
        } else {
          setPromoCode(null);
          showNotification('⚠️ Промокод больше не действителен', 'info');
        }
      } catch (error) {
        console.error('Ошибка пересчёта промокода:', error);
        setPromoCode(null);
      }
    } else if (promoCode && cart.length === 0) {
      setPromoCode(null);
    }
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const colors = { success: 'bg-green-500', info: 'bg-blue-500', error: 'bg-red-500' };
    const icons = {
      success: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
      info: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
      error: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
    };
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-[9999] animate-fade-in`;
    notification.innerHTML = `<div class="flex items-center gap-3">${icons[type]}<span class="font-medium">${message}</span></div>`;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'fade-out 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getItemCount,
        promoCode,
        applyPromoCode,
        removePromoCode,
        getFinalTotal,
        getDiscountAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
