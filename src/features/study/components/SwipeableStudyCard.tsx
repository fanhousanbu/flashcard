import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, type PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { StudyCard } from './StudyCard';
import type { StudyCard as StudyCardType } from '../utils/studyCards';

interface SwipeableStudyCardProps {
  card: StudyCardType; 
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onFlip: () => void;
  onRate: (quality: number) => void;
  studyMode: 'simple' | 'simple-review' | 'spaced-repetition' | 'fsrs';
}

export function SwipeableStudyCard({ 
  card, 
  onSwipeLeft, 
  onSwipeRight, 
  onFlip,
  onRate,
  studyMode,
}: SwipeableStudyCardProps) {
  const { t } = useTranslation();
  const x = useMotionValue(0);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Rotation based on x position
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  
  // Opacity of overlays
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  // Haptic feedback state to prevent spamming
  const hasVibrated = useRef(false);

  // Monitor x value for haptic feedback threshold
  useEffect(() => {
    const unsubscribe = x.on("change", (latest) => {
      if (Math.abs(latest) > 100 && !hasVibrated.current) {
         if (typeof navigator !== 'undefined' && navigator.vibrate) {
           navigator.vibrate(10); // Light vibration
           hasVibrated.current = true;
         }
      } else if (Math.abs(latest) < 100 && hasVibrated.current) {
        hasVibrated.current = false;
      }
    });

    return () => unsubscribe();
  }, [x]);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;

    if (info.offset.x > threshold || velocity > 500) {
      // Swipe Right (Like/Easy)
      await controls.start({ x: 500, opacity: 0 });
      onSwipeRight();
    } else if (info.offset.x < -threshold || velocity < -500) {
      // Swipe Left (Nope/Hard)
      await controls.start({ x: -500, opacity: 0 });
      onSwipeLeft();
    } else {
      // Reset
      controls.start({ x: 0, opacity: 1 });
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x, rotate }}
        animate={controls}
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        className="w-full max-h-[600px] cursor-grab active:cursor-grabbing touch-none"
        ref={cardRef}
      >
        {/* The Card Content */}
        <div className="relative w-full h-full">
           <StudyCard
            card={card}
            isFlipped={isFlipped}
            onFlip={() => {
              setIsFlipped(prev => !prev);
              onFlip();
            }}
            onRate={onRate}
            studyMode={studyMode}
          />

           {/* Overlay: Like (Green) */}
           <motion.div 
             style={{ opacity: likeOpacity }}
             className="absolute inset-0 z-20 flex items-center justify-center bg-green-100/30 dark:bg-green-900/30 pointer-events-none rounded-xl border-4 border-green-500"
           >
             <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-2xl font-bold transform -rotate-12 border-2 border-white shadow-lg uppercase">
               {t('study.swipe.know')}
             </div>
           </motion.div>

           {/* Overlay: Nope (Red) */}
           <motion.div 
             style={{ opacity: nopeOpacity }}
             className="absolute inset-0 z-20 flex items-center justify-center bg-red-100/30 dark:bg-red-900/30 pointer-events-none rounded-xl border-4 border-red-500"
           >
             <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-2xl font-bold transform rotate-12 border-2 border-white shadow-lg uppercase">
               {t('study.swipe.forgot')}
             </div>
           </motion.div>
        </div>
      </motion.div>

      {/* Stack Effect Placeholder (cards behind) */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 scale-[0.98] translate-y-3 opacity-50 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full -z-20 scale-[0.96] translate-y-6 opacity-30 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 pointer-events-none"></div>
    </div>
  );
}
