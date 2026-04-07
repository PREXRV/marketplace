'use client';

import { useState, useEffect } from 'react';
import { api, Review, ReviewStats, getImageUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StarRating from './StarRating';
import ReviewReplyForm from './ReviewReplyForm';
import UserBadges from '@/components/UserBadges';
import Image from 'next/image';
import { getInitials } from '@/lib/utils';

interface ReviewListProps {
  productId: number;
}

const MessageSquareIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default function ReviewList({ productId }: ReviewListProps) {
  const { isAuthenticated, user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [votedReviews, setVotedReviews] = useState<Set<number>>(new Set());
  const [replyingToReview, setReplyingToReview] = useState<number | null>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ type: string; url: string } | null>(null);

  const getActualAvatar = (authorUsername?: string, authorAvatar?: string): string => {
    if (user && authorUsername === user.username) {
      return user.avatar_url || user.avatar || '/default-avatar.png';
    }
    return authorAvatar || '/default-avatar.png';
  };

  useEffect(() => {
    fetchReviews();
    fetchStats();

    const voted = localStorage.getItem(`voted_reviews_${productId}`);
    if (voted) {
      try {
        setVotedReviews(new Set(JSON.parse(voted)));
      } catch {
        setVotedReviews(new Set());
      }
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data: any = await api.getReviews(productId);
      setReviews(Array.isArray(data) ? data : data?.results || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getReviewStats(productId);
      setStats(data);
    } catch {}
  };

  const handleHelpful = async (reviewId: number) => {
    if (votedReviews.has(reviewId)) return;
    await api.markReviewHelpful(reviewId);
    const updated = new Set(votedReviews).add(reviewId);
    setVotedReviews(updated);
    localStorage.setItem(`voted_reviews_${productId}`, JSON.stringify([...updated]));
    fetchReviews();
  };

  const handleNotHelpful = async (reviewId: number) => {
    if (votedReviews.has(reviewId)) return;
    await api.markReviewNotHelpful(reviewId);
    const updated = new Set(votedReviews).add(reviewId);
    setVotedReviews(updated);
    localStorage.setItem(`voted_reviews_${productId}`, JSON.stringify([...updated]));
    fetchReviews();
  };

  const openLightbox = (type: string, url: string) => {
    setLightboxImage({ type, url });
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage(null);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ru-RU');

  const filteredReviews = [...reviews]
    .filter(r => (filterRating ? r.rating === filterRating : true))
    .sort((a, b) =>
      sortBy === 'helpful'
        ? b.helpful_count - a.helpful_count
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl">
        <div className="text-4xl mb-3">💬</div>
        <p className="text-gray-600 text-sm">
          Пока нет отзывов
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* СТАТИСТИКА */}
      {stats && (
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6">
          <div className="text-center mb-4">
            <div className="text-3xl sm:text-5xl font-bold text-primary">
              {stats.average_rating.toFixed(1)}
            </div>
            <StarRating rating={stats.average_rating} size="sm" />
          </div>

          <div className="space-y-1">
            {[5,4,3,2,1].map(r => (
              <button
                key={r}
                onClick={() => setFilterRating(filterRating === r ? null : r)}
                className="flex items-center gap-2 w-full text-xs"
              >
                <span className="w-6">{r}★</span>
                <div className="flex-1 bg-gray-200 h-2 rounded">
                  <div
                    className="bg-yellow-400 h-2 rounded"
                    style={{ width: `${stats.distribution[r]?.percentage || 0}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ФИЛЬТРЫ */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="recent">Сначала новые</option>
          <option value="helpful">Сначала полезные</option>
        </select>

        {filterRating && (
          <button
            onClick={() => setFilterRating(null)}
            className="text-sm text-primary"
          >
            Сбросить фильтр
          </button>
        )}
      </div>

      {/* ОТЗЫВЫ */}
      <div className="space-y-4 sm:space-y-6">
        {filteredReviews.map((review) => {
          const avatar = getActualAvatar(review.author_username, review.author_avatar);

          return (
            <div
              key={review.id}
              className="bg-white rounded-xl p-4 sm:p-6 shadow"
            >
              <div className="flex gap-3">
                {/* AVATAR */}
                <div className="flex-shrink-0">
                  {avatar !== '/default-avatar.png' ? (
                    <Image
                      src={getImageUrl(avatar)}
                      alt=""
                      width={48}
                      height={48}
                      className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm">
                      {getInitials(review.author_name)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base truncate">
                      {review.author_name || 'Аноним'}
                    </span>
                    {review.is_verified && (
                      <span className="text-xs text-green-600">
                        ✓
                      </span>
                    )}
                  </div>

                  <StarRating rating={review.rating} size="sm" />

                  <p className="text-xs text-gray-500">
                    {formatDate(review.created_at)}
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-700 mt-3 break-words">
                {review.comment}
              </p>

              {/* MEDIA */}
              {review.media?.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {review.media.map(item => (
                    <div
                      key={item.id}
                      onClick={() => openLightbox(item.media_type, getImageUrl(item.file))}
                      className="w-20 h-20 flex-shrink-0 rounded overflow-hidden"
                    >
                      <img
                        src={getImageUrl(item.file)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
                <button
                  onClick={() => handleHelpful(review.id)}
                  disabled={votedReviews.has(review.id)}
                >
                  👍 {review.helpful_count}
                </button>

                <button
                  onClick={() => handleNotHelpful(review.id)}
                  disabled={votedReviews.has(review.id)}
                >
                  👎 {review.not_helpful_count}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-2 z-50"
          onClick={closeLightbox}
        >
          {lightboxImage.type === 'image' ? (
            <img
              src={lightboxImage.url}
              className="max-h-[90vh] object-contain"
            />
          ) : (
            <video
              src={lightboxImage.url}
              controls
              className="max-h-[90vh]"
            />
          )}
        </div>
      )}
    </div>
  );
}