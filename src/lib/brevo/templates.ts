import { SubscriptionDetails, BookingDetails } from "./types";

// Templates d'emails prédéfinis
export const emailTemplates = {
  welcome: (userName: string) => ({
    subject: `Bienvenue ${userName} !`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenue</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue !</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${userName},</h2>
            <p>Nous sommes ravis de vous accueillir sur notre plateforme !</p>
            <p>Vous pouvez maintenant profiter de tous nos services et fonctionnalités.</p>
            <p>N'hésitez pas à explorer et à nous contacter si vous avez des questions.</p>
            <p>Cordialement,<br>L'équipe</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  booking_confirmation: (bookingDetails: BookingDetails) => ({
    subject: "Confirmation de votre réservation",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de réservation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; }
          .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
          .detail-row { margin: 10px 0; }
          .detail-label { font-weight: bold; color: #28a745; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Réservation confirmée</h1>
          </div>
          <div class="content">
            <p>Votre réservation a été confirmée avec succès !</p>
            <div class="booking-details">
              <h3>Détails de votre réservation :</h3>
              <div class="detail-row">
                <span class="detail-label">Date :</span> ${bookingDetails.date}
              </div>
              <div class="detail-row">
                <span class="detail-label">Heure :</span> ${bookingDetails.time}
              </div>
              <div class="detail-row">
                <span class="detail-label">Service :</span> ${
                  bookingDetails.service
                }
              </div>
              <div class="detail-row">
                <span class="detail-label">Référence :</span> ${
                  bookingDetails.reference
                }
              </div>
              ${
                bookingDetails.location
                  ? `<div class="detail-row"><span class="detail-label">Lieu :</span> ${bookingDetails.location}</div>`
                  : ""
              }
            </div>
            <p>Nous avons hâte de vous voir ! En cas de questions, n'hésitez pas à nous contacter.</p>
          </div>
          <div class="footer">
            <p>Merci de votre confiance !</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  subscription_expired: (subscriptionDetails: SubscriptionDetails) => ({
    subject: `⚠️ Votre abonnement ${subscriptionDetails.planName} a expiré`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Abonnement expiré</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; }
          .warning-box { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .subscription-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .button { display: inline-block; background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 15px 10px 15px 0; font-weight: bold; }
          .button-secondary { background-color: #6c757d; }
          .button:hover { opacity: 0.9; }
          .urgent { color: #dc3545; font-weight: bold; }
          .benefits-list { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .benefits-list ul { margin: 0; padding-left: 20px; }
          .benefits-list li { margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .grace-period { background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Abonnement expiré</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${subscriptionDetails.userName},</h2>
            
            <div class="warning-box">
              <p class="urgent">Votre abonnement a expiré le ${
                subscriptionDetails.expirationDate
              }</p>
              <p>Pour continuer à profiter de nos services, veuillez renouveler votre abonnement.</p>
            </div>

            <div class="subscription-details">
              <h3>Détails de votre abonnement :</h3>
              <p><strong>Plan :</strong> ${subscriptionDetails.planName}</p>
              <p><strong>Date d'expiration :</strong> ${
                subscriptionDetails.expirationDate
              }</p>
              <p><strong>Statut :</strong> <span class="urgent">Expiré</span></p>
            </div>

            ${
              subscriptionDetails.gracePeriodDays
                ? `
            <div class="grace-period">
              <h4>🕒 Période de grâce</h4>
              <p>Vous disposez encore de <strong>${subscriptionDetails.gracePeriodDays} jours</strong> pour renouveler votre abonnement sans perdre vos données et configurations.</p>
            </div>
            `
                : ""
            }

            <div class="benefits-list">
              <h3>Ce que vous perdez sans abonnement actif :</h3>
              <ul>
                <li>Accès aux fonctionnalités premium</li>
                <li>Support client prioritaire</li>
                <li>Sauvegardes automatiques</li>
                <li>Analyses avancées</li>
                <li>Intégrations tierces</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${subscriptionDetails.renewalUrl}" class="button">
                🔄 Renouveler maintenant
              </a>
              ${
                subscriptionDetails.supportUrl
                  ? `
              <a href="${subscriptionDetails.supportUrl}" class="button button-secondary">
                💬 Contacter le support
              </a>
              `
                  : ""
              }
            </div>

            <p><strong>Pourquoi renouveler maintenant ?</strong></p>
            <ul>
              <li>Continuez à utiliser toutes les fonctionnalités sans interruption</li>
              <li>Conservez vos données et configurations</li>
              <li>Bénéficiez des dernières mises à jour</li>
              <li>Support client disponible 24/7</li>
            </ul>

            <p>Si vous rencontrez des difficultés ou avez des questions, notre équipe de support est là pour vous aider.</p>

            <p>Cordialement,<br>L'équipe</p>
          </div>
          <div class="footer">
            <p>Cet email concerne votre abonnement. Pour vous désabonner de nos communications marketing, <a href="#">cliquez ici</a>.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
Bonjour ${subscriptionDetails.userName},

⚠️ ABONNEMENT EXPIRÉ ⚠️

Votre abonnement ${subscriptionDetails.planName} a expiré le ${
      subscriptionDetails.expirationDate
    }.

Pour continuer à profiter de nos services, veuillez renouveler votre abonnement :
${subscriptionDetails.renewalUrl}

${
  subscriptionDetails.gracePeriodDays
    ? `Vous disposez encore de ${subscriptionDetails.gracePeriodDays} jours pour renouveler sans perdre vos données.`
    : ""
}

Sans abonnement actif, vous perdez l'accès aux fonctionnalités premium, au support prioritaire, aux sauvegardes automatiques et plus encore.

Pour toute question, contactez notre support : ${
      subscriptionDetails.supportUrl || "support@votre-domaine.com"
    }

Cordialement,
L'équipe
    `,
  }),

  subscription_expiry_warning: (
    subscriptionDetails: SubscriptionDetails,
    daysLeft: number
  ) => ({
    subject: `⏰ Votre abonnement ${subscriptionDetails.planName} expire dans ${daysLeft} jours`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Abonnement - Rappel d'expiration</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ffc107; color: #333; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; }
          .warning-box { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
          .countdown { font-size: 24px; font-weight: bold; color: #ffc107; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Rappel d'expiration</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${subscriptionDetails.userName},</h2>
            
            <div class="countdown">
              ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${
      daysLeft > 1 ? "s" : ""
    }
            </div>

            <div class="warning-box">
              <p>Votre abonnement <strong>${
                subscriptionDetails.planName
              }</strong> expire le <strong>${
      subscriptionDetails.expirationDate
    }</strong>.</p>
              <p>Renouvelez dès maintenant pour éviter toute interruption de service.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${subscriptionDetails.renewalUrl}" class="button">
                🔄 Renouveler maintenant
              </a>
            </div>

            <p>En renouvelant votre abonnement, vous continuez à bénéficier de :</p>
            <ul>
              <li>Toutes les fonctionnalités premium</li>
              <li>Support client prioritaire</li>
              <li>Sauvegardes automatiques</li>
              <li>Mises à jour régulières</li>
            </ul>

            <p>Merci de votre confiance !</p>
            <p>L'équipe</p>
          </div>
          <div class="footer">
            <p>Ne souhaitez plus recevoir ces rappels ? <a href="#">Gérer vos préférences</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Fonction utilitaire pour envoyer un email d'abonnement expiré
export const sendSubscriptionExpiredEmail = async (
  brevoClient: any,
  email: string,
  subscriptionDetails: SubscriptionDetails
) => {
  const template = emailTemplates.subscription_expired(subscriptionDetails);

  return await brevoClient.sendSimpleEmail({
    to: email,
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
    tags: ["subscription", "expired", "renewal"],
  });
};

// Fonction utilitaire pour envoyer un rappel d'expiration
export const sendSubscriptionExpiryWarning = async (
  brevoClient: any,
  email: string,
  subscriptionDetails: SubscriptionDetails,
  daysLeft: number
) => {
  const template = emailTemplates.subscription_expiry_warning(
    subscriptionDetails,
    daysLeft
  );

  return await brevoClient.sendSimpleEmail({
    to: email,
    subject: template.subject,
    htmlContent: template.htmlContent,
    tags: ["subscription", "warning", "expiry", `days-${daysLeft}`],
  });
};
