import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../../../hooks/useToast';
import { useTranslation } from 'react-i18next';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const { signUp, loading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error(t('errors.passwordTooShort'));
      return;
    }

    try {
      const result = await signUp(email, password, username);

      if (result.session) {
        toast.success(t('auth.signup.success'));
        navigate('/dashboard');
      } else {
        setShowVerificationMessage(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.signupFailed');
      toast.error(errorMessage);
    }
  };

  if (showVerificationMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-md bg-green-50 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">
                  {t('auth.signup.title')}
                </h3>
                <div className="mt-2 text-sm text-green-700 space-y-2">
                  <p>
                    {t('auth.signup.emailSent', { email: `<span class="font-semibold">${email}</span>` })}
                  </p>
                  <p>
                    {t('auth.signup.emailInstructions')}
                  </p>
                  <p className="text-xs text-green-600 mt-3">
                    💡 {t('auth.signup.spamFolderHint')}
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-green-700 hover:text-green-600"
                  >
                    {t('auth.signup.backToLogin')} →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.signup.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.signup.subtitle')}{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t('auth.signup.subtitleLink')}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                {t('auth.signup.username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.signup.username')}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.signup.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.signup.email')}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.signup.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.signup.confirmPassword')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? t('auth.signup.buttonLoading') : t('auth.signup.button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
