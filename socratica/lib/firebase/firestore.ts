import { getFirestore, enableNetwork, waitForPendingWrites } from "firebase/firestore";
import app from "./config";

// Initialize and export Firestore instance
export const db = getFirestore(app);

// Ensure Firestore network is enabled explicitly
// This prevents "client is offline" errors that can occur when Firestore
// defaults to offline mode or hasn't connected yet
if (typeof window !== "undefined") {
  // Enable network asynchronously - don't block initialization
  enableNetwork(db)
    .then(() => {
      console.log("Firestore network enabled");
    })
    .catch((error) => {
      console.error("Error enabling Firestore network:", error);
      // Non-critical error - Firestore will still work, just might start offline
    });
}

/**
 * Helper function to wait for Firestore to be ready
 * Returns a promise that resolves when Firestore is online
 */
export async function waitForFirestoreReady(): Promise<void> {
  try {
    // Try to enable network if not already enabled
    await enableNetwork(db);
    // Small delay to allow network to establish
    await new Promise(resolve => setTimeout(resolve, 500));
    // Wait for any pending writes to ensure connection is established
    await waitForPendingWrites(db);
  } catch (error) {
    console.warn("Firestore may not be ready:", error);
    // Don't throw - allow operation to proceed anyway
    // Small delay even if there's an error, to give network time
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}





