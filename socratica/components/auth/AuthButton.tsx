"use client";

/**
 * AuthButton component
 * Displays sign-in button when unauthenticated, sign-out button when authenticated
 * Integrates with Firebase Auth via useAuth hook
 */

import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useState } from 'react';

interface AuthButtonProps {
  /** Variant: 'signin' shows sign-in button, 'signout' shows sign-out button */
  variant?: 'signin' | 'signout';
  /** Additional CSS classes */
  className?: string;
}

/**
 * AuthButton component
 * Shows sign-in button when unauthenticated, sign-out button when authenticated
 */
export default function AuthButton({ variant, className = '' }: AuthButtonProps) {
  const { user, loading, error, signIn, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  /**
   * Handle sign-in click
   */
  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      await signIn();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in. Please try again.';
      setAuthError(errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  };

  /**
   * Handle sign-out click
   */
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      setAuthError(null);
      await signOut();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out. Please try again.';
      setAuthError(errorMessage);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Show loading state during initial auth check (but not during sign-in/sign-out operations)
  if (loading && !isSigningIn && !isSigningOut) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <LoadingSpinner size="sm" aria-label="Checking authentication status" />
      </div>
    );
  }

  // Show sign-in button when unauthenticated
  if (!user) {
    // Only show sign-in button if variant is 'signin' or not specified
    if (variant === 'signout') {
      return null;
    }

    return (
      <div className={className}>
        {authError && <ErrorMessage message={authError} className="mb-2" />}
        <button
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--neutral-700)] transition-colors hover:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--surface)] dark:text-[var(--neutral-300)] dark:hover:bg-[var(--neutral-800)] dark:focus:ring-[var(--neutral-100)] min-h-[44px] shadow-sm"
          aria-label="Sign in with Google"
        >
          {isSigningIn ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Show sign-out button when authenticated
  // Only show if variant is 'signout' or not specified
  if (variant === 'signin') {
    return null;
  }

  return (
    <div className={className}>
      {authError && <ErrorMessage message={authError} className="mb-2" />}
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--neutral-700)] transition-colors hover:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--surface)] dark:text-[var(--neutral-300)] dark:hover:bg-[var(--neutral-800)] dark:focus:ring-[var(--neutral-100)] min-h-[44px] shadow-sm"
        aria-label="Sign out"
      >
        {isSigningOut ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Signing out...</span>
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sign out</span>
          </>
        )}
      </button>
    </div>
  );
}

