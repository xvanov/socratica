"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect network status (online/offline)
 * Uses Navigator.onLine API and online/offline events
 * @returns isOnline - boolean indicating if device is online
 */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    // Set initial status
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
