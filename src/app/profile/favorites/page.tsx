'use client';

import { useEffect, useState } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
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
      const allProducts = await api.getProducts();
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

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-4 md:mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary transition">Главная</Link>
          <span className="mx-2">›</span>
          <Link href="/profile" className="hover:text-primary transition">Профиль</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">Избранное</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">❤️ Избранное</h1>
            <p className="text-sm md:text-lg text-gray-600">
              {loading ? (
                'Загрузка...'
              ) : (
                <>Сохранено: <span className="font-semibold text-primary">{favorites.length}</span> товаров</>
              )}
            </p>
          </div>
          <Link href="/profile" className="btn-secondary text-center inline-block text-sm md:text-base px-4 py-2 md:px-6 md:py-3">
            ← Назад в профиль
          </Link>
        </div>

        {!user && favorites.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
              <div className="text-3xl md:text-4xl">💡</div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900">Войдите, чтобы получать уведомления!</h3>
                <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">
                  Сейчас избранное хранится только на этом устройстве. 
                  <br />
                  <span className="font-semibold">Войдите в аккаунт</span> и получайте уведомления когда:
                </p>
                <ul className="space-y-1.5 md:space-y-2 mb-3 md:mb-4 text-sm md:text-base text-gray-700">
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
                <Link href="/login" className="btn-primary inline-block text-sm md:text-base px-4 py-2 md:px-6 md:py-3">
                  Войти в аккаунт
                </Link>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="bg-gray-200 h-56 md:h-64 rounded-t-lg"></div>
                <div className="p-3 md:p-5 space-y-2 md:space-y-3">
                  <div className="h-4 md:h-5 bg-gray-200 rounded"></div>
                  <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 md:h-8 bg-gray-200 rounded w-1/2 mt-2 md:mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-xl shadow-lg">
            <div className="text-7xl md:text-9xl mb-4 md:mb-6">💔</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Избранное пусто</h2>
            <p className="text-gray-600 mb-4 text-base md:text-lg max-w-md mx-auto px-4">
              Добавьте товары в избранное, чтобы не потерять их
              {user && (
                <>
                  <br />
                  <span className="font-semibold text-primary">и получать уведомления о скидках!</span>
                </>
              )}
            </p>
            <Link href="/catalog" className="btn-primary inline-block text-base md:text-lg px-6 md:px-8 py-2 md:py-3">
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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