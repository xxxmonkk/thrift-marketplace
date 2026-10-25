import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  /** If true, redirects authenticated users away (e.g., login/signup pages) */
  guestOnly?: boolean;
}

export function ProtectedRoute({ children, requiredRole, allowedRoles, guestOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Guest-only pages (login, signup): redirect authenticated users to home
  if (guestOnly && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Protected pages: redirect unauthenticated users to login
  if (!guestOnly && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check: redirect if role doesn't match
  const isUnauthorized =
    (requiredRole && user?.role !== requiredRole) ||
    (allowedRoles && user?.role && !allowedRoles.includes(user.role));

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">⚑</div>
          <h1 className="editorial-heading text-2xl text-espresso mb-3">Access Restricted</h1>
          <p className="font-sans text-sm text-olive mb-6">
            This area requires{' '}
            <span className="font-medium text-sepia capitalize">
              {requiredRole || allowedRoles?.join(', ')}
            </span>{' '}
            access. You are signed in as a{' '}
            <span className="font-medium text-sepia capitalize">{user?.role}</span>.
          </p>
          <a href="/" className="btn-secondary">
            Return to Marketplace
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
