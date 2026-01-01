import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDecks } from '../features/decks/hooks/useDecks';
import { Loading } from '../components/common/Loading';
import { toast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/hooks/useAuth';
import {
  Plus,
  Search,
  Settings,
  LayoutGrid,
  BookOpen,
  BarChart2,
  User,
  MoreHorizontal,
  Flame,
  Zap,
  Star,
  ChevronRight,
  Bell,
  X,
} from 'lucide-react';

export function DashboardPage() {
  const { decks, loading, loadDecks, createDeck, deleteDeck } = useDecks();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('decks');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  useEffect(() => {
    loadDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeck(deckName, deckDescription);
      toast.success(t('dashboard.createSuccess'));
      setShowCreateModal(false);
      setDeckName('');
      setDeckDescription('');
    } catch (error) {
      toast.error(t('dashboard.createFailed'));
    }
  };

  const handleDeleteDeck = async (deckId: string, deckName: string) => {
    if (!confirm(t('dashboard.deleteConfirm', { name: deckName }))) return;
    try {
      await deleteDeck(deckId);
      toast.success(t('dashboard.deleteSuccess'));
    } catch (error) {
      toast.error(t('dashboard.deleteFailed'));
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning');
    if (hour < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  // Get username from user email or profile
  const getUsername = () => {
    if (!user) return '';
    return user.email?.split('@')[0] || 'User';
  };

  // Filter decks based on search and filter
  const filteredDecks = decks.filter(deck => {
    const matchesSearch = searchQuery === '' || 
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // For now, show all decks regardless of filter
    // You can implement favorite/due logic later
    return matchesSearch;
  });

  // Calculate deck colors based on index
  const getDeckColor = (index: number) => {
    const colors = [
      { gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200', icon: '📚' },
      { gradient: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-100', icon: '⚛️' },
      { gradient: 'from-rose-400 to-red-500', shadow: 'shadow-rose-100', icon: '🎯' },
      { gradient: 'from-green-400 to-emerald-500', shadow: 'shadow-green-100', icon: '🌱' },
      { gradient: 'from-purple-400 to-pink-500', shadow: 'shadow-purple-100', icon: '✨' },
      { gradient: 'from-orange-400 to-red-500', shadow: 'shadow-orange-100', icon: '🔥' },
    ];
    return colors[index % colors.length];
  };

  // Format date
  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading && decks.length === 0) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] dark:bg-gray-900 text-slate-900 dark:text-gray-100 font-sans max-w-md mx-auto overflow-hidden relative">
      {/* Header: Personalized Welcome */}
      <header className="px-6 pt-10 pb-6 bg-white dark:bg-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-slate-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">
              {getFormattedDate()}
            </h2>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-gray-100">
              {getGreeting()}, {getUsername()} 👋
            </h1>
          </div>
          <div className="flex gap-1.5">
            <button className="relative p-2 bg-slate-50 dark:bg-gray-700 rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
            </button>
            <Link 
              to="/settings"
              className="p-2 bg-slate-50 dark:bg-gray-700 rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Settings size={18} />
            </Link>
          </div>
        </div>

        {/* Daily Goal Progress Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-gray-700 dark:to-gray-800 rounded-3xl p-5 text-white shadow-lg shadow-slate-200 dark:shadow-gray-900">
          <div className="relative z-10 flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-orange-400 mb-0.5">
                <Flame size={14} fill="currentColor" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t('dashboard.dailyGoal')}
                </span>
              </div>
              <p className="text-lg font-bold tracking-tight">
                {decks.length} {t('dashboard.decksTotal')}
              </p>
              <p className="text-slate-400 text-[11px]">
                {t('dashboard.keepLearning')}
              </p>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <BookOpen size={28} className="text-blue-400" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="px-6 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('dashboard.searchPlaceholder')}
            className="w-full bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-xl py-2.5 pl-11 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-blue-500/10 transition-all outline-none text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: t('dashboard.filter.all'), icon: <LayoutGrid size={13} /> },
            { id: 'due', label: t('dashboard.filter.due'), icon: <Zap size={13} /> },
            { id: 'fav', label: t('dashboard.filter.favorite'), icon: <Star size={13} /> },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === filterOption.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                  : 'bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400 border border-slate-100 dark:border-gray-700 hover:border-slate-200 dark:hover:border-gray-600'
              }`}
            >
              {filterOption.icon}
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deck List */}
      <main className="flex-1 overflow-y-auto px-6 pb-28 space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-slate-800 dark:text-gray-200 text-sm">
            {t('dashboard.myDecks')}
          </h3>
          <span className="text-slate-500 dark:text-gray-400 text-[11px] font-bold">
            {filteredDecks.length} {t('dashboard.decks')}
          </span>
        </div>

        {filteredDecks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? t('dashboard.noResults') : t('dashboard.noDecks')}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                {t('dashboard.createDeck')}
              </button>
            )}
          </div>
        ) : (
          filteredDecks.map((deck, index) => {
            const colorScheme = getDeckColor(index);
            return (
              <div
                key={deck.id}
                className="group relative bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-slate-50 dark:border-gray-700 hover:shadow-md transition-all duration-300 active:scale-[0.99]"
              >
                <div className="flex gap-3.5 mb-3.5">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${colorScheme.gradient} rounded-xl flex items-center justify-center text-2xl shadow-md ${colorScheme.shadow}`}
                  >
                    {colorScheme.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                          {deck.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-tight">
                            {deck.description || t('dashboard.noDescription')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDeck(deck.id, deck.name)}
                        className="p-1 text-slate-300 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/80 dark:bg-gray-700/50 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Link
                      to={`/decks/${deck.id}`}
                      className="bg-white dark:bg-gray-600 text-slate-700 dark:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-500 text-xs font-medium transition-all"
                    >
                      {t('dashboard.view')}
                    </Link>
                    <Link
                      to={`/decks/${deck.id}/study`}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-xs font-medium transition-all"
                    >
                      {t('dashboard.study')}
                    </Link>
                  </div>
                  <button
                    onClick={() => navigate(`/decks/${deck.id}`)}
                    className="bg-slate-900 dark:bg-gray-800 text-white p-2 rounded-lg hover:bg-slate-800 dark:hover:bg-gray-700 active:scale-95 transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-4 left-6 right-6 max-w-[calc(28rem-3rem)] mx-auto">
        <nav className="bg-slate-900/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl px-3 py-2 shadow-xl shadow-slate-900/10 flex justify-between items-center border border-white/5">
          <button
            onClick={() => setActiveTab('decks')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === 'decks'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={20} />
          </button>

          <Link
            to="/stats"
            onClick={() => setActiveTab('stats')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === 'stats'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 size={20} />
          </Link>

          {/* Center Add Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="relative -top-1 bg-blue-600 text-white p-3.5 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-500 hover:-translate-y-0.5 transition-all active:scale-90 border-2 border-slate-900 dark:border-gray-800"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>

          <Link
            to="/marketplace"
            onClick={() => setActiveTab('search')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === 'search'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search size={20} />
          </Link>

          <Link
            to="/profile"
            onClick={() => setActiveTab('profile')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User size={20} />
          </Link>
        </nav>
      </div>

      {/* Create Deck Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t('dashboard.modal.title')}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateDeck}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  {t('dashboard.modal.name')}
                </label>
                <input
                  type="text"
                  required
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t('dashboard.modal.namePlaceholder')}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  {t('dashboard.modal.description')}
                </label>
                <textarea
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder={t('dashboard.modal.descriptionPlaceholder')}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium"
                >
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-lg font-medium"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
