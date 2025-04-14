import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  stripe_customer_id?: string;
  created_at?: string;
};

export type Company = {
  id: string;
  name: string;
  description?: string;
  subscription_id?: string;
  created_at?: string;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);

        // Get authenticated user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setUser(null);
          setCompany(null);
          return;
        }

        // Get user profile
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (userError) throw userError;

        if (userData) {
          setUser(userData as User);

          // Get company if user is a professional
          if (userData.role === "professional") {
            const { data: companyData, error: companyError } = await supabase
              .from("companies")
              .select(
                `
                *,
                subscriptions:subscription_id (
                  id,
                  status,
                  current_period_end,
                  cancel_at_period_end,
                  subscription_plans:plan_id (
                    name,
                    features
                  )
                )
              `
              )
              .eq("user_id", authUser.id)
              .single();

            if (!companyError && companyData) {
              setCompany(companyData as Company);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, company, isLoading, error };
}
