/**
 * Component tests for AuthButton
 * Tests sign-in and sign-out button rendering and interactions
 */

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthButton from '@/components/auth/AuthButton';
import { useAuth } from '@/hooks/useAuth';
import type { User } from 'firebase/auth';

// Mock Firebase Auth module
vi.mock('@/lib/firebase/auth', () => ({
  auth: {},
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(() => vi.fn()),
  getCurrentUser: vi.fn(),
  updateAuthProfile: vi.fn(),
  deleteAuthUser: vi.fn(),
}));

// Mock useAuth hook
vi.mock('@/hooks/useAuth');

const mockUser: Partial<User> = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
};

describe('AuthButton', () => {
  const mockSignIn = vi.fn();
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as MockedFunction<typeof useAuth>).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      updateProfile: vi.fn(),
      deleteAccount: vi.fn(),
    });
  });

  describe('when loading', () => {
    it('should show loading spinner', () => {
      (useAuth as MockedFunction<typeof useAuth>).mockReturnValue({
        user: null,
        loading: true,
        error: null,
        signIn: mockSignIn,
        signOut: mockSignOut,
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
      });

      render(<AuthButton />);
      expect(screen.getByLabelText('Checking authentication status')).toBeInTheDocument();
    });
  });

  describe('when unauthenticated', () => {
    it('should show sign-in button', () => {
      render(<AuthButton />);
      expect(screen.getByLabelText('Sign in with Google')).toBeInTheDocument();
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    });

    it('should call signIn when sign-in button is clicked', async () => {
      mockSignIn.mockResolvedValue(undefined);

      render(<AuthButton />);
      const button = screen.getByLabelText('Sign in with Google');
      await userEvent.click(button);

      expect(mockSignIn).toHaveBeenCalled();
    });

    it('should show loading state during sign-in', async () => {
      mockSignIn.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<AuthButton />);
      const button = screen.getByLabelText('Sign in with Google');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });
    });

    it('should display error message when sign-in fails', async () => {
      const errorMessage = 'Sign-in failed';
      mockSignIn.mockRejectedValue(new Error(errorMessage));

      render(<AuthButton />);
      const button = screen.getByLabelText('Sign in with Google');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should not show sign-in button when variant is signout', () => {
      render(<AuthButton variant="signout" />);
      expect(screen.queryByLabelText('Sign in with Google')).not.toBeInTheDocument();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      (useAuth as MockedFunction<typeof useAuth>).mockReturnValue({
        user: mockUser as User,
        loading: false,
        error: null,
        signIn: mockSignIn,
        signOut: mockSignOut,
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
      });
    });

    it('should show sign-out button', () => {
      render(<AuthButton />);
      expect(screen.getByLabelText('Sign out')).toBeInTheDocument();
      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });

    it('should call signOut when sign-out button is clicked', async () => {
      mockSignOut.mockResolvedValue(undefined);

      render(<AuthButton />);
      const button = screen.getByLabelText('Sign out');
      await userEvent.click(button);

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should show loading state during sign-out', async () => {
      mockSignOut.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<AuthButton />);
      const button = screen.getByLabelText('Sign out');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Signing out...')).toBeInTheDocument();
      });
    });

    it('should display error message when sign-out fails', async () => {
      const errorMessage = 'Sign-out failed';
      mockSignOut.mockRejectedValue(new Error(errorMessage));

      render(<AuthButton />);
      const button = screen.getByLabelText('Sign out');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should not show sign-out button when variant is signin', () => {
      render(<AuthButton variant="signin" />);
      expect(screen.queryByLabelText('Sign out')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<AuthButton />);
      expect(screen.getByLabelText('Sign in with Google')).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      mockSignIn.mockResolvedValue(undefined);

      render(<AuthButton />);
      const button = screen.getByLabelText('Sign in with Google');
      button.focus();
      expect(button).toHaveFocus();

      await userEvent.keyboard('{Enter}');
      expect(mockSignIn).toHaveBeenCalled();
    });

    it('should disable button during loading', async () => {
      mockSignIn.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<AuthButton />);
      const button = screen.getByLabelText('Sign in with Google');
      await userEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });
  });
});

