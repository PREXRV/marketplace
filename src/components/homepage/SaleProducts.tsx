'use client';

import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/api';

interface SaleInfo {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  discount_type: string;
  discount_value: string;
}

interface SaleProductsProps {
  products: Product[]; // ✅ Теперь принимаем полные Product
  saleInfo: SaleInfo | null;
}

export default function SaleProducts({ products, saleInfo }: SaleProductsProps) {
  if (!products || products.length === 0) return null;

  const formatEndDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <section className="py-10 bg-gradient-to-br from-red-50 via-orange-50 to-pink-50">
      <div className="container mx-auto px-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full mb-4 shadow-lg animate-pulse">
            <span className="font-bold text-lg uppercase tracking-wide">АКЦИЯ</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">
            {saleInfo?.name || 'Товары по акции'}
          </h2>
          
          {saleInfo?.description && (
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-4">
              {saleInfo.description}
            </p>
          )}
          
          {saleInfo?.end_date && (
            <div className="inline-flex items-center gap-2 text-red-600 font-semibold bg-white px-4 py-2 rounded-full shadow-md">
              Акция до {formatEndDate(saleInfo.end_date)}
            </div>
          )}
        </div>

        {/* ✅ Сетка товаров - просто передаём полные Product в ProductCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length >= 8 && (
          <div className="text-center mt-12">
            <a
              href="/sale"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Смотреть все товары на акции
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
