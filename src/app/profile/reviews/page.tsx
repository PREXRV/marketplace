'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { api, Review, getImageUrl } from '@/lib/api';

// SVG иконки
const StarIcon = ({ filled, size = 18 }: { filled: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#FFD700' : 'none'} stroke={filled ? '#FFD700' : '#ddd'} strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const EditIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ExternalLinkIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const MessageSquareIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ClockIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const ImageIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default function MyReviewsPage() {
  const { user, tokens, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (tokens) {
      fetchMyReviews();
    }
  }, [authLoading, isAuthenticated, tokens]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      
      if (!tokens?.access) {
        console.error('Токен отсутствует!');
        return;
      }
      
      const data = await api.getMyReviews(tokens.access);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (review: Review) => {
    if (review.is_approved) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircleIcon size={16} />
          Опубликован
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <ClockIcon size={16} />
        На модерации
      </span>
    );
  };

  // ✅ ФУНКЦИЯ ПОЛУЧЕНИЯ ССЫЛКИ НА ОТЗЫВ
  const getReviewUrl = (review: Review) => {
    const productSlug = review.product_slug || review.product;
    return `/product/${productSlug}#review-${review.id}`;
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/profile" className="hover:text-primary">Профиль</Link>
          <span>/</span>
          <span className="text-gray-900">Мои отзывы</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Мои отзывы</h1>
          <span className="text-lg text-gray-600">{reviews.length} отзывов</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MessageSquareIcon size={80} />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2 mt-4">Вы ещё не оставляли отзывов</h3>
            <p className="text-gray-600 mb-6">Поделитесь своим мнением о купленных товарах</p>
            <Link href="/catalog" className="btn-primary inline-block">
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                {/* ✅ ИСПРАВЛЕННЫЙ ЗАГОЛОВОК */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link 
                      href={getReviewUrl(review)}
                      className="text-lg font-semibold text-gray-900 hover:text-primary transition inline-flex items-center gap-2 mb-2"
                    >
                      {review.product_name}
                      <ExternalLinkIcon size={18} />
                    </Link>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} filled={i < review.rating} size={18} />
                        ))}
                      </div>
                      {getStatusBadge(review)}
                      {review.is_verified && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <CheckCircleIcon size={16} />
                          Проверенная покупка
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* ✅ КНОПКИ ДЕЙСТВИЙ */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={getReviewUrl(review)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg"
                      title="Перейти к отзыву на странице товара"
                    >
                      <ExternalLinkIcon size={16} />
                      Перейти к отзыву
                    </Link>
                    
                    <button
                      onClick={() => setEditingReview(review)}
                      className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition"
                      title="Редактировать"
                    >
                      <EditIcon size={20} />
                    </button>
                  </div>
                </div>

                {/* Содержание */}
                {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                )}
                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>

                {/* Достоинства/Недостатки */}
                {(review.pros || review.cons) && (
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {review.pros && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <span className="text-xl">👍</span>
                          Достоинства
                        </p>
                        <p className="text-green-700 text-sm whitespace-pre-wrap">{review.pros}</p>
                      </div>
                    )}
                    {review.cons && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <p className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                          <span className="text-xl">👎</span>
                          Недостатки
                        </p>
                        <p className="text-red-700 text-sm whitespace-pre-wrap">{review.cons}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Медиа */}
                {review.media && review.media.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <ImageIcon size={16} />
                      Фото ({review.media.length})
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {review.media.map((media) => (
                        <img
                          key={media.id}
                          src={getImageUrl(media.file)}
                          alt="Review media"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-primary transition cursor-pointer"
                          onClick={() => window.open(getImageUrl(media.file), '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Ответы */}
                {review.replies && review.replies.length > 0 && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquareIcon size={18} />
                      Ответы ({review.replies.length})
                    </p>
                    {review.replies.map((reply) => (
                      <div 
                        key={reply.id} 
                        className={`p-4 rounded-lg ${
                          reply.is_official 
                            ? 'bg-blue-50 border-l-4 border-blue-500' 
                            : 'bg-gray-50 border-l-4 border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          {reply.author_avatar ? (
                            <img 
                              src={getImageUrl(reply.author_avatar)} 
                              alt={reply.author_username || 'Автор'} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {(reply.author_username || 'А').charAt(0)}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">{reply.author_username || 'Автор'}</p>
                              {reply.is_official && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
                                  Официальный ответ
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.text}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(reply.created_at).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Футер */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span>👍 {review.helpful_count}</span>
                    <span>👎 {review.not_helpful_count}</span>
                  </div>
                  <span>{new Date(review.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно редактирования */}
        {editingReview && (
          <EditReviewModal
            review={editingReview}
            onClose={() => setEditingReview(null)}
            onUpdate={fetchMyReviews}
            token={tokens!.access}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

// Модальное окно редактирования
interface EditReviewModalProps {
  review: Review;
  onClose: () => void;
  onUpdate: () => void;
  token: string;
}

function EditReviewModal({ review, onClose, onUpdate, token }: EditReviewModalProps) {
  const [formData, setFormData] = useState({
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    pros: review.pros,
    cons: review.cons,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await api.updateMyReview(token, review.id, formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Ошибка обновления отзыва:', error);
      alert('Ошибка обновления отзыва');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Редактировать отзыв</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <XCircleIcon size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Рейтинг */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Оценка <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className="p-2 hover:scale-110 transition"
                >
                  <StarIcon filled={rating <= formData.rating} size={32} />
                </button>
              ))}
            </div>
          </div>

          {/* Заголовок */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Кратко о вашем впечатлении"
            />
          </div>

          {/* Комментарий */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Комментарий <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Расскажите подробнее..."
            />
          </div>

          {/* Достоинства */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Достоинства</label>
            <textarea
              value={formData.pros}
              onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Что понравилось?"
            />
          </div>

          {/* Недостатки */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Недостатки</label>
            <textarea
              value={formData.cons}
              onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Что не понравилось?"
            />
          </div>

          {/* Предупреждение */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <ClockIcon size={16} />
              После редактирования отзыв будет отправлен на повторную модерацию
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
