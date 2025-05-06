"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "@/hooks/useTranslations";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Lock,
  Briefcase,
  Loader2,
  AlertCircle,
  Phone,
  CheckCircle,
} from "lucide-react";
import { signInWithGoogle } from "@/lib/supabase/client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { registerThunk, selectAuthLoading } from "@/lib/redux/slices/authSlice";
import Select from "@/components/ui/Select";
import {
  AddressAutocomplete,
  AddressData,
} from "@/components/forms/AddressAutocomplete";

// Define the form schema with zod
const signupFormSchema = z
  .object({
    firstName: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    phone: z.string().optional(),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
    role: z.enum(["pro", "client"]),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and privacy policy.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const [error, setError] = useState<string | null>(null);

  // Set up the form with react-hook-form and zod validation
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "client",
      acceptTerms: false,
    },
  });

  // Handle form submission
  const onSubmit = async (values: SignupFormValues) => {
    setError(null); // Clear previous errors
    try {
      const response = await dispatch(registerThunk(values));

      // Check if there was an error in the response
      if (response.type.includes("rejected")) {
        const errorPayload = response.payload as any;
        setError(
          typeof errorPayload === "string"
            ? errorPayload
            : "An error occurred during signup"
        );
        return;
      }

      // Access user property safely with optional chaining
      const responseData = response.payload as any;
      if (responseData?.user) {
        router.push("/login");
      } else {
        setError(
          "Registration successful, but user data was not returned properly. Please try logging in."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during signup"
      );
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
                <User className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center gradient-text">
              {t("auth.signup.title")}
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground">
              {t("auth.signup.haveAccount")}{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {t("auth.signup.signIn")}
              </Link>
            </p>
          </CardHeader>

          <CardContent className="pt-2 pb-6">
            {error && (
              <div
                className={`mb-4 p-3 ${
                  error.includes("successful")
                    ? "bg-green-100 border border-green-200 text-green-800"
                    : "bg-destructive/10 border border-destructive/20 text-destructive"
                } rounded-lg flex items-center text-sm animate-fade-in`}
              >
                {error.includes("successful") ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                {error}
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem
                        className="animate-slide-up"
                        style={{ animationDelay: "100ms" }}
                      >
                        <FormLabel>{t("auth.signup.firstName")}</FormLabel>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                            strokeWidth={1.5}
                          />
                          <FormControl>
                            <Input
                              placeholder="John"
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
                    name="lastName"
                    render={({ field }) => (
                      <FormItem
                        className="animate-slide-up"
                        style={{ animationDelay: "150ms" }}
                      >
                        <FormLabel>{t("auth.signup.lastName")}</FormLabel>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                            strokeWidth={1.5}
                          />
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              className="pl-10 border-primary/20 focus:border-primary"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem
                      className="animate-slide-up"
                      style={{ animationDelay: "200ms" }}
                    >
                      <FormLabel>{t("auth.signup.phone")}</FormLabel>
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                          strokeWidth={1.5}
                        />
                        <FormControl>
                          <Input
                            placeholder="+33 6 12 34 56 78"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem
                      className="animate-slide-up"
                      style={{ animationDelay: "200ms" }}
                    >
                      <FormLabel>{t("auth.signup.email")}</FormLabel>
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
                      style={{ animationDelay: "300ms" }}
                    >
                      <FormLabel>{t("auth.signup.password")}</FormLabel>
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem
                      className="animate-slide-up"
                      style={{ animationDelay: "400ms" }}
                    >
                      <FormLabel>{t("auth.signup.confirmPassword")}</FormLabel>
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

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem
                      className="animate-slide-up"
                      style={{ animationDelay: "500ms" }}
                    >
                      <FormLabel>{t("auth.signup.accountType")}</FormLabel>
                      <div className="relative">
                        <Briefcase
                          className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10"
                          strokeWidth={1.5}
                        />
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="pl-10 border-primary/20 focus:border-primary">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pro">
                                {t("auth.signup.proProfessional")}
                              </SelectItem>
                              <SelectItem value="client">
                                {t("auth.signup.client")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-start space-x-3 space-y-0 rounded-lg p-4 border border-primary/20 animate-slide-up"
                      style={{ animationDelay: "600ms" }}
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="text-primary border-primary/50"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          {t("auth.signup.terms")}{" "}
                          <Link
                            href="#"
                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            {t("auth.signup.termsOfService")}
                          </Link>{" "}
                          {t("auth.signup.and")}{" "}
                          <Link
                            href="#"
                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            {t("auth.signup.privacyPolicy")}
                          </Link>
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 hover-lift animate-slide-up font-medium mt-2"
                  style={{ animationDelay: "700ms" }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("auth.signup.button")
                  )}
                </Button>
              </form>
            </Form>

            <div
              className="mt-6 animate-slide-up"
              style={{ animationDelay: "800ms" }}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-2 text-muted-foreground bg-white">
                    {t("auth.signup.or")}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-center shadow-sm"
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch (error) {
                    console.error("Google sign-in error:", error);
                    setError(
                      error instanceof Error
                        ? error.message
                        : "An error occurred during Google sign-in"
                    );
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
                {t("auth.signup.google")}
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
