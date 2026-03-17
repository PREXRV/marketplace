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
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      className={`${sizes[size]} rounded-full bg-white shadow-md hover:shadow-lg transition-all flex items-center justify-center group z-10`}
      title={isInFavorites ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <span className={`transition-all ${isInFavorites ? 'scale-110' : 'scale-100 group-hover:scale-110'}`}>
        {isInFavorites ? '❤️' : '🤍'}
      </span>
    </button>
  );
}
