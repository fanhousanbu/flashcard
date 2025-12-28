interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: string;
  height?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ 
  progress, 
  label, 
  showPercentage = true,
  color = 'blue',
  height = 'md'
}: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));
  
  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {safeProgress.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} ${heightClasses[height]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
}

