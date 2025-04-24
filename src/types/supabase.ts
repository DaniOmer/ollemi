export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          client_email: string;
          client_id: string | null;
          client_name: string;
          client_phone: string;
          created_at: string;
          end_time: string;
          id: string;
          notes: string | null;
          pro_id: string;
          service_id: string;
          start_time: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          client_email: string;
          client_id?: string | null;
          client_name: string;
          client_phone: string;
          created_at?: string;
          end_time: string;
          id?: string;
          notes?: string | null;
          pro_id: string;
          service_id: string;
          start_time: string;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          client_email?: string;
          client_id?: string | null;
          client_name?: string;
          client_phone?: string;
          created_at?: string;
          end_time?: string;
          id?: string;
          notes?: string | null;
          pro_id?: string;
          service_id?: string;
          start_time?: string;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_pro_id_fkey";
            columns: ["pro_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          }
        ];
      };
      opening_hours: {
        Row: {
          break_end_time: string | null;
          break_start_time: string | null;
          day_of_week: string;
          end_time: string | null;
          id: string;
          open: boolean | null;
          pro_id: string;
          start_time: string | null;
        };
        Insert: {
          break_end_time?: string | null;
          break_start_time?: string | null;
          day_of_week: string;
          end_time?: string | null;
          id?: string;
          open?: boolean | null;
          pro_id: string;
          start_time?: string | null;
        };
        Update: {
          break_end_time?: string | null;
          break_start_time?: string | null;
          day_of_week?: string;
          end_time?: string | null;
          id?: string;
          open?: boolean | null;
          pro_id?: string;
          start_time?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "opening_hours_pro_id_fkey";
            columns: ["pro_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          }
        ];
      };
      photos: {
        Row: {
          alt: string | null;
          created_at: string;
          featured: boolean | null;
          id: string;
          pro_id: string;
          updated_at: string | null;
          url: string;
        };
        Insert: {
          alt?: string | null;
          created_at?: string;
          featured?: boolean | null;
          id?: string;
          pro_id: string;
          updated_at?: string | null;
          url: string;
        };
        Update: {
          alt?: string | null;
          created_at?: string;
          featured?: boolean | null;
          id?: string;
          pro_id?: string;
          updated_at?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_pro_id_fkey";
            columns: ["pro_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          }
        ];
      };
      professionals: {
        Row: {
          address: string | null;
          business_name: string;
          city: string | null;
          created_at: string;
          description: string | null;
          facebook: string | null;
          id: string;
          instagram: string | null;
          phone: string | null;
          updated_at: string | null;
          user_id: string;
          website: string | null;
          zipcode: string | null;
        };
        Insert: {
          address?: string | null;
          business_name: string;
          city?: string | null;
          created_at?: string;
          description?: string | null;
          facebook?: string | null;
          id?: string;
          instagram?: string | null;
          phone?: string | null;
          updated_at?: string | null;
          user_id: string;
          website?: string | null;
          zipcode?: string | null;
        };
        Update: {
          address?: string | null;
          business_name?: string;
          city?: string | null;
          created_at?: string;
          description?: string | null;
          facebook?: string | null;
          id?: string;
          instagram?: string | null;
          phone?: string | null;
          updated_at?: string | null;
          user_id?: string;
          website?: string | null;
          zipcode?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "professionals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      services: {
        Row: {
          category: string | null;
          created_at: string;
          description: string | null;
          duration: number;
          id: string;
          name: string;
          price: number;
          pro_id: string;
          updated_at: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          duration: number;
          id?: string;
          name: string;
          price: number;
          pro_id: string;
          updated_at?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          duration?: number;
          id?: string;
          name?: string;
          price?: number;
          pro_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "services_pro_id_fkey";
            columns: ["pro_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          accept_terms: boolean;
          created_at: string;
          email: string;
          first_name: string | null;
          id: string;
          last_name: string | null;
          phone: string | null;
          role: string;
          updated_at: string | null;
        };
        Insert: {
          accept_terms?: boolean;
          created_at?: string;
          email: string;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          phone?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Update: {
          accept_terms?: boolean;
          created_at?: string;
          email?: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          phone?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          phone: string | null;
          website: string | null;
          instagram: string | null;
          facebook: string | null;
          team_size: number | null;
          industry: string | null;
          created_at: string;
          updated_at: string | null;
          stripe_customer_id: string | null;
          user_id: string;
        };
        Insert: {
          id: string;
          name: string;
          description: string | null;
          phone: string | null;
          website: string | null;
          instagram: string | null;
          facebook: string | null;
          team_size: number | null;
          industry: string | null;
          created_at: string;
          updated_at: string | null;
          stripe_customer_id: string | null;
          user_id: string;
        };
        Update: {
          id: string;
          name: string;
          description: string | null;
          phone: string | null;
          website: string | null;
          instagram: string | null;
          facebook: string | null;
          team_size: number | null;
          industry: string | null;
          created_at: string;
          updated_at: string | null;
          stripe_customer_id: string | null;
          user_id: string;
        };
        Relationships: [
          {
            foreignKeyName: "companies_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      addresses: {
        Row: {
          id: string;
          formatted_address: string;
          street_number: string;
          street_name: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          place_id: string;
          latitude: number;
          longitude: number;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          formatted_address: string;
          street_number: string;
          street_name: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          place_id: string;
          latitude: number;
          longitude: number;
          created_at: string;
          updated_at: string | null;
        };
        Update: {
          id: string;
          formatted_address: string;
          street_number: string;
          street_name: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          place_id: string;
          latitude: number;
          longitude: number;
          created_at: string;
          updated_at: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          imageUrl: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          imageUrl: string;
          created_at: string;
          updated_at: string | null;
        };
        Update: {
          id: string;
          name: string;
          imageUrl: string;
          created_at: string;
          updated_at: string | null;
        };
      };
      company_categories: {
        Row: {
          company_id: string;
          category_id: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          company_id: string;
          category_id: string;
          created_at: string;
          updated_at: string | null;
        };
        Update: {
          company_id: string;
          category_id: string;
          created_at: string;
          updated_at: string | null;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string | null;
          description: string | null;
          price: number;
          currency: string;
          interval: string;
          interval_count: number;
          trial_period_days: number | null;
          is_active: boolean;
          features: string[] | null;
          stripe_price_id: string | null;
        };
        Insert: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string | null;
          description: string | null;
          price: number;
          currency: string;
          interval: string;
          interval_count: number;
          trial_period_days: number | null;
          is_active: boolean;
          features: string[] | null;
          stripe_price_id: string | null;
        };
        Update: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string | null;
          description: string | null;
          price: number;
          currency: string;
          interval: string;
          interval_count: number;
          trial_period_days: number | null;
          is_active: boolean;
          features: string[] | null;
          stripe_price_id: string | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          company_id: string | null;
          plan_id: string;
          payment_method_id: string | null;
          provider_id: string;
          provider_subscription_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          trial_start: string | null;
          trial_end: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          company_id: string | null;
          plan_id: string;
          payment_method_id: string | null;
          provider_id: string;
          provider_subscription_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          trial_start: string | null;
          trial_end: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Update: {
          id: string;
          user_id: string;
          company_id: string | null;
          plan_id: string;
          payment_method_id: string | null;
          provider_id: string;
          provider_subscription_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          trial_start: string | null;
          trial_end: string | null;
          created_at: string;
          updated_at: string | null;
        };
      };
      subscription_invoices: {
        Row: {
          id: string;
          subscription_id: string;
          provider_invoice_id: string;
          amount: number;
          currency: string;
          status: string;
          invoice_url: string | null;
          invoice_pdf: string | null;
          billing_reason: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          subscription_id: string;
          provider_invoice_id: string;
          amount: number;
          currency: string;
          status: string;
          invoice_url: string | null;
          invoice_pdf: string | null;
          billing_reason: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Update: {
          id: string;
          subscription_id: string;
          provider_invoice_id: string;
          amount: number;
          currency: string;
          status: string;
          invoice_url: string | null;
          invoice_pdf: string | null;
          billing_reason: string | null;
          created_at: string;
          updated_at: string | null;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          provider_id: string;
          provider_payment_method_id: string;
          is_default: boolean;
          type: string;
          last_four: string | null;
          expiry_month: number | null;
          expiry_year: number | null;
          billing_details: Json | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          provider_id: string;
          provider_payment_method_id: string;
          is_default: boolean;
          type: string;
          last_four: string | null;
          expiry_month: number | null;
          expiry_year: number | null;
          billing_details: Json | null;
          created_at: string;
          updated_at: string | null;
        };
        Update: {
          id: string;
          user_id: string;
          provider_id: string;
          provider_payment_method_id: string;
          is_default: boolean;
          type: string;
          last_four: string | null;
          expiry_month: number | null;
          expiry_year: number | null;
          billing_details: Json | null;
          created_at: string;
          updated_at: string | null;
        };
      };
      payment_providers: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Update: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_appointment_availability: {
        Args: {
          p_pro_id: string;
          p_start_time: string;
          p_end_time: string;
        };
        Returns: boolean;
      };
      is_within_opening_hours: {
        Args: {
          p_pro_id: string;
          p_start_time: string;
          p_end_time: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
