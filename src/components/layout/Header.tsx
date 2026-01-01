import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { SearchModal } from '../common/SearchModal';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  // Keyboard shortcut support (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (user) {
          setShowSearch(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b dark:bg-gray-800 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              FlashCard
            </Link>
            {user && (
              <nav className="hidden md:flex ml-10 space-x-8">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
                >
                  {t('nav.myDecks')}
                </Link>
                <Link
                  to="/stats"
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
                >
                  {t('nav.studyStats')}
                </Link>
                <Link
                  to="/tags"
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
                >
                  {t('nav.tagManagement')}
                </Link>
                <Link
                  to="/browser"
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
                >
                  {t('nav.cardBrowser') || 'Browser'}
                </Link>
                <Link
                  to="/marketplace"
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
                >
                  {t('nav.marketplace')}
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Search button */}
            {user && (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={t('nav.searchPlaceholder')}
                title={t('nav.searchPlaceholder')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={t('common.theme')}
            >
              {effectiveTheme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Language switcher */}
            <LanguageSwitcher />

            {user ? (
              <>
                <span className="hidden md:inline text-sm text-gray-700 dark:text-gray-300">
                  {profile?.username || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <span className="md:hidden">{t('nav.logout')}</span>
                  <span className="hidden md:inline">{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search modal */}
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </header>
  );
}

