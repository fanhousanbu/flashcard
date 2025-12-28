import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../hooks/useProfile';

interface ProfileHeaderProps {
  onEdit?: () => void;
}

export function ProfileHeader({ onEdit }: ProfileHeaderProps) {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const displayName = profile?.username || profile?.id?.slice(0, 8) || 'User';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span>{displayName.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {profile?.username || t('profile.anonymous')}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {profile?.id ? `ID: ${profile.id.slice(0, 8)}...` : ''}
        </div>
      </div>
      {onEdit && (
        <Link
          to="/profile/edit"
          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          {t('profile.edit')}
        </Link>
      )}
    </div>
  );
}
