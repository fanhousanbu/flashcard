import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface ActivityHeatmapProps {
  data: Array<{ date: string; count: number }>;
  startDate: Date;
  endDate: Date;
}

// Mobile-friendly activity view
function MobileActivityView({ data, startDate, endDate }: ActivityHeatmapProps) {
  const { t, i18n } = useTranslation();

  const stats = useMemo(() => {
    if (data.length === 0) {
      return {
        totalDays: 0,
        activeDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalCards: 0,
        avgPerActiveDay: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak (consecutive days ending today or most recent)
    let currentStreak = 0;
    const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const item of sortedData) {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === currentStreak && item.count > 0) {
        currentStreak++;
      } else if (daysDiff > currentStreak) {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const dateRange: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dateRange.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const activityMap = new Map<string, number>();
    data.forEach(item => activityMap.set(item.date, item.count));

    for (const date of dateRange) {
      const dateStr = date.toISOString().split('T')[0];
      const count = activityMap.get(dateStr) || 0;
      if (count > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    const activeDays = data.filter(d => d.count > 0).length;
    const totalCards = data.reduce((sum, d) => sum + d.count, 0);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const avgPerActiveDay = activeDays > 0 ? Math.round(totalCards / activeDays) : 0;

    return {
      totalDays,
      activeDays,
      currentStreak,
      longestStreak,
      totalCards,
      avgPerActiveDay,
    };
  }, [data, startDate, endDate]);

  // Get recent activity for list view (last 7 days with activity)
  const recentActivity = useMemo(() => {
    return [...data]
      .filter(d => d.count > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(d => ({
        ...d,
        dateLabel: new Date(d.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }),
      }));
  }, [data, i18n.language]);

  return (
    <div className="space-y-3">
      {/* Streak stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-3">
          <div className="text-xl mb-1">🔥</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.currentStreak}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{t('stats.currentStreak')}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3">
          <div className="text-xl mb-1">🏆</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.longestStreak}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{t('stats.longestStreak')}</div>
        </div>
      </div>

      {/* Activity summary */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.activeDays}</div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400">{t('stats.activeDays')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.totalCards}</div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400">{t('stats.totalCards')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.avgPerActiveDay}</div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400">{t('stats.avgPerDay')}</div>
          </div>
        </div>
      </div>

      {/* Recent activity list */}
      {recentActivity.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('stats.recentActivity')}</div>
          <div className="space-y-2">
            {recentActivity.map((item) => (
              <div key={item.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.dateLabel}</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {item.count} {t('stats.cardsStudied')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ActivityHeatmap({ data, startDate, endDate }: ActivityHeatmapProps) {
  const { t, i18n } = useTranslation();

  // Create date to activity count mapping
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(item => {
      map.set(item.date, item.count);
    });
    return map;
  }, [data]);

  // Calculate max activity count (for color intensity)
  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  // Generate date range
  const dates = useMemo(() => {
    const result: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      result.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, [startDate, endDate]);

  // Get color intensity
  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  // Group by week
  const weeks = useMemo(() => {
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    dates.forEach((date, index) => {
      const dayOfWeek = date.getDay();

      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push(date);

      // Add current week on last day
      if (index === dates.length - 1) {
        weeks.push(currentWeek);
      }
    });

    return weeks;
  }, [dates]);

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden">
        <MobileActivityView data={data} startDate={startDate} endDate={endDate} />
      </div>

      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const count = activityMap.get(dateStr) || 0;
                const intensity = getIntensity(count);

                const colorClasses = [
                  'bg-gray-100 dark:bg-gray-800', // 0
                  'bg-green-200 dark:bg-green-900', // 1
                  'bg-green-400 dark:bg-green-700', // 2
                  'bg-green-600 dark:bg-green-500', // 3
                  'bg-green-800 dark:bg-green-300', // 4
                ];

                return (
                  <div
                    key={dateStr}
                    className={`w-3 h-3 rounded ${colorClasses[intensity]}`}
                    title={`${date.toLocaleDateString(i18n.language)}: ${t('stats.cardsTooltip', { count })}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{t('stats.heatmapLess')}</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-900" />
            <div className="w-3 h-3 rounded bg-green-400 dark:bg-green-700" />
            <div className="w-3 h-3 rounded bg-green-600 dark:bg-green-500" />
            <div className="w-3 h-3 rounded bg-green-800 dark:bg-green-300" />
          </div>
          <span>{t('stats.heatmapMore')}</span>
        </div>
      </div>
    </>
  );
}

