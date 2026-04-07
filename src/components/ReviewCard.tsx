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
  const { user } = useAuth();

  const avatarUrl =
    review.user_id === user?.id
      ? user.avatar_url || user.avatar || '/default-avatar.png'
      : review.user_avatar || '/default-avatar.png';

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Аватар */}
        <Image
          src={avatarUrl}
          alt={review.user_name}
          width={48}
          height={48}
          className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
          unoptimized
        />

        <div className="flex-1 min-w-0">
          {/* Имя и рейтинг */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
            <h4 className="font-semibold text-gray-900 truncate">
              {review.user_name}
            </h4>

            <div className="flex items-center gap-1 text-sm sm:text-base">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={
                    i < review.rating
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Комментарий */}
          <p className="text-gray-700 mb-2 break-words text-sm sm:text-base">
            {review.comment}
          </p>

          {/* Дата */}
          <p className="text-xs sm:text-sm text-gray-500">
            {new Date(review.created_at).toLocaleDateString('ru-RU')}
          </p>

          {/* Изображения */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {review.images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  alt={`Review image ${idx + 1}`}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover w-20 h-20 sm:w-[100px] sm:h-[100px] flex-shrink-0"
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