import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { Loading } from '../components/common/Loading';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { SessionCard } from '../components/common/SessionCard';
import { StudyTrendChart } from '../components/common/StudyTrendChart';
import { SuccessRateChart } from '../components/common/SuccessRateChart';
import { ActivityHeatmap } from '../components/common/ActivityHeatmap';
import { TimeRangeSelector } from '../components/common/TimeRangeSelector';
import { useStudyStats } from '../features/study/hooks/useStudyStats';
import { useDecks } from '../features/decks/hooks/useDecks';

export function StatsPage() {
  const { t } = useTranslation();
  const {
    userStats,
    recentSessions,
    loading: statsLoading,
    loadDeckStats,
    deckStats,
    timeRange,
    setTimeRange,
    trendData,
    successRateData,
    activityData,
    getDateRange,
  } = useStudyStats();
  const { decks, loading: decksLoading, loadDecks } = useDecks();
  const loadedDeckStatsRef = useRef(false);

  useEffect(() => {
    loadDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Load stats for each deck - use ref to ensure it only runs once
    if (decks.length > 0 && !loadedDeckStatsRef.current) {
      loadedDeckStatsRef.current = true;
      decks.forEach(deck => {
        loadDeckStats(deck.id);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decks.length]);

  if (statsLoading || decksLoading) {
    return <Loading />;
  }

  // Calculate overall progress
  const overallProgress = userStats && userStats.totalCards > 0
    ? (userStats.studiedCards / userStats.totalCards) * 100
    : 0;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('stats.title')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('stats.viewProgress')}</p>
        </div>

        {userStats && userStats.totalCards > 0 ? (
          <>
            {/* Overall stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title={t('stats.totalCards')}
                value={userStats.totalCards}
                subtitle={t('stats.allDecks')}
                color="blue"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
              />
              <StatCard
                title={t('stats.studied')}
                value={userStats.studiedCards}
                subtitle={t('stats.completed', { percent: overallProgress.toFixed(0) })}
                color="green"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatCard
                title={t('stats.totalReviews')}
                value={userStats.totalReviews}
                subtitle={t('stats.cumulativeReviews')}
                color="purple"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              />
              <StatCard
                title={t('stats.successRateCard')}
                value={`${userStats.successRate.toFixed(1)}%`}
                subtitle={t('stats.correctOutOfTotal', {
                  correct: userStats.correctReviews,
                  total: userStats.totalReviews
                })}
                color="orange"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />
            </div>

            {/* Overall learning progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('stats.overallProgress')}</h2>
              <ProgressBar
                progress={overallProgress}
                label={t('stats.cardsCount', { count: `${userStats.studiedCards} / ${userStats.totalCards}` })}
                showPercentage
                color="blue"
                height="lg"
              />
            </div>

            {/* Time range selector */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-8">
              <div className="flex justify-end mb-4">
                <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
              </div>

              {/* Learning trend chart */}
              {trendData.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('stats.trendChart')}</h3>
                  <StudyTrendChart data={trendData} />
                </div>
              )}

              {/* Success rate curve */}
              {successRateData.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('stats.successRateChart')}</h3>
                  <SuccessRateChart data={successRateData} />
                </div>
              )}

              {/* Learning activity heatmap */}
              {activityData.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('stats.activityChart')}</h3>
                  <ActivityHeatmap
                    data={activityData}
                    startDate={getDateRange(timeRange).startDate}
                    endDate={getDateRange(timeRange).endDate}
                  />
                </div>
              )}

              {trendData.length === 0 && successRateData.length === 0 && activityData.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t('stats.noDataInRange')}
                </div>
              )}
            </div>

            {/* Deck learning progress */}
            {decks.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('stats.deckStats')}</h2>
                <div className="space-y-6">
                  {decks.map(deck => {
                    const stats = deckStats.get(deck.id);
                    if (!stats) return null;

                    const progress = stats.totalCards > 0
                      ? (stats.studiedCards / stats.totalCards) * 100
                      : 0;

                    return (
                      <div key={deck.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/decks/${deck.id}`}
                            className="text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {deck.name}
                          </Link>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {stats.studiedCards}/{stats.totalCards}
                            </span>
                            {stats.totalReviews > 0 && (
                              <span className="text-gray-600 dark:text-gray-400">
                                {t('stats.successRateCard')}: {stats.successRate.toFixed(0)}%
                              </span>
                            )}
                            <Link
                              to={`/decks/${deck.id}/study`}
                              className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                              {t('stats.studyDeck')}
                            </Link>
                          </div>
                        </div>
                        <ProgressBar
                          progress={progress}
                          showPercentage={false}
                          color="green"
                          height="md"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent study sessions */}
            {recentSessions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('stats.recentSessions')}</h2>
                <div className="space-y-3">
                  {recentSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // Empty state
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('stats.noStudyData')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('stats.startLearning')}</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('stats.createDeckToStart')}
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
