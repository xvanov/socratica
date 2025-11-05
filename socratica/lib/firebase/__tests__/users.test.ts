/**
 * Unit tests for user profile Firestore service functions
 * Tests CRUD operations for user profiles and preferences
 */

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';

// Mock Firestore modules BEFORE imports
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  
  // Create a proper Timestamp mock class that works with instanceof
  class MockTimestamp {
    seconds: number;
    nanoseconds: number;
    
    constructor(seconds: number, nanoseconds: number = 0) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }
    
    toDate(): Date {
      return new Date(this.seconds * 1000);
    }
    
    static fromDate(date: Date): MockTimestamp {
      return new MockTimestamp(date.getTime() / 1000);
    }
  }
  
  return {
    ...actual,
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    Timestamp: MockTimestamp,
  };
});

vi.mock('@/lib/firebase/firestore', () => ({
  db: {},
}));

import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getUserPreferences,
  updateUserPreferences,
  deleteUserSessions,
} from '@/lib/firebase/users';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firestore';
import type { UserProfile, UserPreferences } from '@/lib/types/user';
import { SESSION_COLLECTION_NAME } from '@/types/session';
import { USERS_COLLECTION_NAME } from '@/lib/types/user';

describe('User Profile Service Functions', () => {
  const mockUserId = 'test-user-id';
  const mockUserProfile: UserProfile = {
    userId: mockUserId,
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    preferences: { theme: 'light', notifications: true },
    createdAt: '2025-01-27T10:00:00Z',
    updatedAt: '2025-01-27T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should fetch user profile from Firestore', async () => {
      const mockDocRef = { id: mockUserId };
      // Use Timestamp mock for proper instanceof check
      const mockTimestamp = new Timestamp(
        Math.floor(new Date(mockUserProfile.createdAt).getTime() / 1000),
        0
      );
      const mockDocSnap = {
        exists: () => true,
        id: mockUserId,
        data: () => ({
          email: mockUserProfile.email,
          displayName: mockUserProfile.displayName,
          photoURL: mockUserProfile.photoURL,
          preferences: mockUserProfile.preferences,
          createdAt: mockTimestamp,
          updatedAt: mockTimestamp,
        }),
      };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (getDoc as MockedFunction<typeof getDoc>).mockResolvedValue(mockDocSnap as any);

      const result = await getUserProfile(mockUserId);

      expect(doc).toHaveBeenCalledWith(db, USERS_COLLECTION_NAME, mockUserId);
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(result).toMatchObject({
        userId: mockUserProfile.userId,
        email: mockUserProfile.email,
        displayName: mockUserProfile.displayName,
        photoURL: mockUserProfile.photoURL,
        preferences: mockUserProfile.preferences,
      });
      expect(result?.createdAt).toMatch(/^2025-01-27T10:00:00/);
      expect(result?.updatedAt).toMatch(/^2025-01-27T10:00:00/);
    });

    it('should return null when profile does not exist', async () => {
      const mockDocRef = { id: mockUserId };
      const mockDocSnap = {
        exists: () => false,
      };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (getDoc as MockedFunction<typeof getDoc>).mockResolvedValue(mockDocSnap as any);

      const result = await getUserProfile(mockUserId);

      expect(result).toBeNull();
    });

    it('should handle Firestore errors', async () => {
      const mockDocRef = { id: mockUserId };
      const error = new FirestoreError('firestore/not-found', 'Document not found');

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (getDoc as MockedFunction<typeof getDoc>).mockRejectedValue(error);

      await expect(getUserProfile(mockUserId)).rejects.toThrow('Failed to fetch user profile');
    });
  });

  describe('createUserProfile', () => {
    it('should create user profile document in Firestore', async () => {
      const mockDocRef = { id: mockUserId };
      const mockDocSnap = {
        exists: () => false,
      };
      const mockUser = {
        uid: mockUserId,
        email: mockUserProfile.email,
        displayName: mockUserProfile.displayName,
        photoURL: mockUserProfile.photoURL,
      };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (getDoc as MockedFunction<typeof getDoc>).mockResolvedValue(mockDocSnap as any);
      (setDoc as MockedFunction<typeof setDoc>).mockResolvedValue(undefined);

      await createUserProfile(mockUser);

      expect(doc).toHaveBeenCalledWith(db, USERS_COLLECTION_NAME, mockUserId);
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(setDoc).toHaveBeenCalled();
    });

    it('should not overwrite existing profile', async () => {
      const mockDocRef = { id: mockUserId };
      const mockDocSnap = {
        exists: () => true,
      };
      const mockUser = {
        uid: mockUserId,
        email: mockUserProfile.email,
        displayName: mockUserProfile.displayName,
        photoURL: mockUserProfile.photoURL,
      };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (getDoc as MockedFunction<typeof getDoc>).mockResolvedValue(mockDocSnap as any);

      await createUserProfile(mockUser);

      expect(setDoc).not.toHaveBeenCalled();
    });

    it('should handle Firestore errors', async () => {
      const mockDocRef = { id: mockUserId };
      const mockDocSnap = {
        exists: () => false,
      };
      const error = new FirestoreError('firestore/permission-denied', 'Permission denied');
      const mockUser = {
        uid: mockUserId,
        email: mockUserProfile.email,
        displayName: mockUserProfile.displayName,
        photoURL: mockUserProfile.photoURL,
      };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (getDoc as MockedFunction<typeof getDoc>).mockResolvedValue(mockDocSnap as any);
      (setDoc as MockedFunction<typeof setDoc>).mockRejectedValue(error);

      await expect(createUserProfile(mockUser)).rejects.toThrow('Failed to create user profile');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile fields in Firestore', async () => {
      const mockDocRef = { id: mockUserId };
      const updates = { displayName: 'Updated Name' };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (updateDoc as MockedFunction<typeof updateDoc>).mockResolvedValue(undefined);

      await updateUserProfile(mockUserId, updates);

      expect(doc).toHaveBeenCalledWith(db, USERS_COLLECTION_NAME, mockUserId);
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should handle Firestore errors', async () => {
      const mockDocRef = { id: mockUserId };
      const error = new FirestoreError('firestore/not-found', 'Document not found');
      const updates = { displayName: 'Updated Name' };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (updateDoc as MockedFunction<typeof updateDoc>).mockRejectedValue(error);

      await expect(updateUserProfile(mockUserId, updates)).rejects.toThrow(
        'Failed to update user profile'
      );
    });
  });

  describe('deleteUserProfile', () => {
    it('should delete user profile document from Firestore', async () => {
      const mockDocRef = { id: mockUserId };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (deleteDoc as MockedFunction<typeof deleteDoc>).mockResolvedValue(undefined);

      await deleteUserProfile(mockUserId);

      expect(doc).toHaveBeenCalledWith(db, USERS_COLLECTION_NAME, mockUserId);
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('should handle Firestore errors', async () => {
      const mockDocRef = { id: mockUserId };
      const error = new FirestoreError('firestore/permission-denied', 'Permission denied');

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (deleteDoc as MockedFunction<typeof deleteDoc>).mockRejectedValue(error);

      await expect(deleteUserProfile(mockUserId)).rejects.toThrow('Failed to delete user profile');
    });
  });

  describe('getUserPreferences', () => {
    it('should fetch user preferences from Firestore', async () => {
      const mockDocRef = { id: mockUserId };
      // Use Timestamp mock for proper instanceof check
      const mockTimestamp = new Timestamp(
        Math.floor(new Date(mockUserProfile.createdAt).getTime() / 1000),
        0
      );
      const mockDocSnap = {
        exists: () => true,
        id: mockUserId,
        data: () => ({
          email: mockUserProfile.email,
          displayName: mockUserProfile.displayName,
          preferences: mockUserProfile.preferences,
          createdAt: mockTimestamp,
          updatedAt: mockTimestamp,
        }),
      };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (getDoc as MockedFunction<typeof getDoc>).mockResolvedValue(mockDocSnap as any);

      const result = await getUserPreferences(mockUserId);

      expect(result).toEqual(mockUserProfile.preferences);
    });

    it('should return empty object when profile does not exist', async () => {
      const mockDocRef = { id: mockUserId };
      const mockDocSnap = {
        exists: () => false,
      };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (getDoc as MockedFunction<typeof getDoc>).mockResolvedValue(mockDocSnap as any);

      const result = await getUserPreferences(mockUserId);

      expect(result).toEqual({});
    });

    it('should handle Firestore errors', async () => {
      const mockDocRef = { id: mockUserId };
      const error = new FirestoreError('firestore/not-found', 'Document not found');

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (getDoc as MockedFunction<typeof getDoc>).mockRejectedValue(error);

      await expect(getUserPreferences(mockUserId)).rejects.toThrow(/Failed to fetch user preferences/);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences in Firestore', async () => {
      const mockDocRef = { id: mockUserId };
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          preferences: mockUserProfile.preferences,
        }),
      };
      const updates: Partial<UserPreferences> = { theme: 'dark' };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (getDoc as MockedFunction<typeof getDoc>).mockResolvedValue(mockDocSnap as any);
      (updateDoc as MockedFunction<typeof updateDoc>).mockResolvedValue(undefined);

      await updateUserPreferences(mockUserId, updates);

      expect(doc).toHaveBeenCalledWith(db, USERS_COLLECTION_NAME, mockUserId);
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should throw error when profile does not exist', async () => {
      const mockDocRef = { id: mockUserId };
      const mockDocSnap = {
        exists: () => false,
      };
      const updates: Partial<UserPreferences> = { theme: 'dark' };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (getDoc as MockedFunction<typeof getDoc>).mockResolvedValue(mockDocSnap as any);

      await expect(updateUserPreferences(mockUserId, updates)).rejects.toThrow(
        'User profile not found'
      );
    });

    it('should handle Firestore errors', async () => {
      const mockDocRef = { id: mockUserId };
      const error = new FirestoreError('firestore/permission-denied', 'Permission denied');
      const updates: Partial<UserPreferences> = { theme: 'dark' };

      (doc as MockedFunction<typeof doc>).mockReturnValue(mockDocRef as any);
      (getDoc as MockedFunction<typeof getDoc>).mockRejectedValue(error);

      await expect(updateUserPreferences(mockUserId, updates)).rejects.toThrow(
        'Failed to update user preferences'
      );
    });
  });

  describe('deleteUserSessions', () => {
    it('should delete all user sessions from Firestore', async () => {
      const mockSession1 = { id: 'session-1' };
      const mockSession2 = { id: 'session-2' };
      const mockQuerySnapshot = {
        docs: [
          { id: 'session-1', ref: mockSession1 },
          { id: 'session-2', ref: mockSession2 },
        ],
      };

      (collection as MockedFunction<typeof collection>).mockReturnValue({} as any);
      (query as MockedFunction<typeof query>).mockReturnValue({} as any);
      (where as MockedFunction<typeof where>).mockReturnValue({} as any);
      (getDocs as MockedFunction<typeof getDocs>).mockResolvedValue(mockQuerySnapshot as any);
      (doc as MockedFunction<typeof doc>).mockReturnValue({} as any);
      (deleteDoc as MockedFunction<typeof deleteDoc>).mockResolvedValue(undefined);

      await deleteUserSessions(mockUserId);

      expect(collection).toHaveBeenCalledWith(db, SESSION_COLLECTION_NAME);
      expect(getDocs).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalledTimes(2);
    });

    it('should handle empty session list', async () => {
      const mockQuerySnapshot = {
        docs: [],
      };

      (collection as MockedFunction<typeof collection>).mockReturnValue({} as any);
      (query as MockedFunction<typeof query>).mockReturnValue({} as any);
      (where as MockedFunction<typeof where>).mockReturnValue({} as any);
      (getDocs as MockedFunction<typeof getDocs>).mockResolvedValue(mockQuerySnapshot as any);

      await deleteUserSessions(mockUserId);

      expect(deleteDoc).not.toHaveBeenCalled();
    });

    it('should handle Firestore errors', async () => {
      const error = new FirestoreError('firestore/permission-denied', 'Permission denied');

      (collection as MockedFunction<typeof collection>).mockReturnValue({} as any);
      (query as MockedFunction<typeof query>).mockReturnValue({} as any);
      (where as MockedFunction<typeof where>).mockReturnValue({} as any);
      (getDocs as MockedFunction<typeof getDocs>).mockRejectedValue(error);

      await expect(deleteUserSessions(mockUserId)).rejects.toThrow(
        'Failed to delete user sessions'
      );
    });
  });
});

