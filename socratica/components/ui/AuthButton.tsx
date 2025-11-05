"use client";

import { useState, useEffect } from "react";
import { getLocalUserIdHelper } from "@/lib/firebase/sessions-local";

interface AuthButtonProps {
  showSignOut?: boolean;
  className?: string;
}

// Mock User type for localStorage fallback
interface MockUser {
  uid: string;
  isAnonymous: boolean;
}

/**
 * Simple Guest User component
 * Uses localStorage for session storage - no Firebase needed
 * Sessions are stored per browser/device
 */
export default function AuthButton({ showSignOut = false, className = "" }: AuthButtonProps) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Always use localStorage - no Firebase needed for MVP
    const localUserId = localStorage.getItem('localUserId');
    if (localUserId) {
      setUser({ uid: localUserId, isAnonymous: true });
    } else {
      // Auto-create user ID on mount
      const newUserId = getLocalUserIdHelper();
      setUser({ uid: newUserId, isAnonymous: true });
    }
    setIsLoading(false);
  }, []);

  const handleSignIn = async () => {
    // Always use localStorage - no Firebase needed
    setIsSigningIn(true);
    try {
      const localUserId = getLocalUserIdHelper();
      setUser({ uid: localUserId, isAnonymous: true });
      setIsLoading(false);
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--neutral-300)] border-t-[var(--primary-600)]"></div>
        <span className="text-sm text-[var(--neutral-600)]">Loading...</span>
      </div>
    );
  }

  if (user) {
    if (showSignOut) {
      return (
        <div className={`flex items-center gap-3 ${className}`}>
          <span className="text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
            Guest User
          </span>
        </div>
      );
    }
    return null; // Don't show anything if user is signed in and showSignOut is false
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isSigningIn}
      className={`flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--neutral-700)] transition-colors hover:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--surface)] dark:text-[var(--neutral-300)] dark:hover:bg-[var(--neutral-800)] dark:focus:ring-[var(--neutral-100)] min-h-[44px] shadow-sm ${className}`}
      aria-label="Sign in anonymously"
    >
      {isSigningIn ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--neutral-300)] border-t-[var(--primary-600)]"></div>
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
          <span>Continue as Guest</span>
        </>
      )}
    </button>
  );
}

