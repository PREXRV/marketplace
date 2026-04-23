'use client';

import OptimizedImage from '@/components/OptimizedImage';
import { useAuth } from '@/context/AuthContext';

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

  const avatarUrl = review.user_id === user?.id 
    ? (user.avatar_url || user.avatar || '/default-avatar.png')
    : (review.user_avatar || '/default-avatar.png');

  return (
    <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-3 md:mb-4">
      <div className="flex items-start gap-3 md:gap-4">
        {/* Аватар */}
        <OptimizedImage
          src={avatarUrl}
          alt={review.user_name}
          width={48}
          height={48}
          className="rounded-full object-cover w-10 h-10 md:w-12 md:h-12"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 md:mb-2 flex-wrap gap-1">
            <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">{review.user_name}</h4>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
          </div>

          <p className="text-gray-700 mb-1 md:mb-2 text-sm md:text-base break-words">{review.comment}</p>

          <p className="text-xs md:text-sm text-gray-500">
            {new Date(review.created_at).toLocaleDateString('ru-RU')}
          </p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {review.images.map((img, idx) => (
                <OptimizedImage
                  key={idx}
                  src={img}
                  alt={`Review image ${idx + 1}`}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover w-16 h-16 md:w-20 md:h-20"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}