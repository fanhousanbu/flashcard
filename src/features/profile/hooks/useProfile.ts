// @ts-nocheck - Type inference issues with database return types
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as db from '../../../lib/supabase/database';
import type { UserPreferences } from '../../../lib/types/preferences';
import type { StudyMode } from '../../../lib/types/study';

// Map between database format and app format
const toAppStudyMode: Record<string, StudyMode> = {
  'spaced': 'spaced-repetition',
  'simple': 'simple-review',
};

const toDbStudyMode: Record<StudyMode, string> = {
  'spaced-repetition': 'spaced',
  'simple-review': 'simple',
};

export function useProfile() {
  const { user, profile, updateProfile } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user preferences
  useEffect(() => {
    async function loadPreferences() {
      if (!user) {
        setPreferences(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const prefs = await db.getUserPreferences(user.id);
        if (prefs) {
          setPreferences({
            id: prefs.id,
            userId: prefs.user_id,
            defaultStudyMode: toAppStudyMode[prefs.default_study_mode] || 'spaced-repetition',
            dailyGoalCards: prefs.daily_goal_cards,
            createdAt: prefs.created_at,
            updatedAt: prefs.updated_at,
          });
        } else {
          // Create default preferences if not exist
          const newPrefs = await db.upsertUserPreferences(user.id, {
            default_study_mode: 'spaced',
            daily_goal_cards: 20,
          });
          setPreferences({
            id: newPrefs.id,
            userId: newPrefs.user_id,
            defaultStudyMode: toAppStudyMode[newPrefs.default_study_mode] || 'spaced-repetition',
            dailyGoalCards: newPrefs.daily_goal_cards,
            createdAt: newPrefs.created_at,
            updatedAt: newPrefs.updated_at,
          });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const updated = await db.updateUserPreferences(user.id, {
        default_study_mode: updates.defaultStudyMode ? toDbStudyMode[updates.defaultStudyMode] : undefined,
        daily_goal_cards: updates.dailyGoalCards,
      });

      setPreferences({
        id: updated.id,
        userId: updated.user_id,
        defaultStudyMode: toAppStudyMode[updated.default_study_mode] || 'spaced-repetition',
        dailyGoalCards: updated.daily_goal_cards,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      });

      return updated;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }, [user]);

  const updateUsername = useCallback(async (username: string) => {
    if (!user) throw new Error('User not authenticated');

    const updated = await updateProfile({ username });
    return updated;
  }, [user, updateProfile]);

  const updateAvatar = useCallback(async (avatarUrl: string) => {
    if (!user) throw new Error('User not authenticated');

    const updated = await updateProfile({ avatar_url: avatarUrl });
    return updated;
  }, [user, updateProfile]);

  return {
    user,
    profile,
    preferences,
    loading,
    updatePreferences,
    updateUsername,
    updateAvatar,
  };
}
