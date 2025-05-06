"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Smartphone,
  BarChart,
  Users,
  QrCode,
  Languages,
  CheckCircle,
  Ban,
  ImageIcon,
  Star,
  Tag,
  UserPlus,
  Settings,
  CalendarCheck,
  CalendarPlus,
  Search,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { fetchSubscriptionPlansThunk } from "@/lib/redux/slices/subscriptionSlice";
import { RootState } from "@/lib/redux/store";
import { SubscriptionPlan } from "@/types";

export default function ProfessionalHome() {
  const { t } = useTranslations();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month"
  );
  const dispatch = useAppDispatch();
  const { plans, status } = useAppSelector(
    (state: RootState) => state.subscription
  );
  const isLoading = status === "loading";

  // Add animation classes on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Fetch subscription plans when billing interval changes
  useEffect(() => {
    dispatch(fetchSubscriptionPlansThunk(billingInterval));
  }, [dispatch, billingInterval]);

  // Format price for display
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency || "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format feature for display
  const formatFeature = (key: string, value: any, parentKey?: string) => {
    // Skip rendering for false values
    if (value === false) return null;

    // For boolean true values, just return the formatted key
    if (value === true) {
      const translationKeyBase = parentKey ? `${parentKey}.${key}` : key;
      const translationKey = `subscription.features.${translationKeyBase}`;
      let featureName = t(translationKey);

      // If translation not found, format the key as a readable string
      if (featureName === translationKey) {
        featureName = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
      }

      return featureName;
    }

    // For numeric values
    if (typeof value === "number") {
      const featureName = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      const formattedValue =
        value === -1 || value > 999 ? t("subscription.unlimited") : value;

      // Handle special cases like "free per month"
      if (key === "freePerMonth") {
        return `${formattedValue} ${t("subscription.freePerMonthSuffix")}`;
      }

      return `${featureName}: ${formattedValue}`;
    }

    return null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="py-10 md:py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background z-0"></div>
          <div className="md:container mx-auto max-w-6xl relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-up">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight gradient-text">
                  {t("hero.title")}
                </h1>
                <p className="mt-6 text-lg text-muted-foreground max-w-md">
                  {t("hero.subtitle")}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/signup"
                    className="px-6 py-3 bg-primary text-white rounded-lg hover-lift hover:bg-primary/90 transition-all text-center"
                  >
                    {t("hero.startTrial")}
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="px-6 py-3 border border-primary/20 rounded-lg hover:bg-secondary transition-colors text-center"
                  >
                    {t("hero.seeHowItWorks")}
                  </Link>
                </div>
              </div>
              <div className="h-[400px] row-end-1 md:row-end-auto rounded-xl overflow-hidden shadow-soft animate-slide-in-right">
                <Image
                  src="/images/management.jpg"
                  alt="Company Management"
                  width={1000}
                  height={1000}
                  className="rounded-xl h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-10 md:py-20 px-4 bg-secondary/30">
          <div className="md:container mx-auto max-w-6xl">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-xl md:text-5xl font-bold gradient-text">
                {t("features.title")}
              </h2>
              <p className="mt-4 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("features.subtitle")}
              </p>
            </div>
            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1: Online Presence */}
              <div className="bg-card p-6 rounded-lg shadow-soft hover-lift animate-on-scroll">
                <Users className="w-10 h-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("features.onlinePresence.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("features.onlinePresence.description")}
                </p>
              </div>
              {/* Feature 2: Online Booking */}
              <div className="bg-card p-6 rounded-lg shadow-soft hover-lift animate-on-scroll">
                <Calendar className="w-10 h-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("features.onlineBooking.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("features.onlineBooking.description")}
                </p>
              </div>
              {/* Feature 3: Dashboard */}
              <div className="bg-card p-6 rounded-lg shadow-soft hover-lift animate-on-scroll">
                <BarChart className="w-10 h-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("features.dashboard.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("features.dashboard.description")}{" "}
                  {t("features.noShows.description")}
                </p>
              </div>
              {/* Feature 4: Photo Gallery */}
              <div className="bg-card p-6 rounded-lg shadow-soft hover-lift animate-on-scroll">
                <ImageIcon className="w-10 h-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("features.gallery.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("features.gallery.description")}
                </p>
              </div>
              {/* Feature 5: Customer Reviews */}
              <div className="bg-card p-6 rounded-lg shadow-soft hover-lift animate-on-scroll">
                <Star className="w-10 h-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("features.reviews.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("features.reviews.description")}
                </p>
              </div>
              {/* Feature 6: QR Code */}
              <div className="bg-card p-6 rounded-lg shadow-soft hover-lift animate-on-scroll">
                <QrCode className="w-10 h-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("features.qrCode.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("features.qrCode.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-10 md:py-20 px-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-accent/5 z-0"></div>
          <div className="md:container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-xl md:text-5xl font-bold gradient-text">
                {t("howItWorks.title")}
              </h2>
              <p className="mt-4 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("howItWorks.subtitle")}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1: Create Profile */}
              <div className="bg-card p-6 rounded-lg shadow-soft hover-lift text-center animate-on-scroll">
                <UserPlus className="w-12 h-12 mb-4 text-primary mx-auto" />
                <h4 className="text-lg font-semibold mb-2">
                  {t("howItWorks.proStep1.title")}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t("howItWorks.proStep1.description")}
                </p>
              </div>
              {/* Step 2: Configure Services */}
              <div className="bg-card p-6 rounded-lg shadow-soft hover-lift text-center animate-on-scroll animation-delay-200">
                <Settings className="w-12 h-12 mb-4 text-primary mx-auto" />
                <h4 className="text-lg font-semibold mb-2">
                  {t("howItWorks.proStep2.title")}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t("howItWorks.proStep2.description")}
                </p>
              </div>
              {/* Step 3: Manage Bookings */}
              <div className="bg-card p-6 rounded-lg shadow-soft hover-lift text-center animate-on-scroll animation-delay-400">
                <CalendarCheck className="w-12 h-12 mb-4 text-primary mx-auto" />
                <h4 className="text-lg font-semibold mb-2">
                  {t("howItWorks.proStep3.title")}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t("howItWorks.proStep3.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-10 md:py-20 px-4 bg-secondary/30">
          <div className="md:container mx-auto max-w-6xl">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-xl md:text-5xl font-bold gradient-text">
                {t("pricing.title")}
              </h2>
              <p className="mt-4 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("pricing.subtitle")}
              </p>
            </div>

            {/* Billing interval selection */}
            <div className="flex justify-center mb-8 animate-on-scroll">
              <Tabs
                defaultValue="month"
                className="w-[200px]"
                onValueChange={(value) =>
                  setBillingInterval(value as "month" | "year")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="month">
                    {t("subscription.monthly")}
                  </TabsTrigger>
                  <TabsTrigger value="year">
                    {t("subscription.yearly")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Subscription plans */}
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center p-8">
                <p>{t("subscription.noPlans")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-on-scroll">
                {plans.map((plan: SubscriptionPlan) => (
                  <Card
                    key={plan.id}
                    className={`w-full h-full flex flex-col relative ${
                      plan.name === "Pro" ? "border-primary shadow-lg" : ""
                    }`}
                  >
                    {plan.name === "Pro" && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="bg-primary text-white text-sm px-3 py-1 rounded-full">
                          {t("subscription.mostPopular")}
                        </span>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="text-3xl font-bold mb-4">
                        {formatPrice(plan.price, plan.currency)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{t(`subscription.${plan.interval}`)}
                        </span>
                      </div>

                      {/* Feature list */}
                      <ul className="space-y-2">
                        {Object.entries(plan.features || {}).map(
                          ([key, value]) => {
                            if (typeof value === "object" && value !== null) {
                              // Render nested features
                              return (
                                <li key={key} className="ml-4 pt-2">
                                  <span className="font-medium text-sm text-muted-foreground">
                                    {(() => {
                                      const titleKey = `subscription.features.${key}.title`;
                                      const fallbackKey = `subscription.features.${key}`;
                                      let title = t(titleKey);
                                      if (title === titleKey) {
                                        title = t(fallbackKey);
                                        if (title === fallbackKey) {
                                          title = key
                                            .replace(/([A-Z])/g, " $1")
                                            .replace(/^./, (str) =>
                                              str.toUpperCase()
                                            );
                                        }
                                      }
                                      return `${title}:`;
                                    })()}
                                  </span>
                                  <ul className="list-none pl-4 space-y-1 mt-1">
                                    {Object.entries(value).map(
                                      ([subKey, subValue]) => {
                                        const formattedSubFeature =
                                          formatFeature(
                                            subKey,
                                            subValue,
                                            key // Pass parent key for translation
                                          );
                                        return formattedSubFeature ? (
                                          <li
                                            key={subKey}
                                            className="flex items-center text-sm"
                                          >
                                            <CheckCircle className="h-3 w-3 text-primary mr-2 flex-shrink-0" />
                                            <span>{formattedSubFeature}</span>
                                          </li>
                                        ) : null;
                                      }
                                    )}
                                  </ul>
                                </li>
                              );
                            } else {
                              // Render simple features
                              const formattedFeature = formatFeature(
                                key,
                                value
                              );
                              return formattedFeature ? (
                                <li key={key} className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                                  <span>{formattedFeature}</span>
                                </li>
                              ) : null;
                            }
                          }
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href="/signup" className="w-full">
                        <Button
                          className="w-full"
                          variant={plan.name === "Pro" ? "default" : "outline"}
                        >
                          {t("subscription.tryItFree")}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg z-0"></div>
          <div className="md:container mx-auto max-w-4xl text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white animate-on-scroll">
              {t("cta.title")}
            </h2>
            <p className="text-xl mb-8 text-white/80 max-w-2xl mx-auto animate-on-scroll">
              {t("cta.subtitle")}
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-white text-primary rounded-lg font-semibold hover-lift hover:bg-white/95 transition-all shadow-soft animate-on-scroll"
            >
              {t("cta.button")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
