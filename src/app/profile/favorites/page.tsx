'use client';

import { useEffect, useState } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard'; // ← ИСПОЛЬЗУЕМ ProductCard
import Link from 'next/link';
import { api, Product } from '@/lib/api';

export default function FavoritesPage() {
  const { favorites, loading: favLoading } = useFavorites();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteProducts();
  }, [favorites]);

  const loadFavoriteProducts = async () => {
    if (favLoading) return;

    try {
      setLoading(true);

      // Загружаем все товары
      const allProducts = await api.getProducts();
      
      // Фильтруем только избранные
      const favoriteProducts = allProducts.filter((p: Product) => favorites.includes(p.id));
      setProducts(favoriteProducts);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary transition">Главная</Link>
          <span className="mx-2">›</span>
          <Link href="/profile" className="hover:text-primary transition">Профиль</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">Избранное</span>
        </div>

        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">❤️ Избранное</h1>
            <p className="text-gray-600 text-lg">
              {loading ? (
                'Загрузка...'
              ) : (
                <>Сохранено: <span className="font-semibold text-primary">{favorites.length}</span> товаров</>
              )}
            </p>
          </div>
          <Link href="/profile" className="btn-secondary">
            ← Назад в профиль
          </Link>
        </div>

        {/* Подсказка для неавторизованных */}
        {!user && favorites.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💡</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Войдите, чтобы получать уведомления!</h3>
                <p className="text-gray-700 mb-4">
                  Сейчас избранное хранится только на этом устройстве. 
                  <br />
                  <span className="font-semibold">Войдите в аккаунт</span> и получайте уведомления когда:
                </p>
                <ul className="space-y-2 mb-4 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>💰 Цена снизится</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>🔥 Начнётся распродажа</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>📦 Товар появится в наличии</span>
                  </li>
                </ul>
                <Link href="/login" className="btn-primary inline-block">
                  Войти в аккаунт
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Товары */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="bg-gray-200 h-64 rounded-t-lg"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="text-9xl mb-6">💔</div>
            <h2 className="text-3xl font-bold mb-4">Избранное пусто</h2>
            <p className="text-gray-600 mb-4 text-lg max-w-md mx-auto">
              Добавьте товары в избранное, чтобы не потерять их
              {user && (
                <>
                  <br />
                  <span className="font-semibold text-primary">и получать уведомления о скидках!</span>
                </>
              )}
            </p>
            <Link href="/catalog" className="btn-primary inline-block text-lg px-8 py-3">
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
