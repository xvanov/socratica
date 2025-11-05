"use client";

/**
 * AuthProvider component
 * Provides authentication state and methods to all child components via React Context
 * Manages Firebase Auth state and provides sign-in, sign-out, profile update, and account deletion methods
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  signInWithGoogle,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getCurrentUser,
  updateAuthProfile as firebaseUpdateAuthProfile,
  deleteAuthUser as firebaseDeleteAuthUser,
} from '@/lib/firebase/auth';
import { createUserProfile } from '@/lib/firebase/users';
import type { AuthContextValue } from '@/lib/types/user';

/**
 * AuthContext for authentication state
 * Used by useAuth hook to access auth state and methods
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider component
 * Wraps application and provides authentication state to all child components
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sign in with Google provider
   */
  const signIn = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      // Auth state will be updated by onAuthStateChanged observer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in. Please try again.';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await firebaseSignOut();
      // Clear localStorage on sign out
      if (typeof window !== "undefined") {
        localStorage.removeItem("socratica_sessions");
        localStorage.removeItem("socratica_user_id");
        localStorage.removeItem("localUserId");
      }
      // Auth state will be updated by onAuthStateChanged observer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out. Please try again.';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Update user profile (displayName, photoURL)
   */
  const updateProfile = useCallback(
    async (updates: { displayName?: string; photoURL?: string }) => {
      try {
        setError(null);
        await firebaseUpdateAuthProfile(updates);
        // Auth state will be updated by onAuthStateChanged observer
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Delete user account and all associated data
   */
  const deleteAccount = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await firebaseDeleteAuthUser();
      // Auth state will be updated by onAuthStateChanged observer (user will be null)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete account. Please try again.';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Set up Firebase Auth state observer
   * Updates React state when authentication state changes
   * Creates user profile in Firestore on first sign-in
   */
  useEffect(() => {
    // Set initial loading state
    setLoading(true);

    // Set up auth state observer
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      // Always update auth state first (non-blocking)
      setUser(firebaseUser);
      setLoading(false);
      setError(null);
      
      // Then create user profile asynchronously (non-blocking)
      if (firebaseUser) {
        // Use setTimeout to defer profile creation and avoid blocking auth state
        setTimeout(async () => {
          try {
            await createUserProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            });
          } catch (error) {
            console.error('Failed to create user profile:', error);
            // Don't block auth state update if profile creation fails
            // Profile can be created later when Firestore is available
            // User can still use the app without a profile initially
          }
        }, 500); // Increased delay to ensure Firestore is ready
      }
    });

    // Cleanup: unsubscribe when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * AuthContext value
   * Provides user, loading, error state and auth methods to child components
   */
  const value: AuthContextValue = {
    user,
    loading,
    error,
    signIn,
    signOut,
    updateProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

