'use client';

import { useFavorites } from '@/context/FavoritesContext';

interface FavoriteButtonProps {
  productId: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({ productId, size = 'md' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isInFavorites = isFavorite(productId);

  const sizes = {
    sm: 'h-10 w-10 text-base sm:h-8 sm:w-8 sm:text-lg',
    md: 'h-11 w-11 text-lg sm:h-10 sm:w-10 sm:text-xl',
    lg: 'h-12 w-12 text-xl sm:h-12 sm:w-12 sm:text-2xl',
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      className={`${sizes[size]} z-10 flex items-center justify-center rounded-full bg-white shadow-md transition-all hover:shadow-lg active:scale-95`}
      aria-label={isInFavorites ? 'Удалить из избранного' : 'Добавить в избранное'}
      title={isInFavorites ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <span className={`transition-all ${isInFavorites ? 'scale-110' : 'scale-100 group-hover:scale-110'}`}>
        {isInFavorites ? '❤️' : '🤍'}
      </span>
    </button>
  );
}