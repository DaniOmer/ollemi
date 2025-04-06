"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

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
 * 4. Verifies authentication on route changes
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const { checkSessionStatus } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

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

  // Verify authentication on route changes
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkSessionStatus();
      } catch (error) {
        console.error("Failed to check session on route change:", error);
      }
    };

    // Only run on public pages, not on auth pages
    if (
      isInitialized &&
      !pathname?.includes("/login") &&
      !pathname?.includes("/signup")
    ) {
      verifyAuth();
    }
  }, [pathname, checkSessionStatus, isInitialized]);

  // Render children once auth is initialized
  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
