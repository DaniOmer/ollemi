import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { useEffect, useState, useCallback } from "react";
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
      return false;
    }
  }, [dispatch, user]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      setIsAuthenticated(false);
      // Get locale from path for proper redirect
      const locale = window.location.pathname.split("/")[1] || "fr";
      router.push(`/${locale}/login`);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [dispatch, router]);

  // Check session status on initial load
  useEffect(() => {
    if (!isSessionChecked) {
      checkSessionStatus().then(() => {
        setIsSessionChecked(true);
      });
    }
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
