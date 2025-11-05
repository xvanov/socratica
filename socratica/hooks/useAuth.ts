/**
 * React hook for accessing authentication state and methods
 * Provides access to AuthContext throughout the application
 */

import { useContext } from 'react';
import { AuthContext } from '@/components/auth/AuthProvider';
import type { AuthContextValue } from '@/lib/types/user';

/**
 * Hook to access authentication state and methods
 * @returns AuthContextValue with user, loading, error, and auth methods
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

