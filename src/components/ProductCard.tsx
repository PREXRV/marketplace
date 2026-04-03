'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product, getImageUrl, formatPrice } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

// ✅ Хелпер: бейдж наличия
function getAvailabilityBadge(product: Product) {
  const s = product.availability_status;
  const label = product.availability_label;

  if (s === 'made_to_order') {
    return {
      label: label || 'Под заказ',
      cls: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      canBuy: true,
    };
  }
  if (s === 'can_order') {
    return {
      label: label || 'Возможно заказать',
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      canBuy: true,
    };
  }
  // ✅ out_of_stock — явный статус "нет в наличии"
  if (s === 'out_of_stock') {
    return {
      label: 'Нет в наличии',
      cls: 'bg-red-50 text-red-600 border-red-200',
      dot: 'bg-red-400',
      canBuy: false,
    };
  }
  // ✅ in_stock — проверяем stock
  if (product.stock > 0) {
    return {
      label: `В наличии (${product.stock} шт.)`,
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      canBuy: true,
    };
  }
  // ✅ in_stock но stock=0 — всё равно canBuy: true (статус приоритетнее stock)
  return {
    label: 'В наличии',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    canBuy: true,
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = [
    ...(product.images || []),
    ...((product.variants || []).map((v: any) => ({
      image_url: v.image_url,
      is_main: false,
      alt_text: v.name,
    })) as any[]),
  ].filter((img: any) => img.image_url);

  const imageUrl =
    allImages[currentImageIndex]?.image_url ||
    product.primary_image ||
    'https://placehold.co/400x400/e2e8f0/64748b.png?text=No+Image';

  const displayPrice = product.final_price
    ? parseFloat(product.final_price)
    : parseFloat(product.price);

  const oldPriceValue = product.old_price
    ? parseFloat(String(product.old_price))
    : null;

  const discountPercentage = product.discount_percentage || 0;

  const hasDiscount =
    (oldPriceValue !== null && oldPriceValue > displayPrice) ||
    discountPercentage > 0;

  const strikethroughPrice = hasDiscount
    ? (oldPriceValue !== null && oldPriceValue > displayPrice
        ? oldPriceValue
        : parseFloat(String(product.price)))
    : null;
    
  const hasActiveTimedSale =
    product.is_on_sale ||
    (product.sale_end_date && new Date(product.sale_end_date) > new Date());

  const avail = getAvailabilityBadge(product);
  const hasMultipleImages = allImages.length > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      image: imageUrl,
    });
  };

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((p) => (p === 0 ? allImages.length - 1 : p - 1));
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((p) => (p === allImages.length - 1 ? 0 : p + 1));
  };

  return (
    <Link href={`/product/${product.id}`} className="block h-full">
      <div
        className={`card group hover:shadow-xl hover:z-10 transition-all duration-300 h-full flex flex-col ${
          hasActiveTimedSale ? 'border-4 border-orange-500' : ''
        }`}
      >
        {/* ─── ФОТО ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-t-lg bg-gray-100">

          {/* Левые бейджи */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 items-start pointer-events-none">
            {hasActiveTimedSale && (
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                ⚡ АКЦИЯ
              </span>
            )}
            {product.is_new && !hasActiveTimedSale && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                NEW
              </span>
            )}
            {product.is_featured && !product.is_new && !hasActiveTimedSale && (
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                ⭐ ХИТ
              </span>
            )}
            {discountPercentage > 0 && (
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                  hasActiveTimedSale
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse'
                    : 'bg-red-500 text-white'
                }`}
              >
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Избранное */}
          <div
            className="absolute top-3 right-3 z-20 pointer-events-auto"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <FavoriteButton productId={product.id} />
          </div>

          {/* Стрелки */}
          {hasMultipleImages && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/95 backdrop-blur-md hover:bg-white shadow-lg border border-gray-200 rounded-full p-1.5 transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
              >
                <svg className="w-full h-full text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/95 backdrop-blur-md hover:bg-white shadow-lg border border-gray-200 rounded-full p-1.5 transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
              >
                <svg className="w-full h-full text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Точки-индикаторы */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
              {allImages.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Само фото */}
          <div className="relative w-full aspect-square">
            <Image
              src={imageUrl}
              alt={allImages[currentImageIndex]?.alt_text || product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-size="40" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EНет фото%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>

          {/* ✅ Оверлей "Нет в наличии" — только для in_stock без остатка */}
          {!avail.canBuy && product.availability_status === 'in_stock' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="text-white text-xl font-bold mb-1">Нет в наличии</div>
                <div className="text-gray-300 text-sm">Ожидается поступление</div>
              </div>
            </div>
          )}
        </div>

        {/* ─── КОНТЕНТ ──────────────────────────────────────────── */}
        <div className="p-4 flex flex-col flex-1">

          {/* Категория */}
          {product.category_name && (
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">
              {product.category_name}
            </p>
          )}

          {/* Название */}
          <h3 className="font-bold text-base text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Описание */}
          {product.short_description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-snug mt-0.5 mb-2">
              {product.short_description}
            </p>
          )}

          {/* Рейтинг */}
          <div className="h-5 mb-2">
            {product.reviews_count > 0 && (
              <StarRating
                rating={product.average_rating}
                size="sm"
                showCount
                count={product.reviews_count}
              />
            )}
          </div>

          {/* ─── НИЖНИЙ БЛОК ───────────────────────────────── */}
          <div className="mt-auto">

            {/* Цена */}
            <div className="min-h-[4rem] mb-2">
              <div className="flex items-baseline gap-2 flex-wrap mb-1">
                <span className={`text-2xl font-bold ${hasActiveTimedSale ? 'text-red-600' : 'text-primary'}`}>
                  {formatPrice(displayPrice)} ₽
                </span>
                {hasDiscount && strikethroughPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(strikethroughPrice)} ₽
                  </span>
                )}
              </div>
              <div className="h-5">
                {hasDiscount && discountPercentage > 0 && (
                  <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    Экономия {formatPrice(strikethroughPrice! - displayPrice)} ₽
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Бейдж наличия / срока изготовления */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border mb-3 ${avail.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${avail.dot}`} />
              {avail.label}
            </div>

            {/* ✅ Кнопка */}
            <button
              onClick={handleAddToCart}
              disabled={!avail.canBuy}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] ${
                avail.canBuy
                  ? hasActiveTimedSale
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white animate-pulse-slow'
                    : 'bg-primary hover:bg-primary-dark text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {!avail.canBuy
                ? 'Нет в наличии'
                : product.availability_status === 'made_to_order'
                ? 'В корзину'
                : product.availability_status === 'can_order'
                ? 'В корзину'
                : hasActiveTimedSale
                ? 'Купить по акции'
                : 'В корзину'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
