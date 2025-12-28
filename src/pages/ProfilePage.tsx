import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { ProfileHeader } from '../features/profile/components/ProfileHeader';
import { ProfileStats } from '../features/profile/components/ProfileStats';
import { ProfileMenu } from '../features/profile/components/ProfileMenu';
import { useProfile } from '../features/profile/hooks/useProfile';
import { useAuth } from '../features/auth/hooks/useAuth';

export function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut: authSignOut } = useAuth();
  const { profile: _profile } = useProfile();

  const handleLogout = async () => {
    await authSignOut();
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('profile.title')}
          </h1>
        </div>

        {/* Profile Header */}
        <div className="mb-4">
          <ProfileHeader />
        </div>

        {/* Stats */}
        <div className="mb-4">
          <ProfileStats />
        </div>

        {/* Menu */}
        <div className="mt-6">
          <ProfileMenu onLogout={handleLogout} />
        </div>
      </div>
    </AppLayout>
  );
}
