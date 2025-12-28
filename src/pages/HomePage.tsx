import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('home.subtitle')}
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            {t('home.description')}
          </p>
          <div className="flex justify-center space-x-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                {t('home.goToDashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  {t('home.getStarted')}
                </Link>
                <Link
                  to="/login"
                  className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  {t('home.login')}
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2">{t('home.feature1.title')}</h3>
            <p className="text-gray-600">
              {t('home.feature1.description')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">{t('home.feature2.title')}</h3>
            <p className="text-gray-600">
              {t('home.feature2.description')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">✏️</div>
            <h3 className="text-xl font-bold mb-2">{t('home.feature3.title')}</h3>
            <p className="text-gray-600">
              {t('home.feature3.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

