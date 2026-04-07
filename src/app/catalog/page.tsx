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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  useEffect(() => {
    setMobileFiltersOpen(false);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-4 md:mb-6 text-sm text-gray-600">
          <a href="/" className="hover:text-primary transition">Главная</a>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">Каталог</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
              Каталог товаров
            </h1>
            <p className="text-sm md:text-lg text-gray-600">
              {loading ? (
                'Загрузка...'
              ) : (
                <>Найдено: <span className="font-semibold text-primary">{products.length}</span> товаров</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Фильтры
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 md:flex-none border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-sm focus:ring-2 focus:ring-primary bg-white shadow-sm"
            >
              <option value="-created_at">Сначала новые</option>
              <option value="created_at">Сначала старые</option>
              <option value="price">Цена: по возрастанию</option>
              <option value="-price">Цена: по убыванию</option>
              <option value="name">По названию (А-Я)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="hidden lg:block lg:col-span-1">
            <ProductFilters />
          </aside>

          {mobileFiltersOpen && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-white z-50 overflow-y-auto shadow-2xl lg:hidden transition-transform transform">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                  <h2 className="text-lg font-bold">Фильтры</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <ProductFilters />
                </div>
              </div>
            </>
          )}

          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="bg-gray-200 h-56 md:h-72 rounded-t-lg"></div>
                    <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/2 mt-2 md:mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-1">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 md:p-16 text-center">
                <div className="text-gray-300 text-6xl md:text-9xl mb-4 md:mb-6">🔍</div>
                <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                  Товары не найдены
                </h3>
                <p className="text-gray-600 mb-6 md:mb-8 text-base md:text-lg">
                  Попробуйте изменить параметры фильтрации
                </p>
                <button
                  onClick={() => window.location.href = '/catalog'}
                  className="btn-primary text-base md:text-lg px-6 md:px-8 py-2 md:py-3"
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