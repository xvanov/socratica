/**
 * Component tests for ProtectedRoute
 * Tests route protection logic and rendering
 */

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import type { User } from 'firebase/auth';

// Mock useAuth hook
vi.mock('@/hooks/useAuth');

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

const mockUser: Partial<User> = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

describe('ProtectedRoute', () => {
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

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    });
  });

  describe('when unauthenticated', () => {
    it('should show sign-in prompt with default fallback', () => {
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Sign in Required')).toBeInTheDocument();
      expect(screen.getByText('Please sign in to access this content.')).toBeInTheDocument();
      expect(screen.getByLabelText('Sign in with Google')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show custom fallback when provided', () => {
      render(
        <ProtectedRoute fallback={<div>Custom Fallback</div>}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
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

    it('should render protected content', () => {
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Sign in Required')).not.toBeInTheDocument();
    });

    it('should ignore fallback when authenticated', () => {
      render(
        <ProtectedRoute fallback={<div>Custom Fallback</div>}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Custom Fallback')).not.toBeInTheDocument();
    });
  });
});


