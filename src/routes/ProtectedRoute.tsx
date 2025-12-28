import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Loading } from '../components/common/Loading';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

