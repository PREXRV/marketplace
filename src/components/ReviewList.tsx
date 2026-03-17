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

  // ✅ ФУНКЦИЯ ПОЛУЧЕНИЯ АКТУАЛЬНОГО АВАТАРА
  const getActualAvatar = (authorUsername?: string, authorAvatar?: string): string => {
    if (user && authorUsername === user.username) {
      return user.avatar || '/default-avatar.png';
    }
    return authorAvatar || '/default-avatar.png';
  };

  // ✅ ФУНКЦИЯ КЕШ-БАСТИНГА
  const getAvatarWithCacheBuster = (avatarUrl: string, authorUsername?: string): string => {
    if (!avatarUrl || avatarUrl === '/default-avatar.png') return avatarUrl;
    
    // Если это аватар текущего пользователя - добавляем timestamp
    if (user && authorUsername && authorUsername === user.username) {
      const separator = avatarUrl.includes('?') ? '&' : '?';
      return `${avatarUrl}${separator}t=${Date.now()}`;
    }
    
    return avatarUrl;
  };

  useEffect(() => {
    fetchReviews();
    fetchStats();
    
    // Загрузка голосов с валидацией
    try {
      const voted = localStorage.getItem(`voted_reviews_${productId}`);
      if (voted) {
        const parsed = JSON.parse(voted);
        if (Array.isArray(parsed) && parsed.every(id => typeof id === 'number')) {
          setVotedReviews(new Set(parsed));
        } else {
          localStorage.removeItem(`voted_reviews_${productId}`);
          setVotedReviews(new Set());
        }
      }
    } catch (e) {
      console.error('Ошибка загрузки voted_reviews:', e);
      localStorage.removeItem(`voted_reviews_${productId}`);
      setVotedReviews(new Set());
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data: any = await api.getReviews(productId);

      if (Array.isArray(data)) {
        setReviews(data);
      } else if (data?.results) {
        setReviews(data.results);
      } else {
        console.error('Неверный формат данных:', data);
      }
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getReviewStats(productId);
      setStats(data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const handleHelpful = async (reviewId: number) => {
    if (votedReviews.has(reviewId)) {
      alert('Вы уже оценили этот отзыв!');
      return;
    }

    try {
      await api.markReviewHelpful(reviewId);
      
      const newVoted = new Set(votedReviews);
      newVoted.add(reviewId);
      setVotedReviews(newVoted);
      
      localStorage.setItem(`voted_reviews_${productId}`, JSON.stringify(Array.from(newVoted)));
      
      fetchReviews();
    } catch (error) {
      console.error('Ошибка голосования:', error);
    }
  };

  const handleNotHelpful = async (reviewId: number) => {
    if (votedReviews.has(reviewId)) {
      alert('Вы уже оценили этот отзыв!');
      return;
    }

    try {
      await api.markReviewNotHelpful(reviewId);
      
      const newVoted = new Set(votedReviews);
      newVoted.add(reviewId);
      setVotedReviews(newVoted);
      
      localStorage.setItem(`voted_reviews_${productId}`, JSON.stringify(Array.from(newVoted)));
      
      fetchReviews();
    } catch (error) {
      console.error('Ошибка голосования:', error);
    }
  };

  const openLightbox = (type: string, url: string) => {
    setLightboxImage({ type, url });
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getFilteredReviews = () => {
    let filtered = [...reviews];
    
    if (filterRating) {
      filtered = filtered.filter(r => r.rating === filterRating);
    }
    
    if (sortBy === 'helpful') {
      filtered.sort((a, b) => b.helpful_count - a.helpful_count);
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Пока нет отзывов</h3>
        <p className="text-gray-600">Будьте первым, кто оставит отзыв о этом товаре!</p>
      </div>
    );
  }

  const filteredReviews = getFilteredReviews();

  return (
    <div>
      {/* Статистика */}
      {stats && stats.count > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {stats.average_rating.toFixed(1)}
              </div>
              <StarRating rating={stats.average_rating} size="lg" />
              <p className="text-gray-600 mt-2">
                На основе {stats.count} {stats.count === 1 ? 'отзыва' : 'отзывов'}
              </p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const data = stats.distribution[rating];
                return (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition ${
                      filterRating === rating ? 'bg-white shadow-md' : 'hover:bg-white/50'
                    }`}
                  >
                    <span className="text-sm font-medium w-8">{rating} ★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${data?.percentage || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {data?.count || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Фильтры и сортировка */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Сортировка:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'helpful')}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary"
          >
            <option value="recent">Сначала новые</option>
            <option value="helpful">Сначала полезные</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="text-sm text-primary hover:underline"
            >
              Сбросить фильтр ✕
            </button>
          )}
        </div>
      </div>

      {/* Список отзывов */}
      <div className="space-y-6">
        {filteredReviews.map((review) => {
          const reviewAvatarUrl = getActualAvatar(review.author_username, review.author_avatar);
          
          return (
            <div 
              id={`review-${review.id}`}
              key={review.id} 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition scroll-mt-20"
            >
              <div className="flex items-start gap-4 mb-4">
                {/* ✅ АВАТАРКА ОТЗЫВА */}
                <div className="flex-shrink-0">
                  {reviewAvatarUrl !== '/default-avatar.png' ? (
                    <Image
                      key={`review-${review.id}-${user?.username}-${user?.avatar}`}
                      src={getImageUrl(getAvatarWithCacheBuster(reviewAvatarUrl, review.author_username))}
                      alt={review.author_name || 'Аноним'}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow-md"
                      unoptimized
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {getInitials(review.author_name || review.author_username)}
                    </div>
                  )}
                </div>

                {/* Информация об авторе */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-bold text-lg text-gray-900">
                      {review.author_name || review.author_username || 'Аноним'}
                    </h4>
                    
                    {review.author_tags && review.author_tags.length > 0 && (
                      <UserBadges badges={review.author_tags} size="medium" maxDisplay={5} />
                    )}
                    
                    {review.is_verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Проверенная покупка
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{formatDate(review.created_at)}</p>
                  <StarRating rating={review.rating} size="sm" />
                </div>
              </div>

              {review.title && (
                <h5 className="font-bold text-lg text-gray-900 mb-3">{review.title}</h5>
              )}

              <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

              {/* Медиа файлы */}
              {review.media && review.media.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {review.media.map((item) => (
                    <div
                      key={item.id}
                      className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition"
                      onClick={() => openLightbox(item.media_type, getImageUrl(item.file))}
                    >
                      {item.media_type === 'image' ? (
                        <img
                          src={getImageUrl(item.file)}
                          alt="Review media"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <>
                          <video src={getImageUrl(item.file)} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Плюсы и минусы */}
              {(review.pros || review.cons) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  {review.pros && (
                    <div>
                      <h6 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                        <span>✓</span> Достоинства:
                      </h6>
                      <p className="text-sm text-gray-700">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div>
                      <h6 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                        <span>✕</span> Недостатки:
                      </h6>
                      <p className="text-sm text-gray-700">{review.cons}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Ответы на отзыв */}
              {review.replies && review.replies.length > 0 && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquareIcon size={18} />
                    Ответы ({review.replies.length})
                  </p>
                  {review.replies.map((reply) => {
                    const replyAvatarUrl = getActualAvatar(reply.author_username, reply.author_avatar);
                    
                    return (
                      <div 
                        key={reply.id} 
                        className={`p-4 rounded-lg ${
                          reply.is_official 
                            ? 'bg-blue-50 border-l-4 border-blue-500' 
                            : 'bg-gray-50 border-l-4 border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* ✅ АВАТАРКА ОТВЕТА */}
                          {replyAvatarUrl !== '/default-avatar.png' ? (
                            <Image
                              key={`reply-${reply.id}-${user?.username}-${user?.avatar}`}
                              src={getImageUrl(getAvatarWithCacheBuster(replyAvatarUrl, reply.author_username))}
                              alt={reply.author_username || 'Автор'} 
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {getInitials(reply.author_username)}
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-semibold text-sm">
                                {reply.author_username || 'Автор'}
                              </p>
                              
                              {reply.author_tags && reply.author_tags.length > 0 && (
                                <UserBadges badges={reply.author_tags} size="small" maxDisplay={3} />
                              )}
                              
                              {reply.is_official && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
                                  Официальный ответ
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.text}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(reply.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Кнопка "Ответить" */}
              {isAuthenticated && replyingToReview !== review.id && (
                <div className="mt-4 pt-4 border-t mb-4">
                  <button
                    onClick={() => setReplyingToReview(review.id)}
                    className="group inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:border-primary text-gray-700 hover:text-primary font-medium rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="w-8 h-8 bg-blue-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
                      <MessageSquareIcon size={16} />
                    </div>
                    <span>Ответить на отзыв</span>
                    <svg 
                      className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Форма ответа */}
              {replyingToReview === review.id && (
                <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-4">
                  <ReviewReplyForm
                    reviewId={review.id}
                    onSuccess={() => {
                      setReplyingToReview(null);
                      fetchReviews();
                    }}
                    onCancel={() => setReplyingToReview(null)}
                  />
                </div>
              )}

              {/* Кнопки голосования */}
              <div className="flex items-center gap-4 pt-4 border-t flex-wrap">
                <span className="text-sm text-gray-600">Полезен отзыв?</span>
                <button
                  onClick={() => handleHelpful(review.id)}
                  disabled={votedReviews.has(review.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-sm font-medium ${
                    votedReviews.has(review.id)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-green-100 hover:text-green-700'
                  }`}
                >
                  <span>👍</span>
                  <span>Да ({review.helpful_count})</span>
                </button>
                
                <button
                  onClick={() => handleNotHelpful(review.id)}
                  disabled={votedReviews.has(review.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-sm font-medium ${
                    votedReviews.has(review.id)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-red-100 hover:text-red-700'
                  }`}
                >
                  <span>👎</span>
                  <span>Нет ({review.not_helpful_count})</span>
                </button>
                
                {votedReviews.has(review.id) && (
                  <span className="text-xs text-gray-500">✓ Вы уже оценили</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxOpen && lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10 bg-black bg-opacity-50 rounded-full p-2"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {lightboxImage.type === 'image' ? (
              <img
                src={lightboxImage.url}
                alt="Review media"
                className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <video
                src={lightboxImage.url}
                controls
                autoPlay
                className="max-w-full max-h-[95vh] rounded-lg shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
