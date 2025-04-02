"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state across the application
 *
 * This provider:
 * 1. Checks for an active session on initial load
 * 2. Sets up token refresh mechanism
 * 3. Provides auth status to the app
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const { checkSessionStatus } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Check authentication status on first load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Validate session with the server
        await checkSessionStatus();
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    // Revalidate session after browser tab becomes visible again
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        try {
          await checkSessionStatus();
        } catch (error) {
          console.error("Failed to check session on visibility change:", error);
        }
      }
    };

    // Add event listener for tab focus/visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Add event listener for network reconnection
    window.addEventListener("online", handleVisibilityChange);

    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleVisibilityChange);
    };
  }, [checkSessionStatus]);

  // Render children once auth is initialized
  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
