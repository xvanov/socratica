/**
 * User profile Firestore service functions
 * Handles CRUD operations for user profiles and preferences
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
  FirestoreError,
  DocumentData,
} from 'firebase/firestore';
import { db, waitForFirestoreReady } from './firestore';
import type { UserProfile, UserPreferences } from '@/lib/types/user';
import { USERS_COLLECTION_NAME } from '@/lib/types/user';
import { SESSION_COLLECTION_NAME } from '@/types/session';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const USERS_COLLECTION_NAME_CONST = USERS_COLLECTION_NAME;

/**
 * Converts Firestore document to UserProfile object
 */
function firestoreDocToUserProfile(docId: string, data: DocumentData): UserProfile {
  return {
    userId: docId,
    email: data.email || '',
    displayName: data.displayName || '',
    photoURL: data.photoURL || undefined,
    preferences: data.preferences || {},
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : typeof data.createdAt === 'string'
          ? data.createdAt
          : new Date().toISOString(),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : typeof data.updatedAt === 'string'
          ? data.updatedAt
          : new Date().toISOString(),
  };
}

/**
 * Converts UserProfile object to Firestore document data
 */
function userProfileToFirestoreData(profile: Partial<UserProfile>): Record<string, unknown> {
  const data: Record<string, unknown> = {
    email: profile.email || '',
    displayName: profile.displayName || '',
    preferences: profile.preferences || {},
  };

  if (profile.photoURL !== undefined) {
    data.photoURL = profile.photoURL;
  }

  // Handle timestamps
  if (profile.createdAt) {
    data.createdAt =
      typeof profile.createdAt === 'string'
        ? Timestamp.fromDate(new Date(profile.createdAt))
        : profile.createdAt;
  } else {
    data.createdAt = serverTimestamp();
  }

  if (profile.updatedAt) {
    data.updatedAt =
      typeof profile.updatedAt === 'string'
        ? Timestamp.fromDate(new Date(profile.updatedAt))
        : profile.updatedAt;
  } else {
    data.updatedAt = serverTimestamp();
  }

  return data;
}

/**
 * Fetches user profile from Firestore
 * @param userId - Firebase Auth UID
 * @returns UserProfile object or null if not found
 * @throws Error if Firestore operation fails
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION_NAME, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return firestoreDocToUserProfile(userSnap.id, userSnap.data());
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(`Failed to fetch user profile: ${firestoreError.message}`);
  }
}

/**
 * Creates user profile document in Firestore on first sign-in
 * @param user - Firebase Auth User object
 * @throws Error if Firestore operation fails
 */
export async function createUserProfile(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): Promise<void> {
  try {
    // Wait for Firestore to be ready before attempting operations
    await waitForFirestoreReady();
    
    const userRef = doc(db, USERS_COLLECTION_NAME_CONST, user.uid);
    
    // Check if profile already exists (with retry logic for offline errors)
    let userSnap;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        userSnap = await getDoc(userRef);
        break; // Success, exit retry loop
      } catch (getDocError) {
        const firestoreError = getDocError as FirestoreError;
        retries++;
        
        // If offline error and we haven't exhausted retries, wait and retry
        const errorMessage = firestoreError.message?.toLowerCase() || '';
        const errorCode = firestoreError.code || '';
        const isOfflineError = 
          errorCode === 'unavailable' ||
          errorCode === 'failed-precondition' ||
          errorMessage.includes('offline') ||
          errorMessage.includes('failed to get document') ||
          errorMessage.includes('client is offline');
        
        if (isOfflineError && retries < maxRetries) {
          console.warn(`Firestore offline, retrying (${retries}/${maxRetries})...`);
          // Wait for Firestore to be ready again before retrying
          await waitForFirestoreReady();
          // Exponential backoff: 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, retries - 1)));
        } else {
          throw firestoreError;
        }
      }
    }

    // Don't overwrite existing profile
    if (userSnap && userSnap.exists()) {
      return;
    }

    const profileData: Partial<UserProfile> = {
      userId: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || undefined,
      preferences: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create profile (with retry logic for offline errors)
    retries = 0;
    while (retries < maxRetries) {
      try {
        await setDoc(userRef, userProfileToFirestoreData(profileData));
        break; // Success, exit retry loop
      } catch (setDocError) {
        const firestoreError = setDocError as FirestoreError;
        retries++;
        
        // If offline error and we haven't exhausted retries, wait and retry
        const errorMessage = firestoreError.message?.toLowerCase() || '';
        const errorCode = firestoreError.code || '';
        const isOfflineError = 
          errorCode === 'unavailable' ||
          errorCode === 'failed-precondition' ||
          errorMessage.includes('offline') ||
          errorMessage.includes('failed to get document') ||
          errorMessage.includes('failed to set document') ||
          errorMessage.includes('client is offline');
        
        if (isOfflineError && retries < maxRetries) {
          console.warn(`Firestore offline, retrying profile creation (${retries}/${maxRetries})...`);
          // Wait for Firestore to be ready again before retrying
          await waitForFirestoreReady();
          // Exponential backoff: 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, retries - 1)));
        } else {
          throw firestoreError;
        }
      }
    }
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(`Failed to create user profile: ${firestoreError.message}`);
  }
}

