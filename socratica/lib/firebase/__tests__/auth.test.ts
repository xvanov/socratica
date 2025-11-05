/**
 * Unit tests for Firebase Auth service functions
 * Tests authentication methods with mocked Firebase Auth
 */

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import {
  signInWithGoogle,
  signOut,
  onAuthStateChanged,
  getCurrentUser,
  updateAuthProfile,
  deleteAuthUser,
  auth,
} from '@/lib/firebase/auth';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  deleteUser as firebaseDeleteUser,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  AuthError,
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';

// Mock Firebase Auth modules
vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    updateProfile: vi.fn(),
    deleteUser: vi.fn(),
    setPersistence: vi.fn(() => Promise.resolve()),
    browserLocalPersistence: 'local',
    GoogleAuthProvider: vi.fn(),
    getAuth: vi.fn(() => ({
      currentUser: null,
    })),
  };
});

vi.mock('@/lib/firebase/config', () => ({
  default: {},
}));

describe('Firebase Auth Service', () => {
  const mockUser: Partial<User> = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
  };

  const mockUserCredential: Partial<UserCredential> = {
    user: mockUser as User,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset auth.currentUser
    (auth as any).currentUser = null;
  });

  describe('signInWithGoogle', () => {
    it('should successfully sign in with Google', async () => {
      (signInWithPopup as MockedFunction<typeof signInWithPopup>).mockResolvedValue(
        mockUserCredential as UserCredential
      );

      const result = await signInWithGoogle();

      expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.any(GoogleAuthProvider));
      expect(result.user).toEqual(mockUser);
    });

    it('should map popup-closed-by-user error to user-friendly message', async () => {
      const error: AuthError = {
        code: 'auth/popup-closed-by-user',
        message: 'Popup closed',
        name: 'FirebaseError',
      } as AuthError;

      (signInWithPopup as MockedFunction<typeof signInWithPopup>).mockRejectedValue(error);

      await expect(signInWithGoogle()).rejects.toThrow('Sign-in was cancelled. Please try again.');
    });

    it('should map popup-blocked error to user-friendly message', async () => {
      const error: AuthError = {
        code: 'auth/popup-blocked',
        message: 'Popup blocked',
        name: 'FirebaseError',
      } as AuthError;

      (signInWithPopup as MockedFunction<typeof signInWithPopup>).mockRejectedValue(error);

      await expect(signInWithGoogle()).rejects.toThrow(
        'Pop-up was blocked by your browser. Please allow pop-ups and try again.'
      );
    });

    it('should map network-request-failed error to user-friendly message', async () => {
      const error: AuthError = {
        code: 'auth/network-request-failed',
        message: 'Network error',
        name: 'FirebaseError',
      } as AuthError;

      (signInWithPopup as MockedFunction<typeof signInWithPopup>).mockRejectedValue(error);

      await expect(signInWithGoogle()).rejects.toThrow(
        'Network error. Please check your connection and try again.'
      );
    });

    it('should map unknown error to generic message', async () => {
      const error: AuthError = {
        code: 'auth/unknown-error',
        message: 'Unknown error',
        name: 'FirebaseError',
      } as AuthError;

      (signInWithPopup as MockedFunction<typeof signInWithPopup>).mockRejectedValue(error);

      await expect(signInWithGoogle()).rejects.toThrow();
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      (firebaseSignOut as MockedFunction<typeof firebaseSignOut>).mockResolvedValue(undefined);

      await signOut();

      expect(firebaseSignOut).toHaveBeenCalledWith(auth);
    });

    it('should map sign-out errors to user-friendly messages', async () => {
      const error: AuthError = {
        code: 'auth/network-request-failed',
        message: 'Network error',
        name: 'FirebaseError',
      } as AuthError;

      (firebaseSignOut as MockedFunction<typeof firebaseSignOut>).mockRejectedValue(error);

      await expect(signOut()).rejects.toThrow(
        'Network error. Please check your connection and try again.'
      );
    });
  });

  describe('onAuthStateChanged', () => {
    it('should set up auth state observer', () => {
      const callback = vi.fn();
      const unsubscribe = vi.fn();

      (firebaseOnAuthStateChanged as MockedFunction<typeof firebaseOnAuthStateChanged>).mockReturnValue(
        unsubscribe
      );

      const result = onAuthStateChanged(callback);

      expect(firebaseOnAuthStateChanged).toHaveBeenCalledWith(auth, callback);
      expect(result).toBe(unsubscribe);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is signed in', () => {
      (auth as any).currentUser = null;

      const result = getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return current user when signed in', () => {
      (auth as any).currentUser = mockUser;

      const result = getCurrentUser();

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateAuthProfile', () => {
    it('should successfully update user profile', async () => {
      (auth as any).currentUser = mockUser;
      (firebaseUpdateProfile as MockedFunction<typeof firebaseUpdateProfile>).mockResolvedValue(
        undefined
      );

      const updates = { displayName: 'Updated Name' };
      await updateAuthProfile(updates);

      expect(firebaseUpdateProfile).toHaveBeenCalledWith(mockUser, updates);
    });

    it('should throw error when no user is signed in', async () => {
      (auth as any).currentUser = null;

      await expect(updateAuthProfile({ displayName: 'Updated Name' })).rejects.toThrow(
        'No user is currently signed in.'
      );
    });

    it('should map update errors to user-friendly messages', async () => {
      (auth as any).currentUser = mockUser;
      const error: AuthError = {
        code: 'auth/requires-recent-login',
        message: 'Requires recent login',
        name: 'FirebaseError',
      } as AuthError;

      (firebaseUpdateProfile as MockedFunction<typeof firebaseUpdateProfile>).mockRejectedValue(
        error
      );

      await expect(updateAuthProfile({ displayName: 'Updated Name' })).rejects.toThrow(
        'Please sign in again to complete this action.'
      );
    });
  });

  describe('deleteAuthUser', () => {
    it('should successfully delete user account', async () => {
      (auth as any).currentUser = mockUser;
      (firebaseDeleteUser as MockedFunction<typeof firebaseDeleteUser>).mockResolvedValue(undefined);

      await deleteAuthUser();

      expect(firebaseDeleteUser).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error when no user is signed in', async () => {
      (auth as any).currentUser = null;

      await expect(deleteAuthUser()).rejects.toThrow('No user is currently signed in.');
    });

    it('should map deletion errors to user-friendly messages', async () => {
      (auth as any).currentUser = mockUser;
      const error: AuthError = {
        code: 'auth/requires-recent-login',
        message: 'Requires recent login',
        name: 'FirebaseError',
      } as AuthError;

      (firebaseDeleteUser as MockedFunction<typeof firebaseDeleteUser>).mockRejectedValue(error);

      await expect(deleteAuthUser()).rejects.toThrow(
        'Please sign in again to complete this action.'
      );
    });
  });
});

