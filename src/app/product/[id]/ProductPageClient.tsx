'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RelatedProducts from '@/components/RelatedProducts';
import CountdownTimer from '@/components/CountdownTimer';
import FavoriteButton from '@/components/FavoriteButton';
import { api, Product, ProductVariant, getImageUrl, formatPrice } from '@/lib/api';
import { partnershipAPI } from '@/services/api';
import { useCart } from '@/context/CartContext';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import ReviewGallery from '@/components/ReviewGallery';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import RecentlyViewedProducts from '@/components/RecentlyViewedProducts';
import { useAuth } from '@/context/AuthContext';
import CompactCountdownTimer from '@/components/CompactCountdownTimer';
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';

interface Props {
  productId: string;
  initialProduct: any;
}

function getAvailabilityInfo(product: Product, currentStock: number) {
  const s = product.availability_status;
  const min = product.make_time_days_min;
  const max = product.make_time_days_max;

  if (s === 'made_to_order') {
    return {
      canBuy: true,
      title: 'Под заказ',
      subtitle:
        min && max && min !== max
          ? `Срок изготовления: ${min} - ${max} рабочих дней`
          : min
            ? `Срок изготовления: ~${min} рабочих дней`
            : 'Изготавливается под заказ',
      titleCls: 'text-blue-800',
      subtitleCls: 'text-blue-600',
      wrapCls: 'bg-blue-50 border-blue-200',
      btnLabel: 'Добавить в корзину',
      btnCls: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: '🛠️',
    };
  }

  if (s === 'can_order') {
    return {
      canBuy: true,
      title: 'Предварительный заказ',
      subtitle:
        min && max && min !== max
          ? `Срок изготовления: ${min} – ${max} рабочих дней`
          : min
            ? `Срок изготовления: ~${min} рабочих дней`
            : 'Уточняйте сроки у менеджера',
      titleCls: 'text-amber-800',
      subtitleCls: 'text-amber-600',
      wrapCls: 'bg-amber-50 border-amber-200',
      btnLabel: 'Заказать',
      btnCls: 'bg-amber-500 hover:bg-amber-600 text-white',
      icon: '⏳',
    };
  }

  if (currentStock > 0) {
    return {
      canBuy: true,
      title: `В наличии (${currentStock} шт.)`,
      subtitle: 'Отправим в течение 1–2 рабочих дней',
      titleCls: 'text-green-800',
      subtitleCls: 'text-green-600',
      wrapCls: 'bg-green-50 border-green-200',
      btnLabel: null,
      btnCls: '',
      icon: '✅',
    };
  }

  return {
    canBuy: false,
    icon: '✕',
    title: 'Нет в наличии',
    subtitle: 'Ожидается поступление',
    titleCls: 'text-red-700',
    subtitleCls: 'text-red-500',
    wrapCls: 'bg-red-50 border-red-200',
    btnLabel: 'Нет в наличии',
    btnCls: 'bg-gray-300 text-gray-500 cursor-not-allowed',
  };
}

