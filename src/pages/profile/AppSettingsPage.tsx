import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../components/layout/AppLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation as useI18n } from 'react-i18next';

export function AppSettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { i18n } = useI18n();

  const themes = [
    { key: 'light' as const, icon: '☀️', label: t('profile.settings.themeLight') },
    { key: 'dark' as const, icon: '🌙', label: t('profile.settings.themeDark') },
    { key: 'system' as const, icon: '💻', label: t('profile.settings.themeAuto') },
  ];

  const languages = [
    { key: 'zh-CN', label: '简体中文' },
    { key: 'en', label: 'English' },
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleLanguageChange = async (lang: string) => {
    await i18n.changeLanguage(lang);
    window.localStorage.setItem('i18nextLng', lang);
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/profile"
            className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('profile.settings.title')}
          </h1>
        </div>

        {/* Theme Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('profile.settings.theme')}
          </h2>
          <div className="space-y-2">
            {themes.map((themeOption) => (
              <button
                key={themeOption.key}
                onClick={() => handleThemeChange(themeOption.key)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  theme === themeOption.key
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-2xl">{themeOption.icon}</span>
                <span className="flex-1 text-left font-medium text-gray-900 dark:text-gray-100">
                  {themeOption.label}
                </span>
                {theme === themeOption.key && (
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('profile.settings.language')}
          </h2>
          <div className="space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.key}
                onClick={() => handleLanguageChange(lang.key)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  i18n.language === lang.key
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-xl">🌐</span>
                <span className="flex-1 text-left font-medium text-gray-900 dark:text-gray-100">
                  {lang.label}
                </span>
                {i18n.language === lang.key && (
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
