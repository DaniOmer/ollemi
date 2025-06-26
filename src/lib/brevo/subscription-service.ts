import { getBrevoClient } from "./client";
import {
  sendSubscriptionExpiredEmail,
  sendSubscriptionExpiryWarning,
} from "./templates";
import { SubscriptionDetails } from "./types";

export class SubscriptionEmailService {
  private brevoClient = getBrevoClient();

  /**
   * Envoie un email d'abonnement expiré
   */
  async notifySubscriptionExpired({
    userEmail,
    userName,
    planName,
    expirationDate,
    renewalUrl,
    supportUrl,
    gracePeriodDays,
  }: {
    userEmail: string;
    userName: string;
    planName: string;
    expirationDate: string;
    renewalUrl: string;
    supportUrl?: string;
    gracePeriodDays?: number;
  }) {
    const subscriptionDetails: SubscriptionDetails = {
      userName,
      planName,
      expirationDate,
      renewalUrl,
      supportUrl,
      gracePeriodDays,
    };

    try {
      const result = await sendSubscriptionExpiredEmail(
        this.brevoClient,
        userEmail,
        subscriptionDetails
      );

      console.log(`Email d'expiration envoyé avec succès à ${userEmail}`, {
        messageId: result.messageId,
        planName,
        expirationDate,
      });

      return result;
    } catch (error) {
      console.error(
        `Erreur lors de l'envoi de l'email d'expiration à ${userEmail}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Envoie un rappel avant expiration
   */
  async sendExpiryWarning({
    userEmail,
    userName,
    planName,
    expirationDate,
    renewalUrl,
    daysLeft,
    supportUrl,
  }: {
    userEmail: string;
    userName: string;
    planName: string;
    expirationDate: string;
    renewalUrl: string;
    daysLeft: number;
    supportUrl?: string;
  }) {
    const subscriptionDetails: SubscriptionDetails = {
      userName,
      planName,
      expirationDate,
      renewalUrl,
      supportUrl,
    };

    try {
      const result = await sendSubscriptionExpiryWarning(
        this.brevoClient,
        userEmail,
        subscriptionDetails,
        daysLeft
      );

      console.log(`Rappel d'expiration envoyé avec succès à ${userEmail}`, {
        messageId: result.messageId,
        planName,
        daysLeft,
      });

      return result;
    } catch (error) {
      console.error(`Erreur lors de l'envoi du rappel à ${userEmail}:`, error);
      throw error;
    }
  }

  /**
   * Traite une liste d'abonnements expirés
   */
  async processExpiredSubscriptions(
    expiredSubscriptions: Array<{
      userEmail: string;
      userName: string;
      planName: string;
      expirationDate: string;
      renewalUrl: string;
      supportUrl?: string;
      gracePeriodDays?: number;
    }>
  ) {
    const results = [];
    const errors = [];

    for (const subscription of expiredSubscriptions) {
      try {
        const result = await this.notifySubscriptionExpired(subscription);
        results.push({
          email: subscription.userEmail,
          success: true,
          messageId: result.messageId,
        });
      } catch (error) {
        errors.push({
          email: subscription.userEmail,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      sent: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  /**
   * Traite les rappels d'expiration (7 jours, 3 jours, 1 jour avant expiration)
   */
  async processExpiryWarnings(
    warningSubscriptions: Array<{
      userEmail: string;
      userName: string;
      planName: string;
      expirationDate: string;
      renewalUrl: string;
      daysLeft: number;
      supportUrl?: string;
    }>
  ) {
    const results = [];
    const errors = [];

    for (const subscription of warningSubscriptions) {
      try {
        const result = await this.sendExpiryWarning(subscription);
        results.push({
          email: subscription.userEmail,
          success: true,
          messageId: result.messageId,
          daysLeft: subscription.daysLeft,
        });
      } catch (error) {
        errors.push({
          email: subscription.userEmail,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          daysLeft: subscription.daysLeft,
        });
      }
    }

    return {
      sent: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }
}

// Instance par défaut
export const subscriptionEmailService = new SubscriptionEmailService();

// Fonctions utilitaires pour usage direct
export const subscriptionNotifications = {
  /**
   * Fonction simple pour notifier un abonnement expiré
   */
  async notifyExpired(
    userEmail: string,
    subscriptionData: {
      userName: string;
      planName: string;
      expirationDate: string;
      renewalUrl: string;
      supportUrl?: string;
      gracePeriodDays?: number;
    }
  ) {
    return subscriptionEmailService.notifySubscriptionExpired({
      userEmail,
      ...subscriptionData,
    });
  },

  /**
   * Fonction simple pour envoyer un rappel
   */
  async sendWarning(
    userEmail: string,
    subscriptionData: {
      userName: string;
      planName: string;
      expirationDate: string;
      renewalUrl: string;
      daysLeft: number;
      supportUrl?: string;
    }
  ) {
    return subscriptionEmailService.sendExpiryWarning({
      userEmail,
      ...subscriptionData,
    });
  },
};
