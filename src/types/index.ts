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

// Address types
export interface Address {
  id: string;
  company_id: string;
  formatted_address: string;
  street_number?: string;
  street_name?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  place_id?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at?: string;
}

// Company types
export interface Company {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  imageUrl?: string;
  opening_hours?: OpeningHours;
  services?: Service[];
  photos?: Photo[];
  team?: TeamMember[];
  reviews?: Review[];
  rating?: number;
  reviewCount?: number;
  addresses?: Address;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  companies?: Professional[];
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
  imageUrl?: string;
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
  isTemp?: boolean;
  file?: File;
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
  status: BookingStatus;
  notes?: string;
  created_at: string;
}

// Search types
export interface SearchParams {
  name?: string;
  location?: string;
  service?: string;
  category?: string;
  city?: string;
  postalCode?: string;
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

export interface BusinessHours {
  day_of_week: string;
  open: boolean;
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
}

export interface AvailabilityState {
  businessHours: BusinessHours[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface Photo {
  id: string;
  company_id: string;
  url: string;
  alt?: string;
  featured: boolean;
}

export interface Booking {
  id?: string;
  company_id: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  start_time: string;
  end_time: string;
  status?: BookingStatus;
  notes?: string;
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookings: Booking[];
  lastBooking: Date | null;
  totalBookings: number;
}

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}
