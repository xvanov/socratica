"use client";

/**
 * SettingsPage component
 * Displays user settings/preferences and allows updating them
 * Includes account deletion functionality with confirmation dialog
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserPreferences, updateUserPreferences, deleteUserProfile, deleteUserSessions } from '@/lib/firebase/users';
import type { UserPreferences } from '@/lib/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import ProtectedRoute from './ProtectedRoute';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  notifications: true,
};

/**
 * SettingsPage component
 * Shows user settings and allows preference updates and account deletion
 */
export default function SettingsPage() {
  const { user, signOut, deleteAccount } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /**
   * Load user preferences from Firestore
   */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        setLoading(true);
        setError(null);
        const userPrefs = await getUserPreferences(user.uid);
        setPreferences({ ...DEFAULT_PREFERENCES, ...userPrefs });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load settings. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  /**
   * Handle preference update
   */
  const handlePreferenceChange = async (key: keyof UserPreferences, value: unknown) => {
    if (!user) return;

    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await updateUserPreferences(user.uid, { [key]: value });

      setSuccess('Settings saved successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save settings. Please try again.';
      setError(errorMessage);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle account deletion
   */
  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      // Delete all user sessions from Firestore
      await deleteUserSessions(user.uid);

      // Delete user profile from Firestore
      await deleteUserProfile(user.uid);

      // Delete Firebase Auth account (this will also sign out the user)
      await deleteAccount();

      setSuccess('Account deleted successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete account. Please try again.';
      setError(errorMessage);
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-6 text-2xl font-bold text-[var(--neutral-900)] dark:text-[var(--neutral-100)]">
          Settings
        </h1>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" label="Loading settings..." />
          </div>
        ) : (
          <>
            {error && <ErrorMessage message={error} className="mb-4" />}
            {success && <SuccessMessage message={success} className="mb-4" />}

            <div className="space-y-6">
              {/* Theme Preference */}
              <div>
                <label className="block text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)] mb-2">
                  Theme
                </label>
                <select
                  value={preferences.theme || 'system'}
                  onChange={(e) =>
                    handlePreferenceChange('theme', e.target.value as 'light' | 'dark' | 'system')
                  }
                  disabled={saving}
                  className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--neutral-900)] focus:border-[var(--primary-600)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--surface)] dark:text-[var(--neutral-100)] dark:focus:border-[var(--primary-500)] dark:focus:ring-[var(--primary-500)]"
                  aria-label="Theme preference"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              {/* Notifications Preference */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
                    Notifications
                  </label>
                  <p className="text-xs text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
                    Enable notifications for updates and reminders
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications ?? true}
                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                    disabled={saving}
                    className="sr-only peer"
                    aria-label="Enable notifications"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-[var(--neutral-300)] transition-colors peer-checked:bg-[var(--primary-600)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary-300)] peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:bg-[var(--neutral-600)] dark:peer-checked:bg-[var(--primary-500)]"></div>
                </label>
              </div>

              {/* Account Deletion Section */}
              <div className="border-t border-[var(--border)] pt-6">
                <h2 className="mb-4 text-lg font-semibold text-[var(--neutral-900)] dark:text-[var(--neutral-100)]">
                  Danger Zone
                </h2>
                <div className="rounded-lg border border-[var(--error-300)] bg-[var(--error-50)] p-4 dark:border-[var(--error-700)] dark:bg-[var(--error-900)]/20">
                  <h3 className="mb-2 text-sm font-medium text-[var(--error-800)] dark:text-[var(--error-200)]">
                    Delete Account
                  </h3>
                  <div className="mb-4 text-xs text-[var(--error-700)] dark:text-[var(--error-300)]">
                    <p className="mb-2">
                      This will permanently delete your account and all associated data including:
                    </p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>Your profile information</li>
                      <li>All your sessions and conversation history</li>
                      <li>Your preferences and settings</li>
                    </ul>
                    <p className="mt-2">
                      This action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleting}
                    className="rounded-lg bg-[var(--error-600)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error-700)] focus:outline-none focus:ring-2 focus:ring-[var(--error-600)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--error-500)] dark:hover:bg-[var(--error-600)] dark:focus:ring-[var(--error-500)] min-h-[44px]"
                    aria-label="Delete account"
                  >
                    {deleting ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Deletion Confirmation Dialog */}
            <ConfirmationDialog
              isOpen={showDeleteDialog}
              onConfirm={handleDeleteAccount}
              onCancel={() => setShowDeleteDialog(false)}
              title="Delete Account"
              message="Are you sure you want to delete your account? This will permanently delete all your data including your profile, sessions, and preferences. This action cannot be undone."
              confirmLabel="Delete Account"
              cancelLabel="Cancel"
            />
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

