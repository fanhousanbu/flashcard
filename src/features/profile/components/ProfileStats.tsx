import { useTranslation } from 'react-i18next';
import { useStudyStats } from '../../study/hooks/useStudyStats';

export function ProfileStats() {
  const { t } = useTranslation();
  const { userStats } = useStudyStats();

  const stats = [
    {
      key: 'cards',
      icon: '📚',
      value: userStats?.totalCards || 0,
      label: t('profile.stats.totalCards'),
    },
    {
      key: 'studied',
      icon: '✅',
      value: userStats?.studiedCards || 0,
      label: t('profile.stats.studiedCards'),
    },
    {
      key: 'reviews',
      icon: '🔄',
      value: userStats?.totalReviews || 0,
      label: t('profile.stats.totalReviews'),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center"
        >
          <div className="text-xl mb-1">{stat.icon}</div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {stat.value}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
