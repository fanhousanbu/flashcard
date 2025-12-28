import { useRef, useState, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlipCard } from './FlipCard';
import './FlipCard.css';

interface SwipeableStudyCardProps {
  frontContent: ReactNode;
  backContent: ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
  onNextCard: () => void;
  onPreviousCard: () => void;
  hasNextCard: boolean;
  hasPreviousCard: boolean;
}

const SWIPE_THRESHOLD = 100;
const MAX_SWIPE = 150;

export function SwipeableStudyCard({
  frontContent,
  backContent,
  isFlipped,
  onFlip,
  onNextCard,
  onPreviousCard,
  hasNextCard,
  hasPreviousCard,
}: SwipeableStudyCardProps) {
  const { t } = useTranslation();
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const preventClickRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Trigger haptic feedback
  const triggerHaptic = (pattern: VibrationPattern = 'light') => {
    if ('vibrate' in navigator) {
      switch (pattern) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(30);
          break;
        case 'success':
          navigator.vibrate([10, 50, 10]);
          break;
      }
    }
  };

  // Reset states when card content changes
  useEffect(() => {
    setIsEntering(true);
    setIsExiting(false);
    setExitDirection(null);
    const timer = setTimeout(() => setIsEntering(false), 250);
    return () => clearTimeout(timer);
  }, [frontContent, backContent]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isFlipped) return;
    startX.current = e.touches[0].clientX;
    dragDistanceRef.current = 0;
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsExiting(false);
    preventClickRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || isFlipped) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    dragDistanceRef.current = diff;

    // Limit swipe distance
    const clampedDiff = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff));
    setTranslateX(clampedDiff);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setIsDragging(false);

    // Check if swipe threshold is reached
    if (translateX > SWIPE_THRESHOLD && hasPreviousCard) {
      triggerHaptic('light');
      preventClickRef.current = true;
      setExitDirection('right');
      setIsExiting(true);
      setTimeout(() => {
        onPreviousCard();
      }, 200);
    } else if (translateX < -SWIPE_THRESHOLD && hasNextCard) {
      triggerHaptic('light');
      preventClickRef.current = true;
      setExitDirection('left');
      setIsExiting(true);
      setTimeout(() => {
        onNextCard();
      }, 200);
    } else {
      // Only flip if it was a tap (minimal movement)
      if (!isFlipped && Math.abs(dragDistanceRef.current) < 10) {
        preventClickRef.current = true; // Prevent click event from firing again
        onFlip();
        triggerHaptic('light');
      }
      // Always reset position for non-swipe gestures
      setTranslateX(0);
    }
  };

  // Mouse handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFlipped) return;
    startX.current = e.clientX;
    dragDistanceRef.current = 0;
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsExiting(false);
    preventClickRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || isFlipped) return;

    currentX.current = e.clientX;
    const diff = currentX.current - startX.current;
    dragDistanceRef.current = diff;

    const clampedDiff = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff));
    setTranslateX(clampedDiff);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;

    if (translateX > SWIPE_THRESHOLD && hasPreviousCard) {
      preventClickRef.current = true;
      setExitDirection('right');
      setIsExiting(true);
      setTimeout(() => {
        onPreviousCard();
      }, 200);
    } else if (translateX < -SWIPE_THRESHOLD && hasNextCard) {
      preventClickRef.current = true;
      setExitDirection('left');
      setIsExiting(true);
      setTimeout(() => {
        onNextCard();
      }, 200);
    } else {
      // Always reset position for non-swipe gestures
      setTranslateX(0);
    }
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      handleMouseUp();
    }
  };

  // Handle card click - only flip if not dragging and swipe didn't occur
  const handleCardClick = () => {
    if (!preventClickRef.current && !isDraggingRef.current && Math.abs(dragDistanceRef.current) < 10) {
      onFlip();
      triggerHaptic('light');
    }
    // Reset preventClick flag after a short delay
    setTimeout(() => {
      preventClickRef.current = false;
    }, 100);
  };

  // Calculate parallax offset for background cards
  const parallaxOffset = translateX * 0.3;
  const parallaxScale = 1 - Math.abs(translateX) / 1000;

  // Determine which direction hint to show on background card
  const backgroundHint = translateX < -10 ? 'next' : translateX > 10 ? 'prev' : null;

  return (
    <div className="card-stack-container">
      {/* Card stack wrapper */}
      <div className="card-stack-wrapper">
        {/* Background card for stack effect */}
        {(hasNextCard || hasPreviousCard) && !isEntering && (
          <div
            className="card-background"
            style={{
              transform: `translateX(${parallaxOffset}px) scale(${parallaxScale})`,
              opacity: 0.5 + Math.abs(translateX) / 400,
              transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.25s ease',
            }}
          >
            <div className="card-background-inner">
              <div className="flip-card-face bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl">
                <div className="flip-card-content p-8">
                  <div className="flip-card-label text-gray-400 dark:text-gray-500 text-sm">
                    {backgroundHint === 'next' ? t('study.nextCard') : backgroundHint === 'prev' ? t('study.prevCard') : ''}
                  </div>
                  <div className="flip-card-text text-gray-300 dark:text-gray-600 text-lg">
                    {backgroundHint === 'next' ? '↓' : backgroundHint === 'prev' ? '↑' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main card */}
        <div
          ref={containerRef}
          className={`swipeable-card ${isExiting ? 'card-exit' : ''} ${isEntering ? 'card-enter' : ''}`}
          style={{
            touchAction: isFlipped ? 'auto' : 'pan-y pinch-zoom',
            transform: `translateX(${translateX}px)`,
            transition: isDragging
              ? 'none'
              : isExiting
                ? `transform 0.2s ease-out, opacity 0.2s ease-out`
                : `transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
            opacity: isExiting ? 0 : 1,
          }}
          data-exit-direction={exitDirection}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClick={handleCardClick}
        >
          <FlipCard
            frontContent={frontContent}
            backContent={backContent}
            isFlipped={isFlipped}
            onFlip={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
