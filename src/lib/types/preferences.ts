import type { StudyMode } from './study';

export type UserPreferences = {
  id: string;
  userId: string;
  defaultStudyMode: StudyMode;
  dailyGoalCards: number;
  createdAt: string;
  updatedAt: string;
};

export type UserPreferencesUpdate = Pick<UserPreferences, 'defaultStudyMode' | 'dailyGoalCards'>;
