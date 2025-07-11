import { Database } from "./supabase";

// Existing types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CompanyCategory =
  Database["public"]["Tables"]["company_categories"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type OpeningHours = Database["public"]["Tables"]["opening_hours"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type Photo = Database["public"]["Tables"]["photos"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Discount = Database["public"]["Tables"]["discounts"]["Row"];

// Legacy types (to be removed once migration is complete)
export type Professional = Company;
export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export type Booking = {
  id?: string;
  client_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  company_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status?: BookingStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string | null;
  // Fields from the join query
  service?: Service;
  customer?: User;
  company?: Company & { address: Address };
};

// Subscription types
export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: "day" | "week" | "month" | "year";
  interval_count: number;
  trial_period_days: number | null;
  is_active: boolean;
  features: string[] | null;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string | null;
};

export enum SubscriptionStatus {
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  TRIALING = "trialing",
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  UNPAID = "unpaid",
  EXPIRING_SOON = "expiring_soon",
  EXPIRED = "expired",
}

export type Subscription = {
  id: string;
  user_id: string;
  company_id: string | null;
  plan_id: string;
  payment_method_id: string | null;
  provider_id: string;
  provider_subscription_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string | null;
};

export type InvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "uncollectible"
  | "void";

export type SubscriptionInvoice = {
  id: string;
  subscription_id: string;
  provider_invoice_id: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  invoice_url: string | null;
  invoice_pdf: string | null;
  billing_reason: string | null;
  created_at: string;
  updated_at: string | null;
};

export type PaymentMethod = {
  id: string;
  user_id: string;
  provider_id: string;
  provider_payment_method_id: string;
  is_default: boolean;
  type: string;
  last_four: string | null;
  expiry_month: number | null;
  expiry_year: number | null;
  billing_details: any;
  created_at: string;
  updated_at: string | null;
};

export type PaymentProvider = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

// Form data types
export interface CompanyFormData extends Partial<Company> {
  address?: string;
  city?: string;
  zipcode?: string;
  imageUrl?: string;
}

export interface ServiceFormSchema {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

// Original ServiceFormData type remains for other uses
export type ServiceFormData = {
  service_id: string;
  start_time: string;
  end_time: string;
  notes: string;
};

export type BusinessHours = {
  id: string;
  company_id: string;
  day: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string | null;
};

export interface AvailabilityState {
  businessHours: BusinessHours[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface SearchParams {
  name?: string;
  service?: string;
  category?: string;
  location?: string;
  city?: string;
  postalCode?: string;
  date?: string;
  price_min?: number;
  price_max?: number;
  rating?: number;
}

export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bookings: Booking[];
  totalBookings: number;
  lastBooking: Date | null;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  image_url: string | null;
};

export enum BillingInterval {
  MONTH = "month",
  YEAR = "year",
}
