'use client';

import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

interface Review {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
  images?: string[];
}

export default function ReviewCard({ review }: { review: Review }) {
  const { user } = useAuth(); // ✅ Берем текущего пользователя из контекста

  // ✅ Если это отзыв текущего пользователя - берем аватар из контекста (актуальный!)
  const avatarUrl = review.user_id === user?.id 
    ? (user.avatar_url || user.avatar || '/default-avatar.png')
    : (review.user_avatar || '/default-avatar.png');
  

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-start gap-4">
        {/* ✅ АВАТАР - обновляется автоматически */}
        <Image
          src={avatarUrl}
          alt={review.user_name}
          width={48}
          height={48}
          className="rounded-full object-cover"
          unoptimized
        />
        
        <div className="flex-1">
          {/* Имя и рейтинг */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
          </div>
          
          {/* Комментарий */}
          <p className="text-gray-700 mb-2">{review.comment}</p>
          
          {/* Дата */}
          <p className="text-sm text-gray-500">
            {new Date(review.created_at).toLocaleDateString('ru-RU')}
          </p>
          
          {/* Изображения (если есть) */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-3">
              {review.images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  alt={`Review image ${idx + 1}`}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover"
                  unoptimized
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
