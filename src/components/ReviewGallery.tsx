'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { api, getImageUrl, MediaGalleryItem } from '@/lib/api';
import StarRating from './StarRating';
import { useAuth } from '@/context/AuthContext';

interface ReviewGalleryProps {
  productId: number;
}

export default function ReviewGallery({ productId }: ReviewGalleryProps) {
  const { user } = useAuth();

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

  const closeLightbox = () => setLightboxOpen(false);

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
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name?: string | null): string => {
    if (!name || !name.trim()) return 'AN';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
  };

  const getActualAvatar = (item: MediaGalleryItem): string => {
    if (user && item.author_username === user.username) {
      return user.avatar_url || user.avatar || '/default-avatar.png';
    }
    return item.author_avatar || '/default-avatar.png';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (media.length === 0) return null;

  const currentMedia = filteredMedia[currentImageIndex];

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-5 sm:mb-6">
        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
          Фото и видео
          <span className="text-sm sm:text-base font-normal text-gray-600">
            ({media.length})
          </span>
        </h3>

        {/* FILTERS */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: `Все (${media.length})` },
            { key: 'image', label: `📷 Фото (${media.filter(m => m.media_type === 'image').length})` },
            { key: 'video', label: `🎥 Видео (${media.filter(m => m.media_type === 'video').length})` }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key as any)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                filter === btn.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {filteredMedia.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => openLightbox(idx)}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-100"
          >
            {item.media_type === 'image' ? (
              <img
                src={getImageUrl(item.file)}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  src={getImageUrl(item.file)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="bg-white rounded-full p-2">
                    ▶
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && currentMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-4"
          onClick={closeLightbox}
        >
          {/* CLOSE */}
          <button
            onClick={closeLightbox}
            className="absolute top-3 right-3 text-white text-xl z-10"
          >
            ✕
          </button>

          {/* MEDIA */}
          <div
            className="max-w-full max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentMedia.media_type === 'image' ? (
              <img
                src={getImageUrl(currentMedia.file)}
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : (
              <video
                src={getImageUrl(currentMedia.file)}
                controls
                autoPlay
                className="max-w-full max-h-[80vh]"
              />
            )}
          </div>

          {/* NAV */}
          {filteredMedia.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 sm:left-4 text-white text-2xl"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 sm:right-4 text-white text-2xl"
              >
                ›
              </button>
            </>
          )}

          {/* MOBILE INFO */}
          <div className="absolute bottom-3 left-3 right-3 bg-white rounded-lg p-3 text-xs sm:hidden">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-white text-xs">
                {getActualAvatar(currentMedia) !== '/default-avatar.png' ? (
                  <Image
                    src={getActualAvatar(currentMedia)}
                    alt=""
                    width={28}
                    height={28}
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  getInitials(currentMedia.author_name)
                )}
              </div>
              <div>
                <div className="font-semibold">
                  {currentMedia.author_name || 'Аноним'}
                </div>
                <StarRating rating={currentMedia.rating || 5} size="sm" />
              </div>
            </div>

            {currentMedia.comment && (
              <p className="line-clamp-2 text-gray-700">
                {currentMedia.comment}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}