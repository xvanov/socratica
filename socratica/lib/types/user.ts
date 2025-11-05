/**
 * User-related type definitions
 * Defines user profile data model and authentication state interfaces
 */

/**
 * User preferences interface
 * Extensible preferences for user customization
 */
export interface UserPreferences {
  /** Theme preference: light, dark, or system default */
  theme?: "light" | "dark" | "system";
  /** Whether to enable notifications */
  notifications?: boolean;
  /** Difficulty level preference (future Epic 10) */
  difficultyLevel?: string;
}

/**
 * User profile interface
 * Represents user profile data stored in Firestore
 */
export interface UserProfile {
  /** Firebase Auth UID (document ID) */
  userId: string;
  /** User email from Firebase Auth */
  email: string;
  /** Display name (editable, from Firebase Auth) */
  displayName: string;
  /** Profile photo URL (from Google account or custom) */
  photoURL?: string;
  /** User preferences */
  preferences: UserPreferences;
  /** ISO 8601 timestamp (UTC) when profile was created */
  createdAt: string;
  /** ISO 8601 timestamp (UTC) when profile was last updated */
  updatedAt: string;
}

/**
 * Authentication state interface
 * Represents current authentication state
 */
export interface AuthState {
  /** Firebase Auth User object or null if not authenticated */
  user: import("firebase/auth").User | null;
  /** Whether authentication state is being initialized */
  loading: boolean;
  /** Authentication error message if any */
  error: string | null;
}

/**
 * Auth context value interface
 * Provides authentication state and methods to components
 */
export interface AuthContextValue extends AuthState {
  /** Sign in with Google provider */
  signIn: () => Promise<void>;
  /** Sign out current user */
  signOut: () => Promise<void>;
  /** Update user profile (displayName, photoURL) */
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  /** Delete user account and all associated data */
  deleteAccount: () => Promise<void>;
}

/**
 * Firestore collection name for users
 */
export const USERS_COLLECTION_NAME = "users";

