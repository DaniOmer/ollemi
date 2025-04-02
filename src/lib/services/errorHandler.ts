/**
 * Service centralisé pour la gestion des erreurs d'authentification
 *
 * Ce service fournit des fonctions et des types pour gérer de manière cohérente
 * les erreurs d'authentification dans toute l'application.
 */

export enum AuthErrorType {
  INVALID_CREDENTIALS = "invalid_credentials",
  SESSION_EXPIRED = "session_expired",
  NETWORK_ERROR = "network_error",
  PERMISSION_DENIED = "permission_denied",
  TOKEN_REFRESH_FAILED = "token_refresh_failed",
  UNKNOWN = "unknown",
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  originalError?: any;
}

/**
 * Fonction pour gérer les erreurs d'authentification
 *
 * Cette fonction analyse l'erreur et retourne un objet AuthError standardisé
 * avec un type et un message appropriés.
 *
 * @param error - L'erreur à analyser
 * @returns Un objet AuthError standardisé
 */
export function handleAuthError(error: any): AuthError {
  // Erreurs de session expirée (401)
  if (error?.response?.status === 401) {
    return {
      type: AuthErrorType.SESSION_EXPIRED,
      message: "Votre session a expiré. Veuillez vous reconnecter.",
      originalError: error,
    };
  }

  // Erreurs de permission (403)
  if (error?.response?.status === 403) {
    return {
      type: AuthErrorType.PERMISSION_DENIED,
      message: "Vous n'avez pas les permissions nécessaires pour cette action.",
      originalError: error,
    };
  }

  // Erreurs réseau
  if (error?.message?.includes("Network Error")) {
    return {
      type: AuthErrorType.NETWORK_ERROR,
      message:
        "Problème de connexion. Veuillez vérifier votre connexion internet.",
      originalError: error,
    };
  }

  // Erreurs d'identifiants invalides
  if (
    error?.message?.includes("Invalid login credentials") ||
    error?.message?.includes("Invalid email or password")
  ) {
    return {
      type: AuthErrorType.INVALID_CREDENTIALS,
      message: "Email ou mot de passe incorrect.",
      originalError: error,
    };
  }

  // Erreurs de rafraîchissement de token
  if (
    error?.message?.includes("refresh token") ||
    error?.message?.includes("Failed to refresh")
  ) {
    return {
      type: AuthErrorType.TOKEN_REFRESH_FAILED,
      message:
        "Impossible de renouveler votre session. Veuillez vous reconnecter.",
      originalError: error,
    };
  }

  // Erreur par défaut
  return {
    type: AuthErrorType.UNKNOWN,
    message: "Une erreur inattendue s'est produite.",
    originalError: error,
  };
}

/**
 * Fonction pour obtenir un message d'erreur localisé
 *
 * Cette fonction retourne un message d'erreur adapté à l'utilisateur
 * en fonction du type d'erreur.
 *
 * @param error - L'erreur à analyser
 * @param locale - La locale pour la traduction (non implémentée)
 * @returns Un message d'erreur localisé
 */
export function getLocalizedErrorMessage(
  error: AuthError | any,
  locale: string = "fr"
): string {
  // Si l'erreur est déjà un AuthError, utiliser son message
  if (error.type && Object.values(AuthErrorType).includes(error.type)) {
    return error.message;
  }

  // Sinon, traiter l'erreur et obtenir un message standardisé
  const standardizedError = handleAuthError(error);
  return standardizedError.message;
}

/**
 * Fonction pour journaliser les erreurs d'authentification
 *
 * Cette fonction journalise les erreurs d'authentification de manière standardisée.
 * Dans un environnement de production, elle pourrait envoyer les erreurs à un service
 * de surveillance comme Sentry.
 *
 * @param error - L'erreur à journaliser
 * @param context - Contexte supplémentaire pour la journalisation
 */
export function logAuthError(
  error: any,
  context: Record<string, any> = {}
): void {
  const standardizedError =
    error.type && Object.values(AuthErrorType).includes(error.type)
      ? error
      : handleAuthError(error);

  console.error(
    `[Auth Error] Type: ${standardizedError.type}, Message: ${standardizedError.message}`,
    {
      context,
      originalError: standardizedError.originalError,
    }
  );

  // Dans un environnement de production, vous pourriez ajouter ici
  // l'envoi de l'erreur à un service comme Sentry
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(standardizedError.originalError || standardizedError, {
  //     tags: { type: standardizedError.type },
  //     extra: { ...context }
  //   });
  // }
}
