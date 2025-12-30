import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FavoriteButtonProps {
  isFavorited: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function FavoriteButton({ isFavorited, onToggle, disabled = false }: FavoriteButtonProps) {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`p-2 rounded-full transition-all ${
        isAnimating ? 'scale-110' : ''
      } ${
        isFavorited
          ? 'text-red-500 hover:text-red-600 dark:text-red-400'
          : 'text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isFavorited ? t('marketplace.detail.removeFromFavorites') : t('marketplace.detail.addToFavorites')}
    >
      <svg
        className={`w-6 h-6 ${isFavorited ? 'fill-current' : 'fill-none'}`}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
