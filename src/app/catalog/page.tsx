'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { api, Product } from '@/lib/api';

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('-created_at');

  useEffect(() => {
    fetchProducts();
  }, [searchParams, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const filters: any = { ordering: sortBy };
      
      if (searchParams.get('category')) {
        filters.category = searchParams.get('category');
      }
      if (searchParams.get('min_price')) {
        filters.min_price = searchParams.get('min_price');
      }
      if (searchParams.get('max_price')) {
        filters.max_price = searchParams.get('max_price');
      }
      if (searchParams.get('in_stock')) {
        filters.in_stock = searchParams.get('in_stock');
      }
      
      searchParams.forEach((value, key) => {
        if (key.startsWith('attr_')) {
          filters[key] = value;
        }
      });
      
      const data = await api.getProducts(filters);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setProducts([]);
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
          <a href="/" className="hover:text-primary transition">Главная</a>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">Каталог</span>
        </div>

        {/* Заголовок + Сортировка */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Каталог товаров
            </h1>
            <p className="text-gray-600 text-lg">
              {loading ? (
                'Загрузка...'
              ) : (
                <>Найдено: <span className="font-semibold text-primary">{products.length}</span> товаров</>
              )}
            </p>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary bg-white shadow-sm"
          >
            <option value="-created_at">Сначала новые</option>
            <option value="created_at">Сначала старые</option>
            <option value="price">Цена: по возрастанию</option>
            <option value="-price">Цена: по убыванию</option>
            <option value="name">По названию (А-Я)</option>
          </select>
        </div>

        {/* ✅ СЕТКА 4 колонки: 1 фильтры + 3 товара */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Фильтры слева */}
          <aside className="lg:col-span-1">
            <ProductFilters />
          </aside>

          {/* ✅ ТОВАРЫ — 3 КОЛОНКИ */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="bg-gray-200 h-72 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2 mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-1">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                <div className="text-gray-300 text-9xl mb-6">🔍</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Товары не найдены
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Попробуйте изменить параметры фильтрации
                </p>
                <button
                  onClick={() => window.location.href = '/catalog'}
                  className="btn-primary text-lg px-8 py-3"
                >
                  Сбросить все фильтры
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
