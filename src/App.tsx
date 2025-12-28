import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { DecksPage } from './pages/DecksPage';
import { StudyPage } from './pages/StudyPage';
import { StatsPage } from './pages/StatsPage';
import { TagsPage } from './pages/TagsPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/profile/EditProfilePage';
import { AccountPage } from './pages/profile/AccountPage';
import { PreferencesPage } from './pages/profile/PreferencesPage';
import { AppSettingsPage } from './pages/profile/AppSettingsPage';
import { LoginForm } from './features/auth/components/LoginForm';
import { SignupForm } from './features/auth/components/SignupForm';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Toaster
            position="top-center"
            richColors
            duration={3000}
            closeButton
            toastOptions={{
              style: {
                maxWidth: 'calc(100vw - 32px)',
                margin: '16px auto',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: {
                style: {
                  background: 'hsl(142.1 76.2% 36.3%)',
                  color: 'white',
                },
              },
              error: {
                style: {
                  background: 'hsl(0 84.2% 60.2%)',
                  color: 'white',
                },
              },
              warning: {
                style: {
                  background: 'hsl(38 92% 50%)',
                  color: 'white',
                },
              },
              info: {
                style: {
                  background: 'hsl(217 91% 60%)',
                  color: 'white',
                },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/decks/:deckId"
            element={
              <ProtectedRoute>
                <DecksPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/decks/:deckId/study"
            element={
              <ProtectedRoute>
                <StudyPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <MarketplacePage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <StatsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tags"
            element={
              <ProtectedRoute>
                <TagsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/preferences"
            element={
              <ProtectedRoute>
                <PreferencesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/settings"
            element={
              <ProtectedRoute>
                <AppSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
