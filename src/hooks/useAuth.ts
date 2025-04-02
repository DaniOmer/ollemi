import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  selectAuthLoading,
  selectAuthError,
  logout,
  setUser,
} from "@/lib/redux/slices/authSlice";
import { selectUserProfile } from "@/lib/redux/slices/userSlice";
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
  const user = useAppSelector(selectUserProfile);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check token expiration and refresh if needed
  const checkAndRefreshToken = useCallback(async () => {
    try {
      // Call token refresh endpoint
      const response = await httpClientPrivate.post("/auth/refresh");

      if (response.status === 200 && response.data.authenticated) {
        // Reset the timer for the next refresh
        setupRefreshTimer();
        return true;
      } else {
        // If refresh fails, force logout
        await handleLogout();
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      // If refresh fails, force logout
      await handleLogout();
      return false;
    }
  }, []);

  // Setup token refresh
  const setupRefreshTimer = useCallback(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Set a timer to refresh tokens 50 minutes after authentication (before the 60-minute expiry)
    refreshTimerRef.current = setTimeout(async () => {
      await checkAndRefreshToken();
    }, 50 * 60 * 1000); // 50 minutes
  }, [checkAndRefreshToken]);

  // Check session status on mount and when browser tab becomes visible
  const checkSessionStatus = useCallback(async (): Promise<boolean> => {
    try {
      // If we already have a user in the Redux store, just setup refresh timer
      if (user) {
        setupRefreshTimer();
        setIsAuthenticated(true);
        setIsSessionChecked(true);
        return true;
      }

      // Otherwise, validate session with the server
      const response = await httpClientPrivate.get("/auth/session");
      if (response.status === 200 && response.data.authenticated) {
        // Update Redux store with user data
        dispatch(
          setUser({
            ...response.data.user,
          })
        );

        // Check if we need to refresh the token and setup refresh timer
        await checkAndRefreshToken();

        setIsAuthenticated(true);
        setIsSessionChecked(true);
        return true;
      } else {
        setIsAuthenticated(false);
        setIsSessionChecked(true);
        return false;
      }
    } catch (error) {
      console.error("Session check error:", error);
      setIsAuthenticated(false);
      setIsSessionChecked(true);
      return false;
    }
  }, [user, dispatch, setupRefreshTimer, checkAndRefreshToken]);

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
