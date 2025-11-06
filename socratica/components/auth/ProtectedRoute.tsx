"use client";

/**
 * ProtectedRoute component
 * Wraps protected content and checks authentication state
 * Shows loading spinner when auth state is loading, sign-in prompt when unauthenticated, and protected content when authenticated
 */

import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AuthButton from './AuthButton';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  /** Protected content to render when authenticated */
  children: ReactNode;
  /** Optional fallback UI to show when unauthenticated (defaults to sign-in prompt) */
  fallback?: ReactNode;
}

/**
 * ProtectedRoute component
 * Checks authentication state and renders protected content or fallback
 */
export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while auth state is being initialized
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" label="Checking authentication..." />
      </div>
    );
  }

  // Show fallback or sign-in prompt when unauthenticated
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-semibold text-[var(--neutral-900)] dark:text-[var(--neutral-100)]">
          Sign in Required
        </h2>
        <p className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
          Please sign in to access this content.
        </p>
        <AuthButton variant="signin" />
      </div>
    );
  }

  // Render protected content when authenticated
  return <>{children}</>;
}


