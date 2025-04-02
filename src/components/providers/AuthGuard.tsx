"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type AuthGuardProps = {
  children: ReactNode;
  requiredRoles?: string[];
  requireOnboarding?: boolean;
  redirectTo?: string;
  fallback?: ReactNode; // Nouveau: composant à afficher pendant le chargement
};

export default function AuthGuard({
  children,
  requiredRoles = [],
  requireOnboarding = false,
  redirectTo = "/login",
  fallback, // Composant de chargement personnalisable
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    user,
    checkSessionStatus,
    isLoading: authLoading,
  } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Determine locale from pathname
  const getLocale = (path: string) => {
    const segments = path.split("/");
    return segments.length > 1 && segments[1].length === 2 ? segments[1] : "fr";
  };

  const locale = getLocale(pathname);

  useEffect(() => {
    // First check if the session is valid
    const validateSession = async () => {
      try {
        const sessionValid = await checkSessionStatus();

        // If not authenticated, redirect to login
        if (!sessionValid || !isAuthenticated || !user) {
          setAuthError("Authentification requise");
          router.push(`/${locale}${redirectTo}`);
          return;
        }

        // Check if the user has completed onboarding when required
        if (
          requireOnboarding &&
          user.role === "pro" &&
          !user.onboarding_completed
        ) {
          router.push(`/${locale}/onboarding/business-name`);
          return;
        }

        // Check if the user has one of the required roles
        if (
          requiredRoles.length > 0 &&
          !requiredRoles.includes(user.role || "")
        ) {
          setAuthError("Accès non autorisé");
          router.push(`/${locale}/dashboard`);
          return;
        }

        // User is authenticated and authorized
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth validation error:", error);
        setAuthError("Erreur de validation d'authentification");
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      validateSession();
    }
  }, [
    isAuthenticated,
    user,
    router,
    requiredRoles,
    requireOnboarding,
    redirectTo,
    locale,
    checkSessionStatus,
    authLoading,
  ]);

  // Afficher le composant de chargement personnalisé ou un loader par défaut
  if (isLoading || !isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Loader par défaut si aucun fallback n'est fourni
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          {authError ? (
            <p className="text-red-500 mb-2">{authError}</p>
          ) : (
            <p className="text-gray-500 mb-2">
              Vérification de l'authentification...
            </p>
          )}
          <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Render children if authorized
  return <>{children}</>;
}
