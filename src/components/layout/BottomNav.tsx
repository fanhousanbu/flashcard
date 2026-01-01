import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { QuickStudyMenu } from './QuickStudyMenu';

export function BottomNav() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [lastStudiedDeckId, setLastStudiedDeckId] = useState<string | null>(null);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  useEffect(() => {
    // 从 localStorage 获取最近学习的卡组 ID
    const lastDeckId = localStorage.getItem('lastStudiedDeckId');
    setLastStudiedDeckId(lastDeckId);
  }, []);

  if (!user) return null;

  const handleStartLearning = () => {
    // 检查是否有学习历史
    const historyKey = 'recentStudyDecks';
    const existingHistory = localStorage.getItem(historyKey);
    const history: string[] = existingHistory ? JSON.parse(existingHistory) : [];
    
    if (history.length > 0) {
      // 如果有学习历史，显示快速选择菜单
      setShowQuickMenu(true);
    } else if (lastStudiedDeckId) {
      // 兼容旧逻辑：如果只有单个最近学习的卡组，直接进入
      navigate(`/decks/${lastStudiedDeckId}/study`);
    } else {
      // 如果没有任何历史，跳转到我的卡组页面
      navigate('/dashboard');
    }
  };

  const navItems = [
    {
      path: '/dashboard',
      labelKey: 'nav.myDecks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      path: '/stats',
      labelKey: 'nav.studyStats',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      path: '/marketplace',
      labelKey: 'nav.marketplace',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      path: '/profile',
      labelKey: 'nav.myProfile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
        <div className="grid grid-cols-5 h-16 relative">
          {/* 我的卡组 */}
          {navItems.slice(0, 1).map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}

          {/* 学习统计 */}
          {navItems.slice(1, 2).map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}

          {/* 开始学习 - 中间突出按钮 */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleStartLearning}
              className="absolute -top-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
              aria-label={t('nav.startLearning')}
            >
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </button>
          </div>

          {/* 卡组市场 */}
          {navItems.slice(2, 3).map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}

          {/* 我的 */}
          {navItems.slice(3, 4).map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 快速学习菜单 */}
      <QuickStudyMenu isOpen={showQuickMenu} onClose={() => setShowQuickMenu(false)} />
    </>
  );
}

