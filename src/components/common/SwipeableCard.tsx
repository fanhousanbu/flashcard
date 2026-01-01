import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FlipCard } from './FlipCard';

interface SwipeableCardProps {
  frontContent: ReactNode;
  backContent: ReactNode;
  onDelete: () => void;
  variant?: 'default' | 'compact';
}

export function SwipeableCard({ frontContent, backContent, onDelete, variant = 'default' }: SwipeableCardProps) {
  const { t } = useTranslation();
  const [translateX, setTranslateX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Only allow left swipe
    if (diff < 0) {
      // Limit max swipe distance
      const maxSwipe = -80;
      setTranslateX(Math.max(diff, maxSwipe));
    } else {
      setTranslateX(0);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // If swiped more than 40px, keep showing; otherwise bounce back
    if (translateX < -40) {
      // Keep current position, don't auto-trigger delete
      setTranslateX(translateX);
    } else {
      // Bounce back to original position
      setTranslateX(0);
    }
  };

  // Mouse handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    currentX.current = e.clientX;
    const diff = currentX.current - startX.current;

    // Only allow left swipe
    if (diff < 0) {
      // Limit max swipe distance
      const maxSwipe = -80;
      setTranslateX(Math.max(diff, maxSwipe));
    } else {
      setTranslateX(0);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // If swiped more than 40px, keep showing; otherwise bounce back
    if (translateX < -40) {
      // Keep current position, don't auto-trigger delete
      setTranslateX(translateX);
    } else {
      // Bounce back to original position
      setTranslateX(0);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleting(false);
    setTranslateX(0);
  };

  const handleCancel = () => {
    setIsDeleting(false);
    setTranslateX(0);
  };

  // Calculate delete icon opacity (fade-in effect)
  const iconOpacity = Math.min(1, Math.max(0, -translateX / 40));

  return (
    <div
      ref={containerRef}
      style={{ touchAction: 'pan-y pinch-zoom' }}
    >
      {/* Outer container: provides fixed positioning reference */}
      <div className="relative">
        {/* Delete icon background layer (fixed in place, doesn't move with card) */}
        <div
          className="absolute top-0 bottom-0 right-0 flex items-center justify-center w-16 pointer-events-none z-0"
          style={{
            opacity: iconOpacity,
          }}
        >
          <div className="w-12 h-12 bg-red-500 rounded-full shadow-lg flex items-center justify-center">
            <button
              onClick={handleDelete}
              className="w-full h-full flex items-center justify-center pointer-events-auto"
              type="button"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Card container (for swiping, on top layer) */}
        <div
          className="relative transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing select-none z-10"
          style={{
            transform: `translateX(${translateX}px)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <FlipCard
            frontContent={frontContent}
            backContent={backContent}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
            variant={variant}
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      {isDeleting && (
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xs mx-4 text-center">
            <p className="text-gray-900 dark:text-gray-100 mb-4">{t('deck.deleteConfirm')}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
