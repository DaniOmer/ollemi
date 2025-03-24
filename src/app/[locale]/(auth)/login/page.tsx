"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "@/hooks/useTranslations";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  login,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
  clearError,
  selectUser,
} from "@/lib/redux/slices/authSlice";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { signInWithGoogle } from "@/lib/supabase/client";

// Define the form schema with zod
const loginFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  // Clear any previous errors when the component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        // Check if the function exists before calling it
        const role = user.role;
        const isOnboardingComplete = user.onboarding_completed;

        if (!isOnboardingComplete) {
          // User needs to complete onboarding
          router.push("/onboarding/business-name");
        } else {
          // User doesn't need onboarding or it's complete
          router.push(`/dashboard/${role}`);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Fallback to default navigation
        // router.push(`/dashboard/${user.user_metadata.role}`);
      }
    }
  }, [isAuthenticated, user, router]);

  // Set up the form with react-hook-form and zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    try {
      await dispatch(
        login({
          email: values.email,
          password: values.password,
        })
      ).unwrap();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-background z-0"></div>
      <div className="absolute inset-0 bg-[url('/pattern-bg.svg')] opacity-10 z-0"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="text-2xl font-bold gradient-text flex items-center gap-2"
          >
            {t("app.name")}
          </Link>
          <LanguageSwitcher />
        </div>

        <Card className="border-gradient shadow-xl rounded-xl animate-fade-in backdrop-blur-sm bg-card/95 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
          <CardHeader className="space-y-2 pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shadow-md">
                <Lock className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center gradient-text">
              {t("auth.login.title")}
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground">
              {t("auth.login.noAccount")}{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {t("auth.login.createAccount")}
              </Link>
            </p>
          </CardHeader>

          <CardContent className="pt-2 pb-6">
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center text-destructive text-sm animate-fade-in">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem
                      className="animate-slide-up"
                      style={{ animationDelay: "100ms" }}
                    >
                      <FormLabel>{t("auth.login.email")}</FormLabel>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                          strokeWidth={1.5}
                        />
                        <FormControl>
                          <Input
                            placeholder="email@example.com"
                            className="pl-10 border-primary/20 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem
                      className="animate-slide-up"
                      style={{ animationDelay: "200ms" }}
                    >
                      <FormLabel>{t("auth.login.password")}</FormLabel>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                          strokeWidth={1.5}
                        />
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 border-primary/20 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div
                  className="flex items-center justify-between animate-slide-up"
                  style={{ animationDelay: "300ms" }}
                >
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="text-primary border-primary/50"
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t("auth.login.rememberMe")}
                        </label>
                      </div>
                    )}
                  />

                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {t("auth.login.forgotPassword")}
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 hover-lift animate-slide-up font-medium mt-2"
                  style={{ animationDelay: "400ms" }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("auth.login.button")
                  )}
                </Button>
              </form>
            </Form>

            <div
              className="mt-6 animate-slide-up"
              style={{ animationDelay: "500ms" }}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-2 text-muted-foreground bg-white">
                    {t("auth.login.or")}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-center shadow-sm"
                onClick={async () => {
                  try {
                    // Google sign-in would need to be integrated with Redux
                    // For now, we'll just call the function directly
                    await signInWithGoogle();
                  } catch (error) {
                    console.error("Google sign-in error:", error);
                    // In a complete implementation, we would dispatch an action to set the error
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                )}
                {t("auth.login.google")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()}
          {t("footer.copyright").split("{year}")[1]}
        </p>
      </div>
    </div>
  );
}