/**
 * Updates user profile fields in Firestore
 * @param userId - Firebase Auth UID
 * @param updates - Partial UserProfile with fields to update
 * @throws Error if Firestore operation fails
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION_NAME, userId);
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Remove userId from updates (it's the document ID)
    delete updateData.userId;

    // Convert timestamps if present
    if (updateData.createdAt && typeof updateData.createdAt === 'string') {
      updateData.createdAt = Timestamp.fromDate(new Date(updateData.createdAt));
    }
    if (updateData.updatedAt && typeof updateData.updatedAt === 'string') {
      updateData.updatedAt = serverTimestamp();
    }

    await updateDoc(userRef, updateData);
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(`Failed to update user profile: ${firestoreError.message}`);
  }
}

/**
 * Deletes user profile document from Firestore
 * @param userId - Firebase Auth UID
 * @throws Error if Firestore operation fails
 */
export async function deleteUserProfile(userId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION_NAME, userId);
    await deleteDoc(userRef);
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(`Failed to delete user profile: ${firestoreError.message}`);
  }
}

/**
 * Fetches user preferences from Firestore user profile document
 * @param userId - Firebase Auth UID
 * @returns UserPreferences object (defaults to empty object if not found)
 * @throws Error if Firestore operation fails
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    const profile = await getUserProfile(userId);
    return profile?.preferences || {};
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(`Failed to fetch user preferences: ${firestoreError.message}`);
  }
}

/**
 * Updates user preferences in Firestore user profile document
 * @param userId - Firebase Auth UID
 * @param preferences - Partial UserPreferences with fields to update
 * @throws Error if Firestore operation fails
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION_NAME, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User profile not found');
    }

    const currentData = userSnap.data();
    const currentPreferences = (currentData.preferences || {}) as UserPreferences;
    const updatedPreferences = { ...currentPreferences, ...preferences };

    await updateDoc(userRef, {
      preferences: updatedPreferences,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(`Failed to update user preferences: ${firestoreError.message}`);
  }
}

/**
 * Deletes all user sessions from Firestore
 * Used during account deletion
 * @param userId - Firebase Auth UID
 * @throws Error if Firestore operation fails
 */
export async function deleteUserSessions(userId: string): Promise<void> {
  try {
    const sessionsRef = collection(db, SESSION_COLLECTION_NAME);
    const q = query(sessionsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((docSnapshot) =>
      deleteDoc(doc(db, SESSION_COLLECTION_NAME, docSnapshot.id))
    );

    await Promise.all(deletePromises);
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(`Failed to delete user sessions: ${firestoreError.message}`);
  }
}

