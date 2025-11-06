/**
 * Whiteboard Firestore service functions
 * Handles real-time synchronization and persistence for whiteboard state
 * Requires Firebase authentication - uses Firebase Auth user ID
 */

import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  serverTimestamp,
  FirestoreError,
  Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firestore";
import {
  Session,
  SESSION_COLLECTION_NAME,
} from "@/types/session";
import { WhiteboardState, WhiteboardElement } from "@/types/whiteboard";

/**
 * Maximum number of whiteboard elements to prevent performance issues
 */
export const MAX_WHITEBOARD_ELEMENTS = 1000;

/**
 * Debounce delay for pen tool updates (milliseconds)
 */
export const PEN_TOOL_DEBOUNCE_MS = 500;

/**
 * Firestore document structure for whiteboard state (stored in session document):
 * {
 *   whiteboardState: {
 *     elements: WhiteboardElement[],
 *     currentTool: ToolType,
 *     currentColor: string,
 *     strokeWidth: number,
 *     gridVisible: boolean,
 *     gridSpacing: number,
 *     lastUpdated: Timestamp,
 *     version: number (for conflict resolution)
 *   }
 * }
 */

/**
 * Subscribes to real-time whiteboard state updates for a session
 * @param sessionId - Session document ID
 * @param callback - Callback function called with updated whiteboard state
 * @returns Unsubscribe function to stop listening
 * @throws Error if Firestore operation fails
 */
export function subscribeToWhiteboardState(
  sessionId: string,
  callback: (state: WhiteboardState | null) => void
): Unsubscribe {
  try {
    const sessionRef = doc(db, SESSION_COLLECTION_NAME, sessionId);

    const unsubscribe = onSnapshot(
      sessionRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          callback(null);
          return;
        }

        const data = snapshot.data();
        const whiteboardState = data.whiteboardState as WhiteboardState | undefined;

        if (whiteboardState) {
          callback(whiteboardState);
        } else {
          callback(null);
        }
      },
      (error: FirestoreError) => {
        console.error("Error subscribing to whiteboard state:", error);
        // Don't throw - let caller handle error recovery
        callback(null);
      }
    );

    return unsubscribe;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(
      `Failed to subscribe to whiteboard state: ${firestoreError.message}`
    );
  }
}

/**
 * Saves whiteboard state to Firestore session document
 * @param sessionId - Session document ID
 * @param userId - Firebase Auth UID (for authorization check)
 * @param state - Whiteboard state to save
 * @throws Error if Firestore operation fails or user doesn't have permission
 */
