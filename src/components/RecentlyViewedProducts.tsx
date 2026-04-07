'use client';

import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import ProductCard from './ProductCard';
import { Product, api } from '@/lib/api';
import { useEffect, useState } from 'react';

interface RecentlyViewedProductsProps {
  currentProductId?: number;
  title?: string;
  maxItems?: number;
}

export default function RecentlyViewedProducts({ 
  currentProductId, 
  title = 'Вы недавно смотрели',
  maxItems = 8 
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
            const product = await api.getProduct(id);
            return product;
          } catch (error: any) {
            if (error.response?.status === 404) {
              console.log(`Товар ${id} не найден, удаляем из истории`);
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
      <section className="py-6 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 flex items-center gap-2 md:gap-3">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-[350px] md:h-[450px]"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (fullProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {title}
          </h2>
          
          <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs md:text-sm text-gray-600 bg-white px-2 py-1 md:px-4 md:py-2 rounded-full shadow-sm">
              {fullProducts.length} {fullProducts.length === 1 ? 'товар' : fullProducts.length < 5 ? 'товара' : 'товаров'}
            </span>
            {fullProducts.length > 0 && (
              <button
                onClick={() => {
                  fullProducts.forEach((p) => removeProduct(p.id));
                  setFullProducts([]);
                }}
                className="text-xs md:text-sm text-red-600 hover:text-white hover:bg-red-500 px-2 py-1 md:px-4 md:py-2 rounded-full transition font-medium border border-red-200"
              >
                Очистить всё
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {fullProducts.map((product) => (
            <div key={product.id} className="relative group">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeProduct(product.id);
                  setFullProducts((prev) => prev.filter((p) => p.id !== product.id));
                }}
                className="absolute -top-1 -right-1 md:-top-2 md:-right-2 z-30 w-6 h-6 md:w-8 md:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition shadow-lg opacity-0 group-hover:opacity-100 hover:scale-110"
                title="Удалить из истории"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
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