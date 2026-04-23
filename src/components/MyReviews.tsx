'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, Review } from '@/lib/api';
import { Star, Edit2, ExternalLink, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';

export default function MyReviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    if (token) {
      fetchMyReviews();
    }
  }, [token]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const data = await api.getMyReviews(token!);
      setReviews(data);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (review: Review) => {
    if (review.is_approved) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle size={16} />
          Опубликован
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <Clock size={16} />
        На модерации
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Вы ещё не оставляли отзывов
        </h3>
        <p className="text-gray-600 mb-6">
          Поделитесь своим мнением о купленных товарах
        </p>
        <Link href="/catalog" className="btn-primary inline-block">
          Перейти к каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Мои отзывы ({reviews.length})
      </h2>

      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
        >
          {/* HEADER */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">

              <Link
                href={`/products/${review.product}`}
                className="text-lg font-semibold text-gray-900 hover:text-primary inline-flex items-center gap-2"
              >
                {review.product_name}
                <ExternalLink size={18} />
              </Link>

              <div className="flex items-center gap-3 mt-2">

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < review.rating ? '#FFD700' : 'none'}
                      stroke={i < review.rating ? '#FFD700' : '#ddd'}
                    />
                  ))}
                </div>

                {getStatusBadge(review)}

              </div>
            </div>

            <button
              onClick={() => setEditingReview(review)}
              className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
            >
              <Edit2 size={20} />
            </button>
          </div>

          {/* TITLE */}
          {review.title && (
            <h4 className="font-semibold text-gray-900 mb-2">
              {review.title}
            </h4>
          )}

          {/* COMMENT */}
          <p className="text-gray-700 mb-3">
            {review.comment}
          </p>

          {/* PROS / CONS */}
          {(review.pros || review.cons) && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">

              {review.pros && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-semibold text-green-800 mb-1">
                    Достоинства:
                  </p>
                  <p className="text-green-700 text-sm">
                    {review.pros}
                  </p>
                </div>
              )}

              {review.cons && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="font-semibold text-red-800 mb-1">
                    Недостатки:
                  </p>
                  <p className="text-red-700 text-sm">
                    {review.cons}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* MEDIA */}
          {review.media?.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {review.media.map((media) => (
                <OptimizedImage
                  key={media.id}
                  src={`http://localhost:8000${media.file}`}
                  alt="Review media"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* REPLIES */}
          {review.replies?.length > 0 && (
            <div className="mt-4 space-y-3 border-t pt-4">

              <p className="font-semibold text-gray-900">
                Ответы ({review.replies.length})
              </p>

              {review.replies.map((reply) => (

                <div
                  key={reply.id}
                  className={`p-4 rounded-lg ${
                    reply.is_official
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'bg-gray-50'
                  }`}
                >

                  <div className="flex items-center gap-2 mb-2">

                    {reply.author_avatar ? (

                      <img
                        src={reply.author_avatar}
                        alt={reply.author_username}
                        className="w-8 h-8 rounded-full"
                      />

                    ) : (

                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {reply.author_username?.charAt(0)}
                      </div>

                    )}

                    <div>
                      <p className="font-semibold text-sm">
                        {reply.author_username}
                      </p>

                      {reply.is_official && (
                        <span className="text-xs text-blue-600 font-medium">
                          Официальный ответ
                        </span>
                      )}
                    </div>

                  </div>

                  <p className="text-gray-700 text-sm">
                    {reply.text}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(reply.created_at).toLocaleDateString('ru-RU')}
                  </p>

                </div>

              ))}

            </div>
          )}

          {/* FOOTER */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-gray-600">

            <div className="flex items-center gap-4">

              <span>👍 {review.helpful_count}</span>
              <span>👎 {review.not_helpful_count}</span>

              {review.is_verified && (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle size={16} />
                  Проверенная покупка
                </span>
              )}

            </div>

            <span>
              {new Date(review.created_at).toLocaleDateString('ru-RU')}
            </span>

          </div>
        </div>
      ))}

      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onUpdate={fetchMyReviews}
          token={token!}
        />
      )}
    </div>
  );
}

interface EditReviewModalProps {
  review: Review
  onClose: () => void
  onUpdate: () => void
  token: string
}

function EditReviewModal({ review, onClose, onUpdate, token }: EditReviewModalProps) {

  const [formData, setFormData] = useState({
    rating: review.rating,
    title: review.title || '',
    comment: review.comment,
    pros: review.pros || '',
    cons: review.cons || ''
  })

  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      await api.updateMyReview(token, review.id, formData)

      onUpdate()
      onClose()

    } catch (error) {

      console.error('Ошибка обновления отзыва:', error)
      alert('Ошибка обновления отзыва')

    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >

      <div
        className="bg-white rounded-xl p-6 max-w-xl w-full"
        onClick={(e) => e.stopPropagation()}
      >

        <h3 className="text-xl font-bold mb-4">
          Редактировать отзыв
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          <textarea
            value={formData.comment}
            onChange={(e) =>
              setFormData({ ...formData, comment: e.target.value })
            }
            className="w-full border rounded-lg p-2"
            rows={4}
          />

          <div className="flex gap-3">

            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}