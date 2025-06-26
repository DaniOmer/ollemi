import * as Brevo from "@getbrevo/brevo";
import axios, { AxiosInstance } from "axios";

// Types for the Brevo API
export interface BrevoConfig {
  apiKey: string;
  baseURL?: string;
}

export interface EmailContact {
  email: string;
  name?: string;
}

export interface EmailTemplate {
  templateId: number;
  params?: Record<string, any>;
}

export interface TransactionalEmail {
  to: EmailContact[];
  cc?: EmailContact[];
  bcc?: EmailContact[];
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  sender?: EmailContact;
  replyTo?: EmailContact;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  tags?: string[];
  templateId?: number;
}

export interface EmailResponse {
  success: boolean;
  message?: string;
}

export interface ContactData {
  email: string;
  attributes?: Record<string, any>;
  listIds?: number[];
  updateEnabled?: boolean;
}

export class BrevoClient {
  private httpClient: AxiosInstance;
  private transactionalApi: Brevo.TransactionalEmailsApi;
  private contactsApiInstance: Brevo.ContactsApi;

  constructor(config: BrevoConfig) {
    // Configuration of the Brevo SDK
    this.transactionalApi = new Brevo.TransactionalEmailsApi();
    this.contactsApiInstance = new Brevo.ContactsApi();

    // Configuration of the API key for the SDK instances
    this.transactionalApi.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      config.apiKey
    );
    this.contactsApiInstance.setApiKey(
      Brevo.ContactsApiApiKeys.apiKey,
      config.apiKey
    );

