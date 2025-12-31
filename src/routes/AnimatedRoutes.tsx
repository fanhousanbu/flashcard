import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HomePage } from '../pages/HomePage';
import { DashboardPage } from '../pages/DashboardPage';
import { DecksPage } from '../pages/DecksPage';
import { StudyPage } from '../pages/StudyPage';
import { StatsPage } from '../pages/StatsPage';
import { TagsPage } from '../pages/TagsPage';
import { MarketplacePage } from '../pages/MarketplacePage';
import { AuthorDashboardPage } from '../pages/AuthorDashboardPage';
import { VerifyEmailPage } from '../pages/VerifyEmailPage';
import { ProfilePage } from '../pages/ProfilePage';
import { EditProfilePage } from '../pages/profile/EditProfilePage';
import { AccountPage } from '../pages/profile/AccountPage';
import { PreferencesPage } from '../pages/profile/PreferencesPage';
import { AppSettingsPage } from '../pages/profile/AppSettingsPage';
import { CardBrowserPage } from '../pages/CardBrowserPage';
import { LoginForm } from '../features/auth/components/LoginForm';
import { SignupForm } from '../features/auth/components/SignupForm';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { PageTransition } from '../components/layout/PageTransition';

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginForm /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignupForm /></PageTransition>} />
        <Route path="/verify-email" element={<PageTransition><VerifyEmailPage /></PageTransition>} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition><DashboardPage /></PageTransition>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/decks/:deckId"
          element={
            <ProtectedRoute>
              <PageTransition><DecksPage /></PageTransition>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/decks/:deckId/study"
          element={
            <ProtectedRoute>
              <PageTransition><StudyPage /></PageTransition>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <PageTransition><MarketplacePage /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace/author"
          element={
            <ProtectedRoute>
              <PageTransition><AuthorDashboardPage /></PageTransition>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <PageTransition><StatsPage /></PageTransition>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tags"
          element={
            <ProtectedRoute>
              <PageTransition><TagsPage /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/browser"
          element={
            <ProtectedRoute>
              <PageTransition><CardBrowserPage /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageTransition><ProfilePage /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <PageTransition><EditProfilePage /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/account"
          element={
            <ProtectedRoute>
              <PageTransition><AccountPage /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/preferences"
          element={
            <ProtectedRoute>
              <PageTransition><PreferencesPage /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/settings"
          element={
            <ProtectedRoute>
              <PageTransition><AppSettingsPage /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
