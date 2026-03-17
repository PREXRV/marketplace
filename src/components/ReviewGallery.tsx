'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { api, getImageUrl, MediaGalleryItem } from '@/lib/api';
import StarRating from './StarRating';
import { useAuth } from '@/context/AuthContext'; // ✅ ДОБАВЛЕНО

interface ReviewGalleryProps {
  productId: number;
}

export default function ReviewGallery({ productId }: ReviewGalleryProps) {
  const { user } = useAuth(); // ✅ ПОЛУЧАЕМ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
  const [media, setMedia] = useState<MediaGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

  const filteredMedia = useMemo(() => {
    return filter === 'all'
      ? media
      : media.filter(m => m.media_type === filter);
  }, [filter, media]);

  useEffect(() => {
    fetchGallery();
  }, [productId]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const data = await api.getMediaGallery(productId);
      setMedia(data);
    } catch (error) {
      console.error('Ошибка загрузки галереи:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const scrollToReview = (reviewId: number) => {
    closeLightbox(); // Закрываем галерею
    
    // Небольшая задержка для анимации закрытия
    setTimeout(() => {
      const element = document.getElementById(`review-${reviewId}`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // Подсветка отзыва
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 2000);
      } else {
        console.warn(`Отзыв #${reviewId} не найден на странице`);
      }
    }, 300);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % filteredMedia.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + filteredMedia.length) % filteredMedia.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, filteredMedia]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // ✅ ИСПРАВЛЕНО: regex без двойного слэша
  const getInitials = (name?: string | null): string => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return 'AN';
    }
    
    try {
      const parts = name.trim().split(/\s+/); // ✅ ИСПРАВЛЕНО: /\s+/ вместо /\\s+/
      if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
      }
      return parts
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase();
    } catch (e) {
      console.error('getInitials error:', e);
      return 'AN';
    }
  };

  // ✅ ФУНКЦИЯ ПОЛУЧЕНИЯ АКТУАЛЬНОГО АВАТАРА
  const getActualAvatar = (item: MediaGalleryItem): string => {
    // Если это отзыв текущего пользователя - берем аватар из контекста
    if (user && item.author_username === user.username) {
      return user.avatar || '/default-avatar.png';
    }
    // Иначе - берем из данных отзыва
    return item.author_avatar || '/default-avatar.png';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (media.length === 0) {
    return null;
  }

  const currentMedia = filteredMedia[currentImageIndex];

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Фото и видео от покупателей
          <span className="text-base font-normal text-gray-600">({media.length})</span>
        </h3>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Все ({media.length})
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'image'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📷 Фото ({media.filter(m => m.media_type === 'image').length})
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'video'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎥 Видео ({media.filter(m => m.media_type === 'video').length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredMedia.map((item, idx) => (
          <div
            key={item.id}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300"
            onClick={() => openLightbox(idx)}
          >
            {item.media_type === 'image' ? (
              <>
                <img
                  src={getImageUrl(item.file)}
                  alt="Review media"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                  <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </>
            ) : (
              <>
                <video
                  src={getImageUrl(item.file)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition">
                  <div className="bg-white bg-opacity-95 rounded-full p-4 group-hover:scale-110 transition">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  ВИДЕО
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && filteredMedia.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
            {currentImageIndex + 1} / {filteredMedia.length}
          </div>

          {filteredMedia.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-4 rounded-full transition z-10 hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-4 rounded-full transition z-10 hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          <div className="flex items-center justify-center gap-6 max-w-[95%] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Изображение/Видео */}
            <div className="flex-shrink-0 max-w-4xl">
              {currentMedia.media_type === 'image' ? (
                <img
                  src={getImageUrl(currentMedia.file)}
                  alt="Gallery media"
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <video
                  src={getImageUrl(currentMedia.file)}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                />
              )}
            </div>

            {/* ✅ ИСПРАВЛЕННАЯ КАРТОЧКА ОТЗЫВА (Desktop) */}
            {currentMedia && (
              <div className="hidden lg:block w-96 max-h-[85vh] overflow-y-auto bg-white rounded-xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                    {getActualAvatar(currentMedia) !== '/default-avatar.png' ? (
                      <Image
                        src={getActualAvatar(currentMedia)} // ✅ ИСПОЛЬЗУЕМ АКТУАЛЬНЫЙ АВАТАР
                        alt={currentMedia.author_name || 'Аноним'}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span>{getInitials(currentMedia.author_name || currentMedia.author_username)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">
                      {currentMedia.author_name || currentMedia.author_username || 'Аноним'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(currentMedia.created_at)}
                    </p>
                  </div>
                </div>

                <StarRating rating={currentMedia.rating || 5} size="sm" />

                {/* ✅ ТЕКСТ ОТЗЫВА */}
                {currentMedia.comment && (
                  <p className="text-gray-700 leading-relaxed mt-4">
                    {currentMedia.comment.length > 200
                      ? `${currentMedia.comment.substring(0, 200)}...`
                      : currentMedia.comment}
                  </p>
                )}

                {/* ✅ КНОПКА СО СКРОЛЛОМ */}
                {currentMedia.review && (
                  <button
                    onClick={() => scrollToReview(currentMedia.review)}
                    className="inline-flex items-center gap-2 mt-4 text-primary hover:underline text-sm font-medium hover:text-primary/80 transition"
                  >
                    Читать полный отзыв
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* ✅ ИСПРАВЛЕННЫЙ Отзыв (Mobile) */}
            {currentMedia && (
              <div className="lg:hidden absolute bottom-20 left-4 right-4 bg-white rounded-xl p-4 shadow-2xl max-h-40 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {getActualAvatar(currentMedia) !== '/default-avatar.png' ? (
                      <Image
                        src={getActualAvatar(currentMedia)} // ✅ ИСПОЛЬЗУЕМ АКТУАЛЬНЫЙ АВАТАР
                        alt={currentMedia.author_name || 'Аноним'}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span>{getInitials(currentMedia.author_name || currentMedia.author_username)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-gray-900">
                      {currentMedia.author_name || currentMedia.author_username || 'Аноним'}
                    </h4>
                    <StarRating rating={currentMedia.rating || 5} size="sm" />
                  </div>
                </div>
                {/* ✅ ТЕКСТ ОТЗЫВА */}
                {currentMedia.comment && (
                  <p className="text-xs text-gray-700 line-clamp-2 mb-2">{currentMedia.comment}</p>
                )}
                {/* ✅ КНОПКА СО СКРОЛЛОМ */}
                {currentMedia.review && (
                  <button
                    onClick={() => scrollToReview(currentMedia.review)}
                    className="text-xs text-primary hover:underline"
                  >
                    Читать полностью
                  </button>
                )}
              </div>
            )}

            {/* Миниатюры */}
            {filteredMedia.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[90%] overflow-x-auto">
                <div className="flex gap-2 bg-black bg-opacity-70 p-3 rounded-full">
                  {filteredMedia.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        idx === currentImageIndex 
                          ? 'border-white scale-110' 
                          : 'border-transparent opacity-60 hover:opacity-100 hover:border-white'
                      }`}
                    >
                      {item.media_type === 'image' ? (
                        <img src={getImageUrl(item.file)} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
              Используйте ← → для навигации, ESC для закрытия
            </div>
          </div>
        </div>
      )}
    </>
  );
}
