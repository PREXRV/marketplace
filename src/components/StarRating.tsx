'use client';

import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showCount?: boolean;
  count?: number;
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  interactive = false,
  onChange,
  showCount = false,
  count = 0
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1 ${sizeClasses[size]}`}>
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= currentRating;
          const isHalfFilled = !isFilled && starValue - 0.5 <= currentRating;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-150`}
              disabled={!interactive}
            >
              {isFilled ? (
                <span className="text-yellow-400">★</span>
              ) : isHalfFilled ? (
                <span className="relative">
                  <span className="text-gray-300">★</span>
                  <span className="absolute inset-0 text-yellow-400 overflow-hidden w-1/2">★</span>
                </span>
              ) : (
                <span className="text-gray-300">★</span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* ✅ ИСПРАВЛЕНО: НЕ ПОКАЗЫВАТЬ если count === 0 */}
      {showCount && count > 0 && (
        <span className="text-sm text-gray-600">
          ({count} {count === 1 ? 'отзыв' : count < 5 ? 'отзыва' : 'отзывов'})
        </span>
      )}
      
      {/* ✅ ИСПРАВЛЕНО: рейтинг только если больше 0 */}
      {!interactive && rating > 0 && (
        <span className="text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
