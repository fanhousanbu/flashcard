import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface MenuItem {
  to: string;
  icon: string;
  labelKey: string;
  description?: string;
}

const menuItems: MenuItem[] = [
  {
    to: '/profile/edit',
    icon: '👤',
    labelKey: 'profile.menu.personalProfile',
  },
  {
    to: '/profile/account',
    icon: '🔐',
    labelKey: 'profile.menu.accountSettings',
  },
  {
    to: '/profile/preferences',
    icon: '🎯',
    labelKey: 'profile.menu.studyPreferences',
  },
  {
    to: '/profile/settings',
    icon: '⚙️',
    labelKey: 'profile.menu.appSettings',
  },
];

interface ProfileMenuProps {
  onLogout?: () => void;
}

export function ProfileMenu({ onLogout }: ProfileMenuProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
      {menuItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <span className="text-xl">{item.icon}</span>
          <span className="flex-1 text-gray-900 dark:text-gray-100">
            {t(item.labelKey)}
          </span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ))}

      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
      >
        <span className="text-xl">🚪</span>
        <span className="flex-1 text-left">{t('profile.menu.logout')}</span>
      </button>
    </div>
  );
}
