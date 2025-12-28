import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../components/layout/AppLayout';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { toast } from '../../hooks/useToast';

export function EditProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, updateUsername } = useProfile();
  const [username, setUsername] = useState(profile?.username || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error(t('profile.edit.usernameRequired'));
      return;
    }

    setSaving(true);
    try {
      await updateUsername(username.trim());
      toast.success(t('profile.edit.saveSuccess'));
      navigate('/profile');
    } catch (error) {
      toast.error(t('profile.edit.saveFailed'));
    } finally {
      setSaving(false);
    }
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
            {t('profile.edit.title')}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.edit.username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('profile.edit.usernamePlaceholder')}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={50}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 px-4 py-3 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
