import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../components/layout/AppLayout';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { toast } from '../../hooks/useToast';
import type { StudyMode } from '../../lib/types/study';

export function PreferencesPage() {
  const { t } = useTranslation();
  const { preferences, updatePreferences } = useProfile();
  const [saving, setSaving] = useState(false);

  const handleModeChange = async (mode: StudyMode) => {
    setSaving(true);
    try {
      await updatePreferences({ defaultStudyMode: mode });
      toast.success(t('profile.preferences.saved'));
    } catch (error) {
      toast.error(t('profile.preferences.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDailyGoalChange = async (goal: number) => {
    setSaving(true);
    try {
      await updatePreferences({ dailyGoalCards: goal });
      toast.success(t('profile.preferences.saved'));
    } catch (error) {
      toast.error(t('profile.preferences.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const dailyGoalOptions = [10, 20, 30, 50, 100];

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
            {t('profile.preferences.title')}
          </h1>
        </div>

        {/* Default Study Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('profile.preferences.defaultMode')}
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => handleModeChange('spaced-repetition')}
              className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                preferences?.defaultStudyMode === 'spaced-repetition'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">🧠</span>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {t('profile.preferences.modeSpaced')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('profile.preferences.modeSpacedDesc')}
                </div>
              </div>
              {preferences?.defaultStudyMode === 'spaced-repetition' && (
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <button
              onClick={() => handleModeChange('simple-review')}
              className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                preferences?.defaultStudyMode === 'simple-review'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">📚</span>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {t('profile.preferences.modeSimple')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('profile.preferences.modeSimpleDesc')}
                </div>
              </div>
              {preferences?.defaultStudyMode === 'simple-review' && (
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('profile.preferences.dailyGoal')}
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {dailyGoalOptions.map((goal) => (
              <button
                key={goal}
                onClick={() => handleDailyGoalChange(goal)}
                disabled={saving}
                className={`py-3 rounded-lg font-medium transition-all ${
                  preferences?.dailyGoalCards === goal
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            {t('profile.preferences.dailyGoalDesc')}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
