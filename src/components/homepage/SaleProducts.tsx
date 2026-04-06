'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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
  const [isMobile, setIsMobile] = useState(false);
  const [visibleCards, setVisibleCards] = useState(4);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      if (width < 640) setVisibleCards(1.15);
      else if (width < 1024) setVisibleCards(2.2);
      else if (width < 1280) setVisibleCards(3);
      else setVisibleCards(4);
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

    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });

    setCurrentIndex(index);
  };

  const goNext = () => scrollToIndex(Math.min(currentIndex + 1, maxIndex));
  const goPrev = () => scrollToIndex(Math.max(0, currentIndex - 1));

  useEffect(() => {
    if (!isMobile && products.length > visibleCards) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev >= maxIndex ? 0 : prev + 1;
          scrollToIndex(next);
          return next;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentIndex, isMobile, maxIndex, products.length, visibleCards]);

  const formatEndDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <section className="bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 py-10 sm:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-white shadow-lg sm:px-6 sm:py-3">
            <span className="text-sm font-bold uppercase tracking-wide sm:text-base lg:text-lg">
              Акция
            </span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            {saleInfo?.name || 'Товары по акции'}
          </h2>

          {saleInfo?.description && (
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base lg:text-lg">
              {saleInfo.description}
            </p>
          )}

          {saleInfo?.end_date && (
            <div className="mt-4 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-md">
              Акция до {formatEndDate(saleInfo.end_date)}
            </div>
          )}
        </div>

        <div className="relative group/carousel">
          {products.length > visibleCards && (
            <>
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="absolute -left-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border-2 border-gray-200 bg-white p-3 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 lg:flex lg:opacity-0 lg:group-hover/carousel:opacity-100"
                aria-label="Предыдущие товары по акции"
              >
                <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={goNext}
                disabled={currentIndex >= maxIndex}
                className="absolute -right-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border-2 border-gray-200 bg-white p-3 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 lg:flex lg:opacity-0 lg:group-hover/carousel:opacity-100"
                aria-label="Следующие товары по акции"
              >
                <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            ref={scrollContainerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide sm:gap-5 sm:pb-6 lg:gap-6"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[84%] flex-shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex justify-center gap-2 sm:mt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === Math.floor(currentIndex / visibleCards)
                      ? 'w-8 bg-primary shadow-md'
                      : 'w-2 bg-gray-300 hover:w-4 hover:bg-gray-400'
                  }`}
                  aria-label={`Страница ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-gray-500 sm:text-sm lg:hidden">
          Проведите влево, чтобы увидеть больше
        </div>

        {products.length >= 8 && (
          <div className="mt-8 text-center sm:mt-10 lg:mt-12">
            <Link
              href="/sale"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-red-600 hover:to-pink-600 hover:shadow-xl sm:px-8 sm:py-4 sm:text-base"
            >
              Смотреть все товары на акции
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}