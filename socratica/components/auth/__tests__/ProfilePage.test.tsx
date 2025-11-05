/**
 * Component tests for ProfilePage
 * Tests profile display, loading, updating, and error handling
 */

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '@/components/auth/ProfilePage';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile, updateUserProfile } from '@/lib/firebase/users';
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
  photoURL: 'https://example.com/photo.jpg',
};

const mockProfile = {
  userId: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  preferences: {},
  createdAt: '2025-01-27T10:00:00Z',
  updatedAt: '2025-01-27T10:00:00Z',
};

describe('ProfilePage', () => {
  const mockSignIn = vi.fn();
  const mockSignOut = vi.fn();
  const mockUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as MockedFunction<typeof useAuth>).mockReturnValue({
      user: mockUser as User,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      updateProfile: mockUpdateProfile,
      deleteAccount: vi.fn(),
    });
  });

  describe('when loading', () => {
    it('should show loading spinner', async () => {
      (getUserProfile as MockedFunction<typeof getUserProfile>).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<ProfilePage />);

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });
  });

  describe('when profile loaded', () => {
    beforeEach(() => {
      (getUserProfile as MockedFunction<typeof getUserProfile>).mockResolvedValue(mockProfile as any);
    });

    it('should display user profile information', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });
    });

    it('should display profile photo when available', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        const photo = screen.getByAltText('Test User');
        expect(photo).toHaveAttribute('src', 'https://example.com/photo.jpg');
      });
    });

    it('should display placeholder when no photo', async () => {
      (getUserProfile as MockedFunction<typeof getUserProfile>).mockResolvedValue({
        ...mockProfile,
        photoURL: undefined,
      } as any);

      const { container } = render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
      
      // Find SVG in the component (should be in the placeholder div)
      const svg = container.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeInTheDocument();
    });

    it('should update profile when form is submitted', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);
      (updateUserProfile as MockedFunction<typeof updateUserProfile>).mockResolvedValue(undefined);

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const input = screen.getByDisplayValue('Test User');
      await userEvent.clear(input);
      await userEvent.type(input, 'Updated Name');

      const submitButton = screen.getByRole('button', { name: /update profile/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ displayName: 'Updated Name' });
        expect(updateUserProfile).toHaveBeenCalledWith('test-user-id', {
          displayName: 'Updated Name',
        });
      });
    });

    it('should show success message after successful update', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);
      (updateUserProfile as MockedFunction<typeof updateUserProfile>).mockResolvedValue(undefined);

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const input = screen.getByDisplayValue('Test User');
      await userEvent.clear(input);
      await userEvent.type(input, 'Updated Name');

      const submitButton = screen.getByRole('button', { name: /update profile/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
      });
    });

    it('should show error message when update fails', async () => {
      const errorMessage = 'Update failed';
      mockUpdateProfile.mockRejectedValue(new Error(errorMessage));

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const input = screen.getByDisplayValue('Test User');
      await userEvent.clear(input);
      await userEvent.type(input, 'Updated Name');

      const submitButton = screen.getByRole('button', { name: /update profile/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should validate display name is not empty', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const input = screen.getByDisplayValue('Test User') as HTMLInputElement;
      await userEvent.clear(input);
      
      // After clearing, if we try to submit with empty value, it should show error
      const submitButton = screen.getByRole('button', { name: /update profile/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Display name cannot be empty')).toBeInTheDocument();
      });
    });

    it('should disable submit button when no changes', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /update profile/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show loading state during update', async () => {
      mockUpdateProfile.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      (updateUserProfile as MockedFunction<typeof updateUserProfile>).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const input = screen.getByDisplayValue('Test User');
      await userEvent.clear(input);
      await userEvent.type(input, 'Updated Name');

      const submitButton = screen.getByRole('button', { name: /update profile/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Updating...')).toBeInTheDocument();
      });
    });
  });

  describe('when profile not found', () => {
    it('should create profile from Firebase Auth user', async () => {
      (getUserProfile as MockedFunction<typeof getUserProfile>).mockResolvedValue(null);

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should display error when profile load fails', async () => {
      const errorMessage = 'Failed to load profile';
      (getUserProfile as MockedFunction<typeof getUserProfile>).mockRejectedValue(
        new Error(errorMessage)
      );

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });
});

