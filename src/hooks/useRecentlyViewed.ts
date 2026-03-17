'use client';

import { useState, useEffect, useCallback } from 'react'; // ✅ Добавили useCallback

export interface RecentlyViewedProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  final_price?: string;
  discount_percentage?: number;
  image: string;
  viewedAt: number;
}

const STORAGE_KEY = 'recently_viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    const loadRecentProducts = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const products: RecentlyViewedProduct[] = JSON.parse(stored);
          const sorted = products.sort((a, b) => b.viewedAt - a.viewedAt);
          setRecentProducts(sorted.slice(0, MAX_ITEMS));
        }
      } catch (error) {
        console.error('Ошибка загрузки истории просмотров:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadRecentProducts();
  }, []);

  // ✅ useCallback чтобы функция не пересоздавалась
  const addProduct = useCallback((product: Omit<RecentlyViewedProduct, 'viewedAt'>) => {
    try {
      const newProduct: RecentlyViewedProduct = {
        ...product,
        viewedAt: Date.now(),
      };

      setRecentProducts((prev) => {
        const filtered = prev.filter((p) => p.id !== product.id);
        const updated = [newProduct, ...filtered];
        const limited = updated.slice(0, MAX_ITEMS);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
        
        return limited;
      });
    } catch (error) {
      console.error('Ошибка сохранения просмотра:', error);
    }
  }, []); // ✅ Пустой массив зависимостей

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentProducts([]);
    } catch (error) {
      console.error('Ошибка очистки истории:', error);
    }
  }, []);

  const removeProduct = useCallback((productId: number) => {
    try {
      setRecentProducts((prev) => {
        const filtered = prev.filter((p) => p.id !== productId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return filtered;
      });
    } catch (error) {
      console.error('Ошибка удаления из истории:', error);
    }
  }, []);

  return {
    recentProducts,
    addProduct,
    clearHistory,
    removeProduct,
  };
}