    // HTTP client for the features not covered by the SDK
    this.httpClient = axios.create({
      baseURL: config.baseURL || "https://api.brevo.com/v3",
      headers: {
        "api-key": config.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 30000,
    });

    // Interceptor for logging errors
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("Brevo API Error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    );
  }

  /**
   * Send a transactional email using the Brevo SDK
   */
  async sendTransactionalEmail(
    emailData: TransactionalEmail
  ): Promise<EmailResponse> {
    try {
      // Conversion to the Brevo SDK format
      const sendSmtpEmail = new Brevo.SendSmtpEmail();

      // Mapping of the data
      sendSmtpEmail.to = emailData.to.map((contact) => {
        const recipient: any = { email: contact.email };
        if (contact.name) {
          recipient.name = contact.name;
        }
        return recipient;
      });

      if (emailData.cc) {
        sendSmtpEmail.cc = emailData.cc.map((contact) => {
          const recipient: any = { email: contact.email };
          if (contact.name) {
            recipient.name = contact.name;
          }
          return recipient;
        });
      }

      if (emailData.bcc) {
        sendSmtpEmail.bcc = emailData.bcc.map((contact) => {
          const recipient: any = { email: contact.email };
          if (contact.name) {
            recipient.name = contact.name;
          }
          return recipient;
        });
      }

      if (emailData.subject) {
        sendSmtpEmail.subject = emailData.subject;
      }

      if (emailData.htmlContent) {
        sendSmtpEmail.htmlContent = emailData.htmlContent;
      }

      if (emailData.textContent) {
        sendSmtpEmail.textContent = emailData.textContent;
      }

      if (emailData.sender) {
        sendSmtpEmail.sender = {
          email: emailData.sender.email,
        };
        if (emailData.sender.name) {
          sendSmtpEmail.sender.name = emailData.sender.name;
        }
      }

      if (emailData.replyTo) {
        sendSmtpEmail.replyTo = {
          email: emailData.replyTo.email,
        };
        if (emailData.replyTo.name) {
          sendSmtpEmail.replyTo.name = emailData.replyTo.name;
        }
      }

      if (emailData.headers) {
        sendSmtpEmail.headers = emailData.headers;
      }

      if (emailData.params) {
        sendSmtpEmail.params = emailData.params;
      }

      if (emailData.tags) {
        sendSmtpEmail.tags = emailData.tags;
      }

      if (emailData.templateId) {
        sendSmtpEmail.templateId = emailData.templateId;
      }

      const response = await this.transactionalApi.sendTransacEmail(
        sendSmtpEmail
      );

      return {
        success: true,
        message: "Email sent successfully",
      };
    } catch (error) {
      console.error("Brevo SDK Error:", error);
      return {
        success: false,
        message: `Failed to send email: ${error}`,
      };
    }
  }

  /**
   * Send a simple email with HTML content
   */
  async sendSimpleEmail({
    to,
    subject,
    htmlContent,
    textContent,
    sender,
    tags = [],
  }: {
    to: string | EmailContact[];
    subject: string;
    htmlContent?: string;
    textContent?: string;
    sender?: EmailContact;
    tags?: string[];
  }): Promise<EmailResponse> {
    // Normalize the recipients
    const recipients: EmailContact[] = Array.isArray(to)
      ? to
      : [typeof to === "string" ? { email: to } : to];

    const emailData: TransactionalEmail = {
      to: recipients,
      subject,
      htmlContent,
      textContent,
      sender: sender || {
        email:
          process.env.NEXT_PUBLIC_BREVO_SENDER_EMAIL || "ddaniomer95@gmail.com",
        name: process.env.NEXT_PUBLIC_BREVO_SENDER_NAME || "Ollemi",
      },
      tags,
    };

    return this.sendTransactionalEmail(emailData);
  }

  /**
   * Send an email based on a template
   */
  async sendTemplateEmail({
    to,
    templateId,
    params = {},
    sender,
    tags = [],
  }: {
    to: string | EmailContact[];
    templateId: number;
    params?: Record<string, any>;
    sender?: EmailContact;
    tags?: string[];
  }): Promise<EmailResponse> {
    const recipients: EmailContact[] = Array.isArray(to)
      ? to
      : [typeof to === "string" ? { email: to } : to];

    const emailData: TransactionalEmail = {
      to: recipients,
      templateId,
      params,
      sender: sender || {
        email:
          process.env.NEXT_PUBLIC_BREVO_SENDER_EMAIL || "ddaniomer95@gmail.com",
        name: process.env.NEXT_PUBLIC_BREVO_SENDER_NAME || "Ollemi",
      },
      tags,
    };

    return this.sendTransactionalEmail(emailData);
  }

  /**
   * Add or update a contact using the Brevo SDK
   */
  async createOrUpdateContact(contactData: ContactData): Promise<void> {
    try {
      const createContact = new Brevo.CreateContact();
      createContact.email = contactData.email;

      if (contactData.attributes) {
        createContact.attributes = contactData.attributes;
      }

      if (contactData.listIds) {
        createContact.listIds = contactData.listIds;
      }

      if (contactData.updateEnabled !== undefined) {
        createContact.updateEnabled = contactData.updateEnabled;
      }

      await this.contactsApiInstance.createContact(createContact);
    } catch (error) {
      console.error("Brevo SDK Contact Error:", error);
      throw new Error(`Failed to create/update contact: ${error}`);
    }
  }

  /**
   * Get the information of a contact using the Brevo SDK
   */
  async getContact(email: string): Promise<any> {
    try {
      const response = await this.contactsApiInstance.getContactInfo(email);
      return response.body;
    } catch (error) {
      console.error("Brevo SDK Get Contact Error:", error);
      throw new Error(`Failed to get contact: ${error}`);
    }
  }

  /**
   * Delete a contact using the Brevo SDK
   */
  async deleteContact(email: string): Promise<void> {
    try {
      await this.contactsApiInstance.deleteContact(email);
    } catch (error) {
      console.error("Brevo SDK Delete Contact Error:", error);
      throw new Error(`Failed to delete contact: ${error}`);
    }
  }

  /**
   * Get the sending statistics (uses HTTP because not available in the SDK)
   */
  async getEmailStats(messageId: string): Promise<any> {
    try {
      const response = await this.httpClient.get(
        `/smtp/statistics/events?messageId=${messageId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get email stats: ${error}`);
    }
  }

  /**
   * Test the connection to the API (uses HTTP for simplicity)
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.httpClient.get("/account");
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Default instance of the client (uses environment variables)
let defaultClient: BrevoClient | null = null;

export function getBrevoClient(): BrevoClient {
  if (!defaultClient) {
    const apiKey = process.env.NEXT_PUBLIC_BREVO_API_KEY;
    if (!apiKey) {
      throw new Error("BREVO_API_KEY environment variable is required");
    }
    defaultClient = new BrevoClient({ apiKey });
  }
  return defaultClient;
}

// Utility functions for a simplified usage
export const brevoEmailService = {
  /**
   * Send a welcome email
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<EmailResponse> {
    const client = getBrevoClient();
    return client.sendSimpleEmail({
      to,
      subject: "Bienvenue !",
      htmlContent: `
        <h1>Bonjour ${userName} !</h1>
        <p>Bienvenue sur notre plateforme. Nous sommes ravis de vous compter parmi nous.</p>
        <p>Cordialement,<br>L'équipe</p>
      `,
      tags: ["welcome", "onboarding"],
    });
  },

  /**
   * Send a confirmation email
   */
  async sendConfirmationEmail(
    to: string,
    confirmationUrl: string
  ): Promise<EmailResponse> {
    const client = getBrevoClient();
    return client.sendSimpleEmail({
      to,
      subject: "Confirmez votre email",
      htmlContent: `
        <h1>Confirmation d'email</h1>
        <p>Cliquez sur le lien ci-dessous pour confirmer votre adresse email :</p>
        <p><a href="${confirmationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmer mon email</a></p>
        <p>Si vous n'arrivez pas à cliquer sur le lien, copiez et collez cette URL dans votre navigateur :</p>
        <p>${confirmationUrl}</p>
      `,
      tags: ["confirmation", "verification"],
    });
  },

  /**
   * Send a password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    resetUrl: string
  ): Promise<EmailResponse> {
    const client = getBrevoClient();
    return client.sendSimpleEmail({
      to,
      subject: "Réinitialisation de votre mot de passe",
      htmlContent: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
        <p><a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `,
      tags: ["password-reset", "security"],
    });
  },
};

export default BrevoClient;