export async function saveWhiteboardState(
  sessionId: string,
  userId: string,
  state: WhiteboardState
): Promise<void> {
  try {
    // Validate element count limit
    if (state.elements.length > MAX_WHITEBOARD_ELEMENTS) {
      throw new Error(
        `Whiteboard state exceeds maximum element limit (${MAX_WHITEBOARD_ELEMENTS})`
      );
    }

    const sessionRef = doc(db, SESSION_COLLECTION_NAME, sessionId);

    // Verify session exists and belongs to user before updating
    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) {
      throw new Error("Session not found");
    }

    const sessionData = sessionDoc.data();
    if (sessionData.userId !== userId) {
      throw new Error("You don't have permission to update this session");
    }

    // Get current version for conflict resolution
    const currentWhiteboardState = sessionData.whiteboardState as
      | (WhiteboardState & { version?: number })
      | undefined;
    const currentVersion = (currentWhiteboardState as any)?.version || 0;

    // Update whiteboard state with version increment
    await updateDoc(sessionRef, {
      whiteboardState: {
        ...state,
        lastUpdated: serverTimestamp(),
        version: currentVersion + 1,
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error("Firestore save error:", {
      code: firestoreError.code,
      message: firestoreError.message,
      stack: firestoreError.stack,
    });
    throw new Error(
      `Failed to save whiteboard state: ${firestoreError.message || firestoreError.code || "Unknown error"}`
    );
  }
}

/**
 * Loads whiteboard state from Firestore session document
 * @param sessionId - Session document ID
 * @returns Whiteboard state or null if not found
 * @throws Error if Firestore operation fails
 */
export async function loadWhiteboardState(
  sessionId: string
): Promise<WhiteboardState | null> {
  try {
    const sessionRef = doc(db, SESSION_COLLECTION_NAME, sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      return null;
    }

    const data = sessionDoc.data();
    const whiteboardState = data.whiteboardState as (WhiteboardState & { version?: number; lastUpdated?: Timestamp }) | undefined;

    if (!whiteboardState) {
      return null;
    }

    // Return whiteboard state (version and lastUpdated are internal metadata)
    const { version, lastUpdated, ...state } = whiteboardState;
    return state as WhiteboardState;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(
      `Failed to load whiteboard state: ${firestoreError.message}`
    );
  }
}

/**
 * Adds a single whiteboard element to the session's whiteboard state
 * Used by AI tutor to add drawings
 * @param sessionId - Session document ID
 * @param userId - Firebase Auth UID (for authorization check)
 * @param element - Whiteboard element to add
 * @throws Error if Firestore operation fails or user doesn't have permission
 */
export async function addWhiteboardElement(
  sessionId: string,
  userId: string,
  element: WhiteboardElement
): Promise<void> {
  try {
    const sessionRef = doc(db, SESSION_COLLECTION_NAME, sessionId);

    // Verify session exists and belongs to user
    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) {
      throw new Error("Session not found");
    }

    const sessionData = sessionDoc.data();
    if (sessionData.userId !== userId) {
      throw new Error("You don't have permission to update this session");
    }

    // Get current whiteboard state
    const currentWhiteboardState = (sessionData.whiteboardState as
      | WhiteboardState
      | undefined) || {
      elements: [],
      currentTool: "pen",
      currentColor: "#000000",
      strokeWidth: 2,
      gridVisible: false,
      gridSpacing: 20,
    };

    // Validate element count limit
    if (currentWhiteboardState.elements.length >= MAX_WHITEBOARD_ELEMENTS) {
      throw new Error(
        `Whiteboard state exceeds maximum element limit (${MAX_WHITEBOARD_ELEMENTS})`
      );
    }

    // Add new element
    const updatedElements = [...currentWhiteboardState.elements, element];

    // Get current version for conflict resolution
    const currentVersion = (currentWhiteboardState as any).version || 0;

    // Update whiteboard state
    await updateDoc(sessionRef, {
      whiteboardState: {
        ...currentWhiteboardState,
        elements: updatedElements,
        lastUpdated: serverTimestamp(),
        version: currentVersion + 1,
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error("Firestore add element error:", {
      code: firestoreError.code,
      message: firestoreError.message,
      stack: firestoreError.stack,
    });
    throw new Error(
      `Failed to add whiteboard element: ${firestoreError.message || firestoreError.code || "Unknown error"}`
    );
  }
}

/**
 * Exports whiteboard state to JSON format
 * @param state - Whiteboard state to export
 * @returns JSON string representation of whiteboard state
 */
export function exportWhiteboardState(state: WhiteboardState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Imports whiteboard state from JSON format
 * @param jsonString - JSON string representation of whiteboard state
 * @returns Whiteboard state object or null if invalid
 * @throws Error if JSON is invalid or state structure is invalid
 */
export function importWhiteboardState(jsonString: string): WhiteboardState {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate structure
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid whiteboard state format");
    }

    if (!Array.isArray(parsed.elements)) {
      throw new Error("Invalid whiteboard state: elements must be an array");
    }

    // Validate required fields
    const state: WhiteboardState = {
      elements: parsed.elements || [],
      currentTool: parsed.currentTool || "pen",
      currentColor: parsed.currentColor || "#000000",
      strokeWidth: parsed.strokeWidth || 2,
      gridVisible: parsed.gridVisible || false,
      gridSpacing: parsed.gridSpacing || 20,
    };

    // Validate element count limit
    if (state.elements.length > MAX_WHITEBOARD_ELEMENTS) {
      throw new Error(
        `Whiteboard state exceeds maximum element limit (${MAX_WHITEBOARD_ELEMENTS})`
      );
    }

    return state;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON format");
    }
    throw error;
  }
}

