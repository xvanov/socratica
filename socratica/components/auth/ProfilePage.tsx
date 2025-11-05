"use client";

/**
 * ProfilePage component
 * Displays user profile information and allows updating display name
 * Integrates with Firebase Auth and Firestore for profile management
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile, updateUserProfile } from '@/lib/firebase/users';
import type { UserProfile } from '@/lib/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';
import ProtectedRoute from './ProtectedRoute';

/**
 * ProfilePage component
 * Shows user profile information and allows profile updates
 */
export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');

  /**
   * Load user profile from Firestore
   */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
          setDisplayName(userProfile.displayName || '');
        } else {
          // Profile not found, create from Firebase Auth user
          setProfile({
            userId: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || undefined,
            preferences: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setDisplayName(user.displayName || '');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load profile. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  /**
   * Handle profile update
   */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    // Validate display name
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError('Display name cannot be empty');
      return;
    }

    if (trimmedName === profile.displayName) {
      // No changes
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      // Update Firebase Auth profile
      await updateProfile({ displayName: trimmedName });

      // Update Firestore profile
      await updateUserProfile(user.uid, {
        displayName: trimmedName,
      });

      // Update local state
      setProfile({
        ...profile,
        displayName: trimmedName,
        updatedAt: new Date().toISOString(),
      });

      setSuccess('Profile updated successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-6 text-2xl font-bold text-[var(--neutral-900)] dark:text-[var(--neutral-100)]">
          Profile
        </h1>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" label="Loading profile..." />
          </div>
        ) : (
          <>
            {error && <ErrorMessage message={error} className="mb-4" />}
            {success && <SuccessMessage message={success} className="mb-4" />}

            {profile && (
              <div className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center gap-4">
                  {profile.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName || 'Profile'}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)]">
                      <svg
                        className="h-12 w-12 text-[var(--neutral-400)] dark:text-[var(--neutral-500)]"
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
                    </div>
                  )}
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
                      {profile.email}
                    </p>
                  </div>

                  {/* Display Name Form */}
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label
                        htmlFor="displayName"
                        className="block text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)]"
                      >
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={updating}
                        className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--neutral-900)] placeholder-[var(--neutral-400)] focus:border-[var(--primary-600)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--surface)] dark:text-[var(--neutral-100)] dark:focus:border-[var(--primary-500)] dark:focus:ring-[var(--primary-500)]"
                        placeholder="Enter your display name"
                        aria-label="Display name"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updating || displayName.trim() === profile.displayName}
                      className="rounded-lg bg-[var(--primary-600)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-700)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--primary-500)] dark:hover:bg-[var(--primary-600)] dark:focus:ring-[var(--primary-500)] min-h-[44px]"
                      aria-label="Update profile"
                    >
                      {updating ? (
                        <span className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          Updating...
                        </span>
                      ) : (
                        'Update Profile'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

