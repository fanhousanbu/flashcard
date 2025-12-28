import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../../../hooks/useToast';
import { resendVerificationEmail } from '../../../lib/supabase/auth';
import { useTranslation } from 'react-i18next';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResendLink, setShowResendLink] = useState(false);
  const [resending, setResending] = useState(false);
  const { signIn, loading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await signIn(email, password);
      toast.success(t('toasts.success'));
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.message || t('errors.loginFailed');

      if (errorMessage.includes('Email not confirmed') ||
          errorMessage.includes('email not confirmed')) {
        toast.error(t('auth.login.emailNotVerifiedMessage'));
        setShowResendLink(true);
      } else {
        toast.error(errorMessage);
        setShowResendLink(false);
      }
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error(t('auth.login.enterEmailFirst'));
      return;
    }

    try {
      setResending(true);
      await resendVerificationEmail(email);
      toast.success(t('auth.login.resendEmail'));
      setShowResendLink(false);
    } catch (error: any) {
      toast.error(error.message || t('errors.serverError'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.login.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.login.subtitle')}{' '}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t('auth.login.subtitleLink')}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.login.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.login.email')}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.login.password')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? t('auth.login.buttonLoading') : t('auth.login.button')}
            </button>
          </div>

          {showResendLink && (
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {t('auth.login.emailNotVerified')}
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{t('auth.login.emailNotVerifiedMessage')}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={resending}
                      className="text-sm font-medium text-yellow-800 hover:text-yellow-700 underline disabled:opacity-50"
                    >
                      {resending ? t('auth.login.resendEmailLoading') : t('auth.login.resendEmail')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
