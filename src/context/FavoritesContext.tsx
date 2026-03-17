'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';

interface FavoritesContextType {
  favorites: number[];
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (productId: number) => void;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, tokens, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [user, tokens, isAuthenticated]);

  const loadFavorites = async () => {
    setLoading(true);

    try {
      if (isAuthenticated && tokens?.access) {
        console.log('🔐 Загружаем избранное с сервера...');
        const data = await api.getFavorites(tokens.access);
        
        // ✅ Правильная обработка разных форматов ответа
        let productIds: number[] = [];
        
        if (Array.isArray(data)) {
          // Если массив объектов с полем id
          productIds = data.map((item: any) => {
            if (typeof item === 'number') return item;
            if (item.product) return item.product.id || item.product;
            if (item.id) return item.id;
            return null;
          }).filter(Boolean);
        } else if (data.results && Array.isArray(data.results)) {
          // Если объект с полем results
          productIds = data.results.map((item: any) => {
            if (typeof item === 'number') return item;
            if (item.product) return item.product.id || item.product;
            if (item.id) return item.id;
            return null;
          }).filter(Boolean);
        }
        
        console.log('✅ Загружено с сервера:', productIds);
        setFavorites(productIds);
        localStorage.setItem('favorites', JSON.stringify(productIds));
      } else {
        console.log('🔓 Используем localStorage');
        const stored = localStorage.getItem('favorites');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            console.log('✅ Загружено из localStorage:', parsed);
            setFavorites(Array.isArray(parsed) ? parsed : []);
          } catch (error) {
            console.error('❌ Ошибка парсинга localStorage:', error);
            setFavorites([]);
          }
        } else {
          setFavorites([]);
        }
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки избранного:', error);
      
      const stored = localStorage.getItem('favorites');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setFavorites(Array.isArray(parsed) ? parsed : []);
        } catch {
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId: number) => {
    return favorites.includes(productId);
  };

  const toggleFavorite = async (productId: number) => {
    console.log('🔄 Toggle favorite для productId:', productId);
    
    const wasInFavorites = isFavorite(productId);
    
    // Оптимистичное обновление UI
    setFavorites(prev => {
      const newFavorites = wasInFavorites 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });

    // Если авторизован - синхронизируем с сервером
    if (isAuthenticated && tokens?.access) {
      try {
        console.log('🔄 Отправляем toggle на сервер...');
        const response = await api.toggleFavorite(tokens.access, productId);
        console.log('✅ Ответ сервера:', response);
        
        // Сервер вернул актуальное состояние - синхронизируем
        if (response.in_favorites !== undefined) {
          setFavorites(prev => {
            const newFavorites = response.in_favorites
              ? [...prev.filter(id => id !== productId), productId]
              : prev.filter(id => id !== productId);
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            return newFavorites;
          });
        }
      } catch (error) {
        console.error('❌ Ошибка синхронизации с сервером:', error);
        
        // Откатываем изменения при ошибке
        setFavorites(prev => {
          const rolled = wasInFavorites
            ? [...prev, productId]
            : prev.filter(id => id !== productId);
          localStorage.setItem('favorites', JSON.stringify(rolled));
          return rolled;
        });
      }
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
