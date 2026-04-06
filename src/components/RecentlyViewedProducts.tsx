'use client';

import { useEffect, useState } from 'react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import ProductCard from './ProductCard';
import { Product, api } from '@/lib/api';

interface RecentlyViewedProductsProps {
  currentProductId?: number;
  title?: string;
  maxItems?: number;
}

export default function RecentlyViewedProducts({
  currentProductId,
  title = 'Вы недавно смотрели',
  maxItems = 8,
}: RecentlyViewedProductsProps) {
  const { recentProducts, removeProduct } = useRecentlyViewed();
  const [fullProducts, setFullProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullProducts = async () => {
      try {
        setLoading(true);

        const filteredIds = recentProducts
          .filter((p) => p.id !== currentProductId)
          .slice(0, maxItems)
          .map((p) => p.id);

        if (filteredIds.length === 0) {
          setFullProducts([]);
          setLoading(false);
          return;
        }

        const productsPromises = filteredIds.map(async (id) => {
          try {
            return await api.getProduct(id);
          } catch (error: any) {
            if (error.response?.status === 404) {
              removeProduct(id);
            }
            return null;
          }
        });

        const products = await Promise.all(productsPromises);
        const validProducts = products.filter((p): p is Product => p !== null);
        setFullProducts(validProducts);
      } catch (error) {
        console.error('Ошибка загрузки просмотренных товаров:', error);
        setFullProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFullProducts();
  }, [recentProducts, currentProductId, maxItems, removeProduct]);

  if (loading) {
    return (
      <section className="bg-gray-50 py-10 sm:py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900 sm:mb-8 sm:text-3xl">
            <svg className="h-7 w-7 text-primary sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {title}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-gray-200 h-[360px] sm:h-[420px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (fullProducts.length === 0) return null;

  return (
    <section className="bg-gray-50 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            <svg className="h-7 w-7 text-primary sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {title}
          </h2>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="inline-flex w-fit items-center rounded-full bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
              {fullProducts.length} {fullProducts.length === 1 ? 'товар' : fullProducts.length < 5 ? 'товара' : 'товаров'}
            </span>

            <button
              onClick={() => {
                fullProducts.forEach((p) => removeProduct(p.id));
                setFullProducts([]);
              }}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500 hover:text-white"
            >
              Очистить всё
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {fullProducts.map((product) => (
            <div key={product.id} className="group relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeProduct(product.id);
                  setFullProducts((prev) => prev.filter((p) => p.id !== product.id));
                }}
                className="absolute right-2 top-2 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:scale-105 hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                title="Удалить из истории"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}