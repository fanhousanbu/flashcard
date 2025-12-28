import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

interface StudyTrendChartProps {
  data: Array<{ date: string; cards: number; sessions: number }>;
}

// Mobile-friendly stat cards view
function MobileTrendView({ data }: { data: Array<{ date: string; cards: number; sessions: number }> }) {
  const { t, i18n } = useTranslation();

  const stats = useMemo(() => {
    const totalCards = data.reduce((sum, d) => sum + d.cards, 0);
    const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
    const avgCards = data.length > 0 ? Math.round(totalCards / data.length) : 0;
    const maxCards = Math.max(...data.map(d => d.cards), 0);
    const maxDay = data.find(d => d.cards === maxCards);

    return {
      totalCards,
      totalSessions,
      avgCards,
      maxCards,
      maxDay: maxDay ? new Date(maxDay.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }) : '-',
    };
  }, [data, i18n.language]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <div className="text-2xl mb-1">📊</div>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCards}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{t('stats.cardsStudied')}</div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
        <div className="text-2xl mb-1">🎯</div>
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgCards}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{t('stats.cardsStudied')}/{t('stats.timeRange.day')}</div>
      </div>
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
        <div className="text-2xl mb-1">🔥</div>
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.maxCards}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{stats.maxDay}</div>
      </div>
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
        <div className="text-2xl mb-1">📝</div>
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalSessions}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{t('stats.studySessions')}</div>
      </div>
      {/* Mini bar chart for last 7 days */}
      <div className="col-span-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('stats.trendChart')}</div>
        <div className="flex items-end justify-between gap-1 h-16">
          {data.slice(-7).map((d, i) => {
            const maxVal = Math.max(...data.map(x => x.cards), 1);
            const height = (d.cards / maxVal) * 100;
            const isToday = i === data.slice(-7).length - 1;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all ${isToday ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-700'}`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${d.cards} ${t('stats.cardsStudied')}`}
                />
                <div className={`text-[10px] text-gray-500 dark:text-gray-400 ${isToday ? 'font-semibold' : ''}`}>
                  {new Date(d.date).toLocaleDateString(i18n.language, { day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function StudyTrendChart({ data }: StudyTrendChartProps) {
  const { t, i18n } = useTranslation();

  // Format date display
  const formattedData = data.map(item => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }),
  }));

  return (
    <>
      {/* Mobile view: stat cards + mini chart */}
      <div className="md:hidden">
        <MobileTrendView data={data} />
      </div>

      {/* Desktop view: full line chart */}
      <div className="hidden md:block">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="dateLabel"
              className="text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tw-bg-white)',
                border: '1px solid var(--tw-border-gray-200)',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: 'var(--tw-text-gray-900)' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cards"
              stroke="#3B82F6"
              strokeWidth={2}
              name={t('stats.cardsStudied')}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="#10B981"
              strokeWidth={2}
              name={t('stats.studySessions')}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

