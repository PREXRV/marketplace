'use client';

import { useState, useRef, useEffect } from 'react';
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
  products: Product[];
  saleInfo: SaleInfo | null;
}

export default function SaleProducts({ products, saleInfo }: SaleProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleCards, setVisibleCards] = useState(4);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width < 640)       setVisibleCards(1.2);
      else if (width < 1024) setVisibleCards(2.5);
      else if (width < 1280) setVisibleCards(3);
      else                   setVisibleCards(4);
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  if (!products?.length) return null;

  const maxIndex = Math.max(0, Math.ceil(products.length - visibleCards));
  const totalPages = Math.ceil(products.length / visibleCards);

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.scrollWidth / products.length;
    container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    setCurrentIndex(index);
  };

  const goNext = () => scrollToIndex(Math.min(currentIndex + 1, maxIndex));
  const goPrev = () => scrollToIndex(Math.max(0, currentIndex - 1));

  useEffect(() => {
    if (!isMobile && products.length > visibleCards) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev >= maxIndex ? 0 : prev + 1;
          scrollToIndex(next);
          return next;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, maxIndex, isMobile, products.length, visibleCards]);

  const formatEndDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

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

        {/* Карусель — точно как ProductGrid */}
        <div className="relative group/carousel">
          {products.length > visibleCards && (
            <>
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 shadow-xl border-2 border-gray-200 rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover/carousel:opacity-100 lg:flex hidden items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex >= maxIndex}
                className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 shadow-xl border-2 border-gray-200 rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover/carousel:opacity-100 lg:flex hidden items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 pb-8"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 snap-center w-[calc(100%-2rem)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === Math.floor(currentIndex / visibleCards)
                      ? 'bg-primary w-8 shadow-md'
                      : 'bg-gray-300 w-2 hover:bg-gray-400 hover:w-4'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-4 text-sm text-gray-500 lg:hidden">
          👆 Проведите влево, чтобы увидеть больше
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