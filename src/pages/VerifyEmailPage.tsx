import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { toast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session) {
          setSuccess(true);
          toast.success(t('auth.verifyEmail.success'));

          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          const errorDescription = searchParams.get('error_description');
          if (errorDescription) {
            throw new Error(errorDescription);
          }

          throw new Error(t('auth.verifyEmail.errorMessage'));
        }
      } catch (err: any) {
        console.error('Email verification error:', err);
        setError(err.message || t('auth.verifyEmail.error'));
        toast.error(err.message || t('auth.verifyEmail.error'));
      } finally {
        setVerifying(false);
      }
    };

    handleEmailVerification();
  }, [navigate, searchParams, t]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            {t('auth.verifyEmail.verifying')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-md bg-green-50 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-12 w-12 text-green-400"
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
                <h3 className="text-2xl font-medium text-green-800">
                  {t('auth.verifyEmail.success')}
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    {t('auth.verifyEmail.successMessage')}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm font-medium text-green-700 hover:text-green-600 underline"
                  >
                    {t('auth.verifyEmail.resendButton')} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-md bg-red-50 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-12 w-12 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-2xl font-medium text-red-800">
                  {t('auth.verifyEmail.error')}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <p className="mt-2">
                    {t('auth.verifyEmail.possibleReasons')}:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>{t('auth.verifyEmail.reason1')}</li>
                    <li>{t('auth.verifyEmail.reason2')}</li>
                    <li>{t('auth.verifyEmail.reason3')}</li>
                  </ul>
                </div>
                <div className="mt-4 space-x-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sm font-medium text-red-700 hover:text-red-600 underline"
                  >
                    {t('auth.login.button')}
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="text-sm font-medium text-red-700 hover:text-red-600 underline"
                  >
                    {t('auth.signup.button')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
