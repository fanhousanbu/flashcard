import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import * as db from '../../../lib/supabase/database';
import type { UserStats, DeckStats, StudySessionWithDeck } from '../../../lib/types/study';

export type TimeRange = 'today' | 'week' | 'month' | 'all';

export function useStudyStats() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [deckStats, setDeckStats] = useState<Map<string, DeckStats>>(new Map());
  const [recentSessions, setRecentSessions] = useState<StudySessionWithDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [trendData, setTrendData] = useState<Array<{ date: string; cards: number; sessions: number }>>([]);
  const [successRateData, setSuccessRateData] = useState<Array<{ date: string; successRate: number }>>([]);
  const [activityData, setActivityData] = useState<Array<{ date: string; count: number }>>([]);

  // Calculate date range
  const getDateRange = useCallback((range: TimeRange) => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    
    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
        startDate.setFullYear(2020, 0, 1); // Set a very early date
        break;
    }
    
    return { startDate, endDate };
  }, []);

  const loadStats = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Load overall user stats
      const stats = await db.getUserStudyStats(userId);
      setUserStats(stats);

      // Load recent study sessions
      const sessions = await db.getRecentStudySessions(userId, 10);
      setRecentSessions(sessions as StudySessionWithDeck[]);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadTrendData = useCallback(async (range: TimeRange) => {
    if (!userId) return;
    
    try {
      const { startDate, endDate } = getDateRange(range);
      const trend = await db.getStudyTrendData(userId, startDate, endDate);
      setTrendData(trend);
      
      const successRate = await db.getSuccessRateTrendData(userId, startDate, endDate);
      setSuccessRateData(successRate);
      
      const activity = await db.getStudyActivityData(userId, startDate, endDate);
      setActivityData(activity);
    } catch (error) {
      console.error('Failed to load trend data:', error);
    }
  }, [userId, getDateRange]);

  useEffect(() => {
    if (userId) {
      loadStats();
      loadTrendData(timeRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadTrendData(timeRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const loadDeckStats = useCallback(async (deckId: string) => {
    if (!userId) return;
    
    try {
      const stats = await db.getDeckStudyStats(userId, deckId);
      setDeckStats(prev => new Map(prev).set(deckId, stats));
    } catch (error) {
      console.error('Failed to load deck stats:', error);
    }
  }, [userId]);

  return {
    userStats,
    deckStats,
    recentSessions,
    loading,
    loadStats,
    loadDeckStats,
    timeRange,
    setTimeRange,
    trendData,
    successRateData,
    activityData,
    getDateRange,
  };
}

