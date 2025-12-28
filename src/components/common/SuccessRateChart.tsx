import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

interface SuccessRateChartProps {
  data: Array<{ date: string; successRate: number }>;
}

// Mobile-friendly success rate view
function MobileSuccessRateView({ data }: { data: Array<{ date: string; successRate: number }> }) {
  const { t, i18n } = useTranslation();

  const stats = useMemo(() => {
    if (data.length === 0) return { avg: 0, max: 0, min: 0, trend: 'stable' as const };
    const rates = data.map(d => d.successRate);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    const max = Math.max(...rates);
    const min = Math.min(...rates);
    const first = rates[0];
    const last = rates[rates.length - 1];
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (last - first > 10) trend = 'up';
    else if (first - last > 10) trend = 'down';
    return { avg, max, min, trend };
  }, [data]);

  const trendConfig = {
    up: { icon: '📈', text: t('stats.trendingUp'), color: 'text-green-600 dark:text-green-400' },
    down: { icon: '📉', text: t('stats.trendingDown'), color: 'text-red-600 dark:text-red-400' },
    stable: { icon: '➡️', text: t('stats.stable'), color: 'text-gray-600 dark:text-gray-400' },
  };

  return (
    <div className="space-y-3">
      {/* Main stat card */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('stats.successRateCard')}</div>
            <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">{stats.avg.toFixed(1)}%</div>
          </div>
          <div className="text-right">
            <div className="text-2xl">{trendConfig[stats.trend].icon}</div>
            <div className={`text-xs ${trendConfig[stats.trend].color}`}>{trendConfig[stats.trend].text}</div>
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('stats.highest')}</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats.max.toFixed(1)}%</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('stats.lowest')}</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">{stats.min.toFixed(1)}%</div>
        </div>
      </div>

      {/* Mini bar chart for last 7 days */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('stats.successRateChart')}</div>
        <div className="flex items-end justify-between gap-1 h-16">
          {data.slice(-7).map((d, i) => {
            const height = d.successRate;
            const isToday = i === data.slice(-7).length - 1;
            const getColor = () => {
              if (d.successRate >= 80) return isToday ? 'bg-green-500' : 'bg-green-300 dark:bg-green-700';
              if (d.successRate >= 60) return isToday ? 'bg-yellow-500' : 'bg-yellow-300 dark:bg-yellow-700';
              return isToday ? 'bg-red-500' : 'bg-red-300 dark:bg-red-700';
            };
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all ${getColor()}`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${d.successRate}%`}
                />
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  {new Date(d.date).toLocaleDateString(i18n.language, { day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-500 dark:text-gray-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

export function SuccessRateChart({ data }: SuccessRateChartProps) {
  const { t, i18n } = useTranslation();

  // Format date display
  const formattedData = data.map(item => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }),
    successRate: Number(item.successRate.toFixed(1)),
  }));

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden">
        <MobileSuccessRateView data={data} />
      </div>

      {/* Desktop view */}
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
              domain={[0, 100]}
              className="text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
              label={{ value: t('stats.successRateLabel'), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tw-bg-white)',
                border: '1px solid var(--tw-border-gray-200)',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: 'var(--tw-text-gray-900)' }}
              formatter={(value: number) => [`${value}%`, t('stats.successRateCard')]}
            />
            <Line
              type="monotone"
              dataKey="successRate"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

