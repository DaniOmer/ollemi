// Types supplémentaires pour Brevo
export interface BrevoError {
  code: string;
  message: string;
}

export interface EmailEvent {
  email: string;
  event: "delivered" | "opened" | "clicked" | "bounced" | "blocked" | "spam";
  timestamp: string;
  messageId: string;
}

export interface ContactAttribute {
  name: string;
  value: any;
  type: "text" | "number" | "boolean" | "date";
}

export interface BrevoWebhook {
  event: string;
  email: string;
  id: number;
  date: string;
  ts: number;
  messageId: string;
  tags?: string[];
}

// Types pour les abonnements
export interface SubscriptionDetails {
  planName: string;
  expirationDate: string;
  userName: string;
  renewalUrl: string;
  supportUrl?: string;
  gracePeriodDays?: number;
}

export interface BookingDetails {
  date: string;
  time: string;
  service: string;
  reference: string;
  customerName?: string;
  location?: string;
}
