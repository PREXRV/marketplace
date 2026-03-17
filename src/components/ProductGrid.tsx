'use client';

import { useState, useRef, useEffect } from 'react';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: any[];
  title: string;
}

export default function ProductGrid({ products, title }: ProductGridProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleCards, setVisibleCards] = useState(4);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      // ✅ АДАПТИВНОЕ КОЛИЧЕСТВО КАРТОЧЕК
      if (width < 640) {
        setVisibleCards(1.2); // Mobile: 1.2 карточки
      } else if (width < 1024) {
        setVisibleCards(2.5); // Tablet: 2.5 карточки
      } else if (width < 1280) {
        setVisibleCards(3);   // Desktop small: 3 карточки ✅
      } else {
        setVisibleCards(4);   // Desktop large: 4 карточки ✅
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  if (!products?.length) return null;

  const maxIndex = Math.max(0, Math.ceil(products.length - visibleCards));

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.scrollWidth / products.length;
    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
    setCurrentIndex(index);
  };

  const goNext = () => scrollToIndex(Math.min(currentIndex + 1, maxIndex));
  const goPrev = () => scrollToIndex(Math.max(0, currentIndex - 1));

  // Auto-scroll на десктопе
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

  const totalPages = Math.ceil(products.length / visibleCards);

  return (
    <section className="container mx-auto px-8 py-16">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
        <a href="/catalog" className="text-primary hover:text-primary-dark font-medium transition flex items-center gap-1 group">
          Смотреть все
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* ✅ КАРУСЕЛЬ */}
      <div className="relative group/carousel">
        {/* Стрелки — СКРЫТЫ ДО HOVER на desktop */}
        {products.length > visibleCards && (
          <>
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 shadow-xl border-2 border-gray-200 rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover/carousel:opacity-100 lg:flex hidden items-center justify-center"
              aria-label="Предыдущие товары"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goNext}
              disabled={currentIndex >= maxIndex}
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 shadow-xl border-2 border-gray-200 rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover/carousel:opacity-100 lg:flex hidden items-center justify-center"
              aria-label="Следующие товары"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* ✅ Контейнер с ШИРОКИМИ КАРТОЧКАМИ */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 pb-8"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((product: any) => (
            <div 
              key={product.id} 
              className="flex-shrink-0 snap-center w-[calc(100%-2rem)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* ✅ Дотсы */}
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
                aria-label={`Страница ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Мобильный индикатор */}
      <div className="text-center mt-4 text-sm text-gray-500 lg:hidden">
        👆 Проведите влево, чтобы увидеть больше
      </div>
    </section>
  );
}
