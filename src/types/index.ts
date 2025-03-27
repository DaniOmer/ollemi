// User types
export interface User {
  id: string;
  email: string;
  role: "pro" | "client";
  first_name: string;
  last_name: string;
  phone?: string;
  accept_terms: boolean;
  created_at: string;
  updated_at?: string;
  company_id?: string;
  onboarding_completed?: boolean;
}

// Company types
export interface Company {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  zipcode?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  imageUrl?: string;
  opening_hours?: OpeningHours;
  services?: Service[];
  photos?: Photo[];
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: boolean;
  start: string; // Format: "HH:MM"
  end: string; // Format: "HH:MM"
  break_start?: string; // Format: "HH:MM"
  break_end?: string; // Format: "HH:MM"
}

export interface Service {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  category?: string;
}

// Service form data (without id and company_id)
export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
}

export interface Photo {
  id: string;
  company_id: string;
  url: string;
  alt?: string;
  featured: boolean;
}

// Appointment types
export interface Appointment {
  id: string;
  company_id: string;
  client_id?: string;
  client_email: string;
  client_name: string;
  client_phone: string;
  start_time: string;
  end_time: string;
  service_id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  created_at: string;
}

// Search types
export interface SearchParams {
  location?: string;
  service?: string;
  date?: string;
  price_min?: number;
  price_max?: number;
  rating?: number;
}

// For backward compatibility
export interface Professional extends Company {
  name: string;
  user_id: string;
}
