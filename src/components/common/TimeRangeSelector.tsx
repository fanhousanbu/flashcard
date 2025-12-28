import { useTranslation } from 'react-i18next';

interface TimeRangeSelectorProps {
  value: 'today' | 'week' | 'month' | 'all';
  onChange: (value: 'today' | 'week' | 'month' | 'all') => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const { t } = useTranslation();
  const options = [
    { value: 'today' as const, labelKey: 'stats.timeRange.today', shortKey: 'stats.timeRange.todayShort' },
    { value: 'week' as const, labelKey: 'stats.timeRange.week', shortKey: 'stats.timeRange.weekShort' },
    { value: 'month' as const, labelKey: 'stats.timeRange.month', shortKey: 'stats.timeRange.monthShort' },
    { value: 'all' as const, labelKey: 'stats.timeRange.all', shortKey: 'stats.timeRange.allShort' },
  ];

  return (
    <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
            value === option.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <span className="hidden sm:inline">{t(option.labelKey)}</span>
          <span className="sm:hidden">{t(option.shortKey)}</span>
        </button>
      ))}
    </div>
  );
}

