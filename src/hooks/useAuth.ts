import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  selectUser,
  selectAuthLoading,
  selectAuthError,
  logout,
  setUser,
} from "@/lib/redux/slices/authSlice";
import { httpClientPrivate } from "@/lib/services/api";
import { useRouter } from "next/navigation";

interface AuthStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  error: string | null;
}

export function useAuth(): AuthStatus & {
  logout: () => Promise<void>;
  checkSessionStatus: () => Promise<boolean>;
} {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup token refresh
  const setupRefreshTimer = useCallback(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Set a timer to refresh tokens 14 minutes after authentication (before the 15-minute expiry)
    refreshTimerRef.current = setTimeout(async () => {
      try {
        // Call token refresh endpoint
        const response = await httpClientPrivate.post("/auth/refresh");

        if (response.status === 200 && response.data.authenticated) {
          // Reset the timer for the next refresh
          setupRefreshTimer();
        } else {
          // If refresh fails, force logout
          await handleLogout();
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        // If refresh fails, force logout
        await handleLogout();
      }
    }, 14 * 60 * 1000); // 14 minutes
  }, []);

  // Check the user's session status with the server
  const checkSessionStatus = useCallback(async (): Promise<boolean> => {
    try {
      // Try to hit the session endpoint which uses HTTP-only cookies
      const response = await httpClientPrivate.get("/auth/session");

      if (response.status === 200 && response.data.authenticated) {
        // Update Redux store with user info if different
        if (!user || user.id !== response.data.user.id) {
          dispatch(setUser(response.data.user));
        }
        setIsAuthenticated(true);

        // Setup refresh timer when session is valid
        setupRefreshTimer();

        return true;
      } else {
        setIsAuthenticated(false);
        if (user) {
          // Clear user from Redux if server says not authenticated
          dispatch(setUser(null));
        }
        return false;
      }
    } catch (error) {
      console.error("Session validation error:", error);
      setIsAuthenticated(false);
      if (user) {
        dispatch(setUser(null));
      }
      return false;
    }
  }, [dispatch, user, setupRefreshTimer]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      // Clear refresh timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      await dispatch(logout()).unwrap();
      setIsAuthenticated(false);
      // Get locale from path for proper redirect
      const locale = window.location.pathname.split("/")[1] || "fr";
      router.push(`/${locale}/login`);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout API fails, clear local state
      setIsAuthenticated(false);
      dispatch(setUser(null));
    }
  }, [dispatch, router]);

  // Check session status on initial load
  useEffect(() => {
    if (!isSessionChecked) {
      checkSessionStatus().then(() => {
        setIsSessionChecked(true);
      });
    }

    // Cleanup function to clear the refresh timer
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [isSessionChecked, checkSessionStatus]);

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    logout: handleLogout,
    checkSessionStatus,
  };
}