function uniqueBy<T>(items: T[], keyGetter: (item: T) => string | null | undefined) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyGetter(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function ProductPageClient({ productId, initialProduct }: Props) {
  if (typeof window === 'undefined') {
    return null;
  }

  const { addProduct } = useRecentlyViewed();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(initialProduct ?? null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!initialProduct);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [currentPrice, setCurrentPrice] = useState<string>(
    initialProduct?.final_price || initialProduct?.price || '0'
  );
  const [currentOldPrice, setCurrentOldPrice] = useState<string | null>(
    initialProduct?.has_sale_discount && !initialProduct?.old_price
      ? initialProduct?.price
      : initialProduct?.old_price ?? null
  );
  const [currentStock, setCurrentStock] = useState<number>(initialProduct?.stock ?? 0);

  useEffect(() => {
    if (initialProduct) {
      const productImage = initialProduct.primary_image || initialProduct.images?.[0]?.image || '';
      addProduct({
        id: initialProduct.id,
        name: initialProduct.name,
        slug: initialProduct.slug,
        price: initialProduct.price,
        final_price: initialProduct.final_price,
        discount_percentage: initialProduct.discount_percentage,
        image: productImage,
      });
    }
  }, [initialProduct, addProduct]);

  useEffect(() => {
    if (initialProduct) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.getProduct(Number(productId));
        setProduct(data);

        const productImage = data.primary_image || data.images?.[0]?.image || '';
        addProduct({
          id: data.id,
          name: data.name,
          slug: data.slug,
          price: data.price,
          final_price: data.final_price,
          discount_percentage: data.discount_percentage,
          image: productImage,
        });

        setCurrentPrice(data.final_price || data.price);
        if (data.has_sale_discount && !data.old_price) {
          setCurrentOldPrice(data.price);
        } else {
          setCurrentOldPrice(data.old_price);
        }
        setCurrentStock(data.stock);
      } catch (error) {
        console.error('Ошибка загрузки товара:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId, addProduct, initialProduct]);

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const refToken = searchParams.get('ref');
    if (!refToken) return;

    sessionStorage.setItem('ref_token', refToken);
    const trackedKey = `ref_viewed_${refToken}`;
    if (sessionStorage.getItem(trackedKey)) return;

    sessionStorage.setItem(trackedKey, '1');
    partnershipAPI.trackRefView(refToken).catch(() => {
      sessionStorage.removeItem(trackedKey);
    });
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const timer = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.scrollBy(0, -100);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const normalizedVariantImageUrl = useMemo(() => {
    if (!selectedVariant?.image_url) return null;
    return getImageUrl(selectedVariant.image_url);
  }, [selectedVariant]);

  const normalizedGalleryImages = useMemo(() => {
    if (!product?.images?.length) return [];
    return product.images.map((img) => ({
      ...img,
      normalizedUrl: getImageUrl(img.image),
    }));
  }, [product]);

  const currentGalleryImage = normalizedGalleryImages[selectedImage];

  const imageUrl = useMemo(() => {
    if (normalizedVariantImageUrl) return normalizedVariantImageUrl;
    if (currentGalleryImage?.normalizedUrl) return currentGalleryImage.normalizedUrl;
    if (product?.primary_image) return getImageUrl(product.primary_image);
    return 'https://placehold.co/400x400/e2e8f0/64748b.png?text=No+Image';
  }, [normalizedVariantImageUrl, currentGalleryImage, product]);

  const mainImageAlt = selectedVariant?.name || currentGalleryImage?.alt_text || product?.name || 'Товар';

  const cartImage = useMemo(() => {
    if (selectedVariant?.image_url) return getImageUrl(selectedVariant.image_url);
    if (product?.primary_image) return getImageUrl(product.primary_image);
    if (product?.images?.[0]?.image) return getImageUrl(product.images[0].image);
    return '';
  }, [selectedVariant, product]);

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSelectedImage(0);

    const variantFinalPrice =
      variant.final_price || variant.price || product?.final_price || product?.price || '0';

    setCurrentPrice(variantFinalPrice);

    if (variant.discount_percentage && variant.discount_percentage > 0) {
      setCurrentOldPrice(variant.price || product?.price || '0');
    } else if (variant.price) {
      setCurrentOldPrice(product?.old_price || null);
    } else if (product?.has_sale_discount && !product?.old_price) {
      setCurrentOldPrice(product.price);
    } else {
      setCurrentOldPrice(product?.old_price || null);
    }

    setCurrentStock(variant.stock);
    setQuantity(1);
  };

  const handleResetVariant = () => {
    setSelectedVariant(null);

    if (product) {
      setCurrentPrice(product.final_price || product.price);

      if (product.has_sale_discount && !product.old_price) {
        setCurrentOldPrice(product.price);
      } else {
        setCurrentOldPrice(product.old_price);
      }

      setCurrentStock(product.stock);
      setQuantity(1);
    }
  };

  const handleShare = (platform: string) => {
    if (!product) return;

    const url = window.location.href;
    const text = `${product.name} - ${formatPrice(currentPrice)} ₽`;

    const shareUrls: Record<string, string> = {
      vk: `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      copy: url,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Ссылка скопирована!');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const avail = getAvailabilityInfo(product, currentStock);
    if (!avail.canBuy) return;

    const refToken = sessionStorage.getItem('ref_token');
    if (refToken) {
      partnershipAPI.trackCartAdd(refToken).catch(console.error);
    }

    addToCart({
      id: selectedVariant ? selectedVariant.id : product.id,
      name: selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name,
      price: parseFloat(currentPrice),
      quantity,
      image: cartImage,
      variant: selectedVariant?.name,
      variantId: selectedVariant?.id,
      ref_token: refToken ?? undefined,
    });

    const notification = document.createElement('div');
    notification.className =
      'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.innerHTML =
      '<div class="flex items-center gap-3"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="font-medium">Товар добавлен в корзину!</span></div>';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const incrementQuantity = () => {
    const isOrderType =
      product?.availability_status === 'made_to_order' ||
      product?.availability_status === 'can_order';

    if (isOrderType || quantity < currentStock) {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-9xl mb-6">😔</div>
          <h1 className="text-3xl font-bold mb-4">Товар не найден</h1>
          <p className="text-gray-600 mb-8">К сожалению, такой товар не существует</p>
          <button onClick={() => router.push('/catalog')} className="btn-primary">
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  const hasActiveTimedSale = (() => {
    if (product.sale_end_date) {
      const endDate = new Date(product.sale_end_date);
      if (!isNaN(endDate.getTime()) && endDate > new Date()) return true;
    }
    if (product.active_sale?.end_date) {
      const endDate = new Date(product.active_sale.end_date);
      if (!isNaN(endDate.getTime()) && endDate > new Date()) return true;
    }
    return false;
  })();

  const discountPercentage = currentOldPrice
    ? Math.round((1 - parseFloat(currentPrice) / parseFloat(currentOldPrice)) * 100)
    : product.discount_percentage || 0;

  const savingsAmount = currentOldPrice
    ? parseFloat(currentOldPrice) - parseFloat(currentPrice)
    : 0;

  const colors = uniqueBy(
    product.variants?.filter((v) => Boolean(v.color)) || [],
    (v) => v.color || ''
  );

  const sizes = uniqueBy(
    product.variants?.filter((v) => Boolean(v.size)) || [],
    (v) => v.size || ''
  );

  const avail = getAvailabilityInfo(product, currentStock);
  const isOrderType =
    product.availability_status === 'made_to_order' ||
    product.availability_status === 'can_order';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-6 text-sm text-gray-600 flex items-center gap-2 flex-wrap">
          <a href="/" className="hover:text-primary transition">Главная</a>
          <span>›</span>
          <a href="/catalog" className="hover:text-primary transition">Каталог</a>
          <span>›</span>
          {product.category_name && (
            <>
              <span className="hover:text-primary transition">{product.category_name}</span>
              <span>›</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>

        {product.active_sale && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">🔥 {product.active_sale.name}</h3>
                  <p className="text-white/90 text-sm">Скидка {product.active_sale.discount_value}%</p>
                </div>
              </div>

              <div className="flex-shrink-0">
                {product.active_sale?.end_date && (
                  <CompactCountdownTimer endDate={product.active_sale.end_date} />
                )}
              </div>
            </div>
          </div>
        )}

        {hasActiveTimedSale && product.sale_end_date && (
          <div className="mb-8">
            <CountdownTimer endDate={product.sale_end_date!} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* ===== ЛЕВАЯ КОЛОНКА: галерея ===== */}
          <div>
            <div className="bg-white rounded-2xl p-4 md:p-6 mb-4 shadow-lg relative group">
              <div className="relative">
                <div className="absolute top-0 left-0 z-10 flex flex-col gap-2 items-start">
                  {product.is_new && (
                    <div className="bg-green-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-br-2xl rounded-tl-2xl font-bold text-sm md:text-lg shadow-lg">
                      NEW
                    </div>
                  )}

                  {discountPercentage > 0 && (
                    <div
                      className={`px-3 py-1 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-lg shadow-lg ${
                        hasActiveTimedSale
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      -{discountPercentage}%
                    </div>
                  )}
                </div>

                <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20" onClick={(e) => e.stopPropagation()}>
                  <FavoriteButton productId={product.id} size="lg" />
                </div>

                <div className="relative overflow-hidden rounded-xl">
                  <OptimizedImage
                      key={selectedVariant ? `variant-${selectedVariant.id}` : `gallery-${selectedImage}`}
                      src={imageUrl}
                      alt={mainImageAlt}
                      width={500}
                      height={500}
                      className="w-full h-[300px] md:h-[500px] object-contain transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                      onClick={() => setLightboxOpen(true)}
                      style={{ zIndex: 0 }}
                  />

                  {selectedVariant && (
                    <div className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 md:px-3 md:py-1 rounded-lg text-xs md:text-sm font-medium">
                      {selectedVariant.name}
                    </div>
                  )}

                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="absolute bottom-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 md:p-3 rounded-full transition opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </button>

                  {!selectedVariant && normalizedGalleryImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedImage((p) => (p - 1 + normalizedGalleryImages.length) % normalizedGalleryImages.length); }}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 md:p-3 rounded-full transition z-20"
                      >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedImage((p) => (p + 1) % normalizedGalleryImages.length); }}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 md:p-3 rounded-full transition z-20"
                      >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium z-20">
                        {selectedImage + 1} / {normalizedGalleryImages.length}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {normalizedGalleryImages.length > 1 && !selectedVariant && (
              <div className="py-4 md:py-8 pl-2 pr-2 md:pl-8 md:pr-4 bg-white/80 backdrop-blur-sm rounded-2xl">
                <div className="pl-2 md:pl-4 flex gap-3 md:gap-4 overflow-x-auto overflow-y-hidden scroll-smooth snap-x scrollbar-hide -my-2">
                  {normalizedGalleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-4 shadow-md transition-all duration-300 snap-center group my-2 ${
                        selectedImage === idx
                          ? 'border-primary scale-110 shadow-[0_2px_5px_rgba(0,0,0,0.25)]'
                          : 'border-gray-200 hover:border-primary hover:scale-105'
                      }`}
                    >
                      <OptimizedImage
                        src={img.normalizedUrl}
                        alt={img.alt_text || `Фото ${idx + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {selectedImage === idx && (
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.videos && product.videos.length > 0 && (
              <div className="mt-4">
                <div className="bg-white rounded-2xl p-4 md:p-6 mb-4 shadow-lg relative group">
                  <div className="relative overflow-hidden rounded-xl">
                    <video
                      key={selectedVideoIndex}
                      src={getImageUrl(
                        (product.videos[selectedVideoIndex] as any)?.video ||
                        (product.videos[selectedVideoIndex] as any)?.url ||
                        ''
                      )}
                      controls
                      className="w-full h-[300px] md:h-[500px] object-contain"
                      poster={(product.videos[selectedVideoIndex] as any)?.thumbnail_url || imageUrl}
                    >
                      Ваш браузер не поддерживает видео.
                    </video>

                    {(product.videos[selectedVideoIndex] as any)?.title && (
                      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 md:px-3 md:py-1 rounded-lg text-xs md:text-sm font-medium">
                        {(product.videos[selectedVideoIndex] as any).title}
                      </div>
                    )}

                    {(product.videos?.length ?? 0) > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVideoIndex((p) => (p - 1 + (product.videos?.length ?? 0)) % (product.videos?.length ?? 1));
                          }}
                          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 md:p-3 rounded-full transition z-10"
                        >
                          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVideoIndex((p) => (p + 1) % (product.videos?.length ?? 1));
                          }}
                          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 md:p-3 rounded-full transition z-10"
                        >
                          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {product.videos.length > 1 && (
                  <div className="py-4 md:py-8 pl-2 pr-2 md:pl-8 md:pr-4 bg-white/80 backdrop-blur-sm rounded-2xl">
                    <div className="pl-2 md:pl-4 flex gap-3 md:gap-4 overflow-x-auto overflow-y-hidden scroll-smooth snap-x scrollbar-hide -my-2">
                      {product.videos.map((video: any, idx: number) => (
                        <button
                          key={video.id || idx}
                          onClick={() => setSelectedVideoIndex(idx)}
                          className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-4 shadow-md transition-all duration-300 snap-center group my-2 ${
                            selectedVideoIndex === idx
                              ? 'border-primary scale-110 shadow-[0_2px_5px_rgba(0,0,0,0.25)]'
                              : 'border-gray-200 hover:border-primary hover:scale-105'
                          }`}
                        >
                          {video.thumbnail_url ? (
                            <OptimizedImage
                              src={getImageUrl(video.thumbnail_url)}
                              alt={video.title || `Видео ${idx + 1}`}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>

                          {selectedVideoIndex === idx && (
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== ПРАВАЯ КОЛОНКА: инфо и покупка ===== */}
          <div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {product.is_new && (
                <span className="bg-green-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold">NEW</span>
              )}
              {product.is_featured && (
                <span className="bg-blue-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold">ХИТ ПРОДАЖ</span>
              )}
              {hasActiveTimedSale && (
                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold animate-pulse">
                  ⚡ АКЦИЯ
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900">{product.name}</h1>

            <div className="mb-6 p-4 md:p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Купить на маркетплейсах:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {product.wildberries_url ? (
                  <a
                    href={product.wildberries_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-lg font-medium transition-all duration-200 bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 text-sm md:text-base"
                  >
                    <span>Wildberries</span>
                  </a>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-lg font-medium bg-gray-200 text-gray-400 cursor-not-allowed opacity-50 text-sm md:text-base">
                    <span>Wildberries</span>
                  </div>
                )}

                {(product as any).aliexpress_url ? (
                  <a
                    href={(product as any).aliexpress_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transform hover:scale-105 text-sm md:text-base"
                  >
                    <span>AliExpress</span>
                  </a>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-lg font-medium bg-gray-200 text-gray-400 cursor-not-allowed opacity-50 text-sm md:text-base">
                    <span>AliExpress</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6 p-4 md:p-6 bg-white rounded-xl shadow-sm">
              <h3 className="border-b mb-3 md:mb-4 pb-3 md:pb-4 font-semibold text-base md:text-lg flex items-center gap-2">
                Информация о товаре
              </h3>

              <div className="space-y-2 md:space-y-3 mb-3 md:mb-4 pb-3 md:pb-4 text-sm border-b">
                <div className="text-sm md:text-base pl-2 md:pl-4 pr-2 md:pr-4 flex justify-between items-center py-1 md:py-2 hover:bg-blue-50 rounded-lg transition">
                  <span className="text-gray-600">Артикул:</span>
                  <span className="font-medium">{selectedVariant?.sku || product.sku}</span>
                </div>

                {product.category_name && (
                  <div className="text-sm md:text-base pl-2 md:pl-4 pr-2 md:pr-4 flex justify-between items-center py-1 md:py-2 hover:bg-blue-50 rounded-lg transition">
                    <span className="text-gray-600">Категория:</span>
                    <span className="font-medium">{product.category_name}</span>
                  </div>
                )}
              </div>

              {product.description && (
                <div className="mb-3 md:mb-4 pb-3 md:pb-4 border-b">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3">Описание</h4>
                  <div className="pl-2 md:pl-4 pr-2 md:pr-4 py-1 md:py-2 hover:bg-blue-50 rounded-lg transition text-sm md:text-base">
                    {product.description}
                  </div>
                </div>
              )}

              {product.attributes && product.attributes.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3">Характеристики</h4>
                  <div className="space-y-2 md:space-y-3">
                    {product.attributes.map((attr) => (
                      <div
                        key={attr.id}
                        className="pl-2 md:pl-4 pr-2 md:pr-4 flex justify-between items-center py-1 md:py-2 hover:bg-blue-50 rounded-lg transition text-sm md:text-base"
                      >
                        <span className="text-gray-600">{attr.attribute_name}:</span>
                        <span className="font-medium flex items-center gap-2">
                          {attr.color_code && (
                            <span
                              className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-gray-300 inline-block shadow-sm"
                              style={{ backgroundColor: attr.color_code }}
                              title={attr.value}
                            />
                          )}
                          {attr.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
              {(() => {
                let displayOldPrice = currentOldPrice && parseFloat(currentOldPrice) > parseFloat(currentPrice) ? currentOldPrice : null;
                let displayDiscountPercent = discountPercentage;
                let displaySavings = savingsAmount;

                const isAnySaleActive = hasActiveTimedSale || (product.active_sale && product.active_sale.discount_value);
                if (!displayOldPrice && isAnySaleActive && product.active_sale?.discount_value) {
                  const discountPercentFromSale = Number(product.active_sale.discount_value);
                  const currentPriceNum = parseFloat(currentPrice);
                  if (!isNaN(currentPriceNum) && !isNaN(discountPercentFromSale) && discountPercentFromSale > 0) {
                    const oldPriceFromSale = currentPriceNum / (1 - discountPercentFromSale / 100);
                    // Округляем до целого
                    const roundedOldPrice = Math.round(oldPriceFromSale);
                    displayOldPrice = roundedOldPrice.toString(); // "851"
                    displayDiscountPercent = discountPercentFromSale;
                    displaySavings = roundedOldPrice - currentPriceNum; // 851 - 638 = 213
                  }
                }

                return (
                  <>
                    <div className="flex items-center gap-2 md:gap-4 mb-3 flex-wrap">
                      <span className="text-3xl md:text-5xl font-bold text-primary">{formatPrice(currentPrice)} ₽</span>

                      {displayOldPrice && parseFloat(displayOldPrice) > parseFloat(currentPrice) && (
                        <>
                          <span className="text-xl md:text-2xl text-gray-400 line-through">{formatPrice(displayOldPrice)} ₽</span>
                          <span
                            className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg ${
                              hasActiveTimedSale
                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse'
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            СКИДКА {displayDiscountPercent}%
                          </span>
                        </>
                      )}
                    </div>

                    {displaySavings > 0 && (
                      <div className="bg-green-50 border-2 border-green-200 text-green-700 px-3 py-2 md:px-4 md:py-3 rounded-lg inline-flex items-center gap-2 text-sm md:text-base">
                        <span className="font-semibold">Вы экономите {formatPrice(displaySavings)} ₽</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="mb-6 bg-white p-4 md:p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4">Выберите вариант:</h3>

                {colors.length > 0 && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Цвет:</label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((variant) => (
                        <button
                          key={`color-${variant.id}`}
                          onClick={() => handleVariantSelect(variant)}
                          className={`px-3 py-1 md:px-4 md:py-2 rounded-lg border-2 transition-all text-sm md:text-base ${
                            selectedVariant?.id === variant.id
                              ? 'border-primary bg-primary text-white shadow-lg scale-105'
                              : 'border-gray-300 hover:border-primary hover:scale-105'
                          }`}
                        >
                          {variant.color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Размер:</label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((variant) => (
                        <button
                          key={`size-${variant.id}`}
                          onClick={() => handleVariantSelect(variant)}
                          className={`px-3 py-1 md:px-4 md:py-2 rounded-lg border-2 transition-all text-sm md:text-base ${
                            selectedVariant?.id === variant.id
                              ? 'border-primary bg-primary text-white shadow-lg scale-105'
                              : 'border-gray-300 hover:border-primary hover:scale-105'
                          }`}
                        >
                          {variant.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mt-4 pt-4 border-t">
                  {product.variants.map((variant) => {
                    const variantFinalPrice =
                      variant.final_price || variant.price || product.final_price || product.price;
                    const variantOriginalPrice = variant.price || product.price;
                    const variantDiscount = variant.discount_percentage || 0;
                    const variantThumb = variant.image_url ? getImageUrl(variant.image_url) : '';

                    return (
                      <button
                        key={variant.id}
                        onClick={() => handleVariantSelect(variant)}
                        className={`w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 border-2 rounded-lg transition-all gap-3 ${
                          selectedVariant?.id === variant.id
                            ? 'border-primary bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-primary'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
                          {variant.image_url && (
                            <OptimizedImage
                              src={variantThumb}
                              alt={variant.name}
                              width={48}
                              height={48}
                              className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0"
                            />
                          )}
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            selectedVariant?.id === variant.id ? 'bg-primary' : 'bg-gray-300'
                          }`} />
                          <span className="font-medium text-base md:text-lg truncate">{variant.name}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end mt-0 sm:mt-0">
                          <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
                            <span className="font-bold text-primary text-base md:text-lg">
                              {formatPrice(variantFinalPrice)} ₽
                            </span>
                            {variantDiscount > 0 && (
                              <>
                                <span className="text-xs md:text-sm text-gray-400 line-through">
                                  {formatPrice(variantOriginalPrice)} ₽
                                </span>
                                <span className="text-xs md:text-sm bg-red-500 text-white px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full font-bold">
                                  -{variantDiscount}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedVariant && (
              <div className="mb-6 p-3 md:p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <span className="font-medium flex-shrink-0 text-sm md:text-base">Выбрано:</span>
                    <span className="font-bold text-primary truncate text-sm md:text-base">{selectedVariant.name}</span>
                  </div>
                  <button
                    onClick={handleResetVariant}
                    className="text-xs md:text-sm text-gray-600 hover:text-red-600 transition flex-shrink-0"
                  >
                    Сбросить
                  </button>
                </div>
              </div>
            )}

            <div className={`mb-6 p-3 md:p-4 border-2 rounded-xl flex items-start gap-3 md:gap-4 ${avail.wrapCls}`}>
              <span className="text-xl md:text-2xl mt-0.5">{avail.icon}</span>
              <div>
                <p className={`font-bold text-base md:text-lg ${avail.titleCls}`}>{avail.title}</p>
                <p className={`text-xs md:text-sm mt-0.5 ${avail.subtitleCls}`}>{avail.subtitle}</p>
              </div>
            </div>

            {avail.canBuy && (
              <div className="mb-6">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Количество</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementQuantity}
                    className="w-10 h-10 md:w-12 md:h-12 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold text-lg md:text-xl disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-xl md:text-2xl font-bold w-12 md:w-16 text-center">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="w-10 h-10 md:w-12 md:h-12 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold text-lg md:text-xl disabled:opacity-50"
                    disabled={!isOrderType && quantity >= currentStock}
                  >
                    +
                  </button>
                  {!isOrderType && (
                    <span className="text-sm md:text-base text-gray-600 ml-2">{currentStock} шт.</span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!avail.canBuy}
                className={`w-full text-lg md:text-xl py-3 md:py-4 shadow-lg hover:shadow-xl font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  avail.canBuy
                    ? (avail.btnCls || (hasActiveTimedSale
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white'
                      : 'btn-primary'))
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {avail.canBuy ? (avail.btnLabel || 'В корзину') : 'Нет в наличии'}
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-4 gap-y-1 mt-4">
              {[
                { href: '/docs/returns', label: 'Возврат' },
                { href: '/docs/delivery', label: 'Доставка' },
                { href: '/docs/payment', label: 'Оплата' },
                { href: '/docs/terms', label: 'Условия' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  className="text-xs text-gray-500 hover:text-primary hover:underline transition"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg mb-8 md:mb-12 mt-8 md:mt-12">
          <ReviewGallery productId={product.id} />
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-3">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Отзывы
          </h2>
          <ReviewList productId={product.id} />
        </div>

        <div className="mt-8 md:mt-12">
          <ReviewForm productId={product.id} onSuccess={() => window.location.reload()} />
        </div>

        <div className="mt-8">
          <RelatedProducts
            categoryId={typeof product.category === 'object' ? (product.category as any)?.id : (product.category as any)}
            currentProductId={product.id}
          />
        </div>
      </div>

      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-gray-200 z-40 animate-slide-up">
          <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
              <div className="flex items-center gap-3 md:gap-4 min-w-0 w-full sm:w-auto">
                <OptimizedImage
                  src={imageUrl}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm md:text-lg line-clamp-1">{product.name}</h3>
                  <p className="text-lg md:text-2xl font-bold text-primary">{formatPrice(currentPrice)} ₽</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {avail.canBuy && (
                  <div className="flex items-center gap-1 md:gap-2">
                    <button
                      onClick={decrementQuantity}
                      className="w-8 h-8 md:w-10 md:h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold disabled:opacity-50 text-sm md:text-base"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-base md:text-xl font-bold w-8 md:w-12 text-center">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="w-8 h-8 md:w-10 md:h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold disabled:opacity-50 text-sm md:text-base"
                      disabled={!isOrderType && quantity >= currentStock}
                    >
                      +
                    </button>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={!avail.canBuy}
                  className={`px-4 py-2 md:px-8 md:py-3 text-sm md:text-lg font-semibold rounded-xl transition-all disabled:opacity-50 ${
                    avail.canBuy
                      ? (hasActiveTimedSale
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white'
                        : 'btn-primary')
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {avail.canBuy ? 'В корзину' : 'Нет в наличии'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-2 right-2 md:top-4 md:right-4 text-white hover:text-gray-300 transition z-10 bg-black bg-opacity-50 rounded-full p-2"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {!selectedVariant && normalizedGalleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((p) => (p - 1 + normalizedGalleryImages.length) % normalizedGalleryImages.length);
                }}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 md:p-4 rounded-full transition z-20"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((p) => (p + 1) % normalizedGalleryImages.length);
                }}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 md:p-4 rounded-full transition z-20"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <OptimizedImage
                key={selectedVariant ? `lightbox-${selectedVariant.id}` : `lightbox-${selectedImage}`}
                src={imageUrl}
                alt={mainImageAlt}
                width={1200}
                height={1200}
                className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm z-20">
            {selectedVariant ? 'Фото варианта' : `${selectedImage + 1} / ${normalizedGalleryImages.length || 1}`}
          </div>
        </div>
      )}

      <RecentlyViewedProducts currentProductId={product?.id} />
      <Footer />
    </div>
  );
}