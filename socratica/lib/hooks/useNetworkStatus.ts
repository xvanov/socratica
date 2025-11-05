"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect network status (online/offline)
 * Uses Navigator.onLine API and online/offline events
 * @returns isOnline - boolean indicating if device is online
 */
export function useNetworkStatus(): boolean {
  // Always initialize to true to ensure server/client hydration match
  // The actual network status will be set in useEffect after mount
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Set initial status after mount to avoid hydration mismatch
    setIsOnline(navigator.onLine);

    // Handle online event
    const handleOnline = () => {
      setIsOnline(true);
    };

    // Handle offline event
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
