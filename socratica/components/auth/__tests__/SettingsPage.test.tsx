/**
 * Component tests for SettingsPage
 * Tests settings display, preference updates, and account deletion
 */

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '@/components/auth/SettingsPage';
import { useAuth } from '@/hooks/useAuth';
import {
  getUserPreferences,
  updateUserPreferences,
  deleteUserProfile,
  deleteUserSessions,
} from '@/lib/firebase/users';
import type { User } from 'firebase/auth';

// Mock dependencies
vi.mock('@/hooks/useAuth');
vi.mock('@/lib/firebase/users');
vi.mock('@/lib/firebase/auth', () => ({
  auth: {},
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(() => vi.fn()),
  getCurrentUser: vi.fn(),
  updateAuthProfile: vi.fn(),
  deleteAuthUser: vi.fn(),
}));

const mockUser: Partial<User> = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

describe('SettingsPage', () => {
  const mockSignOut = vi.fn();
  const mockDeleteAccount = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as MockedFunction<typeof useAuth>).mockReturnValue({
      user: mockUser as User,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signOut: mockSignOut,
      updateProfile: vi.fn(),
      deleteAccount: mockDeleteAccount,
    });
    (getUserPreferences as MockedFunction<typeof getUserPreferences>).mockResolvedValue({
      theme: 'light',
      notifications: true,
    });
  });

  describe('when loading', () => {
    it('should show loading spinner', async () => {
      (getUserPreferences as MockedFunction<typeof getUserPreferences>).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<SettingsPage />);

      expect(screen.getByText('Loading settings...')).toBeInTheDocument();
    });
  });

  describe('when settings loaded', () => {
    it('should display current settings', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        const themeSelect = screen.getByLabelText('Theme preference') as HTMLSelectElement;
        expect(themeSelect.value).toBe('light');
      });
    });

    it('should allow updating theme preference', async () => {
      (updateUserPreferences as MockedFunction<typeof updateUserPreferences>).mockResolvedValue(
        undefined
      );

      render(<SettingsPage />);

      await waitFor(() => {
        const themeSelect = screen.getByLabelText('Theme preference') as HTMLSelectElement;
        expect(themeSelect.value).toBe('light');
      });

      const themeSelect = screen.getByLabelText('Theme preference') as HTMLSelectElement;
      await userEvent.selectOptions(themeSelect, 'dark');

      await waitFor(() => {
        expect(updateUserPreferences).toHaveBeenCalledWith('test-user-id', { theme: 'dark' });
      });
    });

    it('should allow toggling notifications', async () => {
      (updateUserPreferences as MockedFunction<typeof updateUserPreferences>).mockResolvedValue(
        undefined
      );

      render(<SettingsPage />);

      await waitFor(() => {
        const checkbox = screen.getByLabelText('Enable notifications') as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
      });

      const checkbox = screen.getByLabelText('Enable notifications') as HTMLInputElement;
      await userEvent.click(checkbox);

      await waitFor(() => {
        expect(updateUserPreferences).toHaveBeenCalledWith('test-user-id', {
          notifications: false,
        });
      });
    });

    it('should show success message after settings update', async () => {
      (updateUserPreferences as MockedFunction<typeof updateUserPreferences>).mockResolvedValue(
        undefined
      );

      render(<SettingsPage />);

      await waitFor(() => {
        const themeSelect = screen.getByLabelText('Theme preference') as HTMLSelectElement;
        expect(themeSelect.value).toBe('light');
      });

      const themeSelect = screen.getByLabelText('Theme preference') as HTMLSelectElement;
      await userEvent.selectOptions(themeSelect, 'dark');

      await waitFor(() => {
        expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
      });
    });

    it('should show error message when settings update fails', async () => {
      const errorMessage = 'Failed to save settings';
      (updateUserPreferences as MockedFunction<typeof updateUserPreferences>).mockRejectedValue(
        new Error(errorMessage)
      );

      render(<SettingsPage />);

      await waitFor(() => {
        const themeSelect = screen.getByLabelText('Theme preference') as HTMLSelectElement;
        expect(themeSelect.value).toBe('light');
      });

      const themeSelect = screen.getByLabelText('Theme preference') as HTMLSelectElement;
      await userEvent.selectOptions(themeSelect, 'dark');

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should apply default settings for new users', async () => {
      (getUserPreferences as MockedFunction<typeof getUserPreferences>).mockResolvedValue({});

      render(<SettingsPage />);

      await waitFor(() => {
        const themeSelect = screen.getByLabelText('Theme preference') as HTMLSelectElement;
        expect(themeSelect.value).toBe('system');
        const checkbox = screen.getByLabelText('Enable notifications') as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
      });
    });
  });

  describe('account deletion', () => {
    it('should show delete account button', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when delete button is clicked', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /delete account/i });
        expect(deleteButtons.length).toBeGreaterThan(0);
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete account/i });
      await userEvent.click(deleteButtons[0]); // Click the first one (main button)

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete your account/i)).toBeInTheDocument();
      });
    });

    it('should delete account when confirmed', async () => {
      (deleteUserSessions as MockedFunction<typeof deleteUserSessions>).mockResolvedValue(
        undefined
      );
      (deleteUserProfile as MockedFunction<typeof deleteUserProfile>).mockResolvedValue(undefined);
      mockDeleteAccount.mockResolvedValue(undefined);

      render(<SettingsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /delete account/i });
        expect(deleteButtons.length).toBeGreaterThan(0);
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete account/i });
      await userEvent.click(deleteButtons[0]); // Click the first one (main button)

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete your account/i)).toBeInTheDocument();
      });

      // Find the confirm button in the dialog (should be the second "Delete Account" button)
      const confirmButtons = screen.getAllByRole('button', { name: /delete account/i });
      await userEvent.click(confirmButtons[1]); // Click the second one (confirm button)

      await waitFor(() => {
        expect(deleteUserSessions).toHaveBeenCalledWith('test-user-id');
        expect(deleteUserProfile).toHaveBeenCalledWith('test-user-id');
        expect(mockDeleteAccount).toHaveBeenCalled();
      });
    });

    it('should cancel deletion when cancel button is clicked', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /delete account/i });
        expect(deleteButtons.length).toBeGreaterThan(0);
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete account/i });
      await userEvent.click(deleteButtons[0]); // Click the first one (main button)

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete your account/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Are you sure you want to delete your account/i)).not.toBeInTheDocument();
      });

      expect(deleteUserSessions).not.toHaveBeenCalled();
      expect(deleteUserProfile).not.toHaveBeenCalled();
      expect(mockDeleteAccount).not.toHaveBeenCalled();
    });

    it('should show error message when deletion fails', async () => {
      const errorMessage = 'Deletion failed';
      (deleteUserSessions as MockedFunction<typeof deleteUserSessions>).mockRejectedValue(
        new Error(errorMessage)
      );

      render(<SettingsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /delete account/i });
        expect(deleteButtons.length).toBeGreaterThan(0);
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete account/i });
      await userEvent.click(deleteButtons[0]); // Click the first one (main button)

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete your account/i)).toBeInTheDocument();
      });

      // Find the confirm button in the dialog
      const confirmButtons = screen.getAllByRole('button', { name: /delete account/i });
      await userEvent.click(confirmButtons[1]); // Click the second one (confirm button)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display warning message about data deletion', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/This will permanently delete your account/i)).toBeInTheDocument();
        expect(screen.getByText(/Your profile information/i)).toBeInTheDocument();
        expect(screen.getByText(/All your sessions/i)).toBeInTheDocument();
        expect(screen.getByText(/Your preferences and settings/i)).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should display error when settings load fails', async () => {
      const errorMessage = 'Failed to load settings';
      (getUserPreferences as MockedFunction<typeof getUserPreferences>).mockRejectedValue(
        new Error(errorMessage)
      );

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });
});

