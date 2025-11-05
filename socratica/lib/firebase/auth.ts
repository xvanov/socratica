/**
 * Firebase Auth service functions
 * Provides authentication methods using Firebase Auth Google Sign-In provider
 */

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  UserCredential,
  updateProfile as firebaseUpdateProfile,
  deleteUser as firebaseDeleteUser,
  setPersistence,
  browserLocalPersistence,
  AuthError,
  Unsubscribe,
} from "firebase/auth";
import app from "./config";

// Initialize and export Firebase Auth instance
export const auth = getAuth(app);

// Configure persistence to browserLocalPersistence for session persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Maps Firebase Auth errors to user-friendly error messages
 */
function mapAuthError(error: AuthError): string {
  switch (error.code) {
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled. Please try again.";
    case "auth/popup-blocked":
      return "Pop-up was blocked by your browser. Please allow pop-ups and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for sign-in. Please contact support.";
    case "auth/operation-not-allowed":
      return "Google Sign-In is not enabled. Please contact support.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
      return "User account not found. Please sign in again.";
    case "auth/wrong-password":
      return "Invalid credentials. Please try again.";
    case "auth/invalid-credential":
      return "Invalid credentials. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/requires-recent-login":
      return "Please sign in again to complete this action.";
    default:
      return error.message || "An error occurred during authentication. Please try again.";
  }
}

/**
 * Signs in with Google provider using popup
 * @returns Promise resolving to UserCredential on success
 * @throws Error with user-friendly message on failure
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    const authError = error as AuthError;
    const friendlyMessage = mapAuthError(authError);
    throw new Error(friendlyMessage);
  }
}

/**
 * Signs out the current user
 * @returns Promise resolving when sign-out completes
 * @throws Error if sign-out fails
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    const friendlyMessage = mapAuthError(authError);
    throw new Error(friendlyMessage);
  }
}

/**
 * Sets up an observer for authentication state changes
 * @param callback - Function called when auth state changes
 * @returns Unsubscribe function to stop listening
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void
): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Gets the current authenticated user
 * @returns Current User object or null if not authenticated
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Updates the current user's profile (displayName, photoURL)
 * @param updates - Profile updates object
 * @throws Error if update fails or user is not authenticated
 */
export async function updateAuthProfile(updates: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in.");
  }

  try {
    await firebaseUpdateProfile(user, updates);
  } catch (error) {
    const authError = error as AuthError;
    const friendlyMessage = mapAuthError(authError);
    throw new Error(friendlyMessage);
  }
}

/**
 * Deletes the current user's Firebase Auth account
 * @throws Error if deletion fails or user is not authenticated
 */
export async function deleteAuthUser(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in.");
  }

  try {
    await firebaseDeleteUser(user);
  } catch (error) {
    const authError = error as AuthError;
    const friendlyMessage = mapAuthError(authError);
    throw new Error(friendlyMessage);
  }
}

