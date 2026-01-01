import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDecks } from '../../features/decks/hooks/useDecks';
import type { Deck } from '../../lib/types/deck';

interface QuickStudyMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickStudyMenu({ isOpen, onClose }: QuickStudyMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { decks, loadDecks } = useDecks();
  const [recentDecks, setRecentDecks] = useState<Deck[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadDecks();
      
      // 从 localStorage 获取最近学习的卡组ID列表
      const historyKey = 'recentStudyDecks';
      const existingHistory = localStorage.getItem(historyKey);
      const history: string[] = existingHistory ? JSON.parse(existingHistory) : [];
      
      // 根据ID列表筛选出对应的卡组
      const recent = history
        .map(id => decks.find(deck => deck.id === id))
        .filter((deck): deck is Deck => deck !== undefined);
      
      setRecentDecks(recent);
    }
  }, [isOpen, decks, loadDecks]);

  const handleDeckClick = (deckId: string) => {
    navigate(`/decks/${deckId}/study`);
    onClose();
  };

  const handleViewAllDecks = () => {
    navigate('/dashboard');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* 菜单内容 */}
      <div className="fixed bottom-20 left-0 right-0 z-50 md:hidden px-4 pb-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* 标题 */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('nav.recentDecks', '最近学习')}
            </h3>
          </div>

          {/* 卡组列表 */}
          <div className="max-h-80 overflow-y-auto">
            {recentDecks.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentDecks.map((deck, index) => (
                  <button
                    key={deck.id}
                    onClick={() => handleDeckClick(deck.id)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-3 group"
                  >
                    {/* 序号 */}
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    
                    {/* 卡组信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {deck.name}
                      </div>
                      {deck.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {deck.description}
                        </div>
                      )}
                    </div>

                    {/* 箭头图标 */}
                    <svg 
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('nav.noRecentDecks', '还没有学习记录')}
                </p>
              </div>
            )}
          </div>

          {/* 底部操作 */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={handleViewAllDecks}
              className="w-full px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {t('nav.viewAllDecks', '查看所有卡组')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
