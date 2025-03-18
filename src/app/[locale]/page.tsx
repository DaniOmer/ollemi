"use client";

import Link from "next/link";
import Image from "next/image";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useMessages, useLocale } from "next-intl";
import { useEffect } from "react";

export default function Home() {
  const messages = useMessages();
  const locale = useLocale();

  // Create a translation function that accesses nested properties
  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = messages;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if the path doesn't exist
      }
    }

    return value;
  };

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="border-b shadow-soft sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold gradient-text">
            {t("app.name")}
          </div>
          <nav className="hidden md:flex gap-8">
            <Link
              href="#features"
              className="hover:text-primary transition-colors relative group"
            >
              {t("nav.features")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-primary transition-colors relative group"
            >
              {t("nav.howItWorks")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="#pricing"
              className="hover:text-primary transition-colors relative group"
            >
              {t("nav.pricing")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-primary text-white rounded-lg hover-lift hover:bg-primary/90 transition-all"
            >
              {t("nav.signup")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background z-0"></div>
          <div className="container mx-auto max-w-6xl relative z-10">
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
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-soft animate-slide-in-right">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <div className="glass-effect p-8 rounded-xl">
                    <div className="text-3xl font-bold gradient-text mb-4">
                      {t("app.name")}
                    </div>
                    <p className="text-muted-foreground">{t("hero.title")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-3xl md:text-5xl font-bold gradient-text">
                {t("features.title")}
              </h2>
              <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("features.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card p-8 rounded-xl shadow-soft hover-lift border-gradient animate-on-scroll">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("features.booking.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("features.booking.description")}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card p-8 rounded-xl shadow-soft hover-lift border-gradient animate-on-scroll">
                <div className="w-14 h-14 bg-accent/20 text-accent-foreground rounded-full flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("features.reminders.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("features.reminders.description")}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card p-8 rounded-xl shadow-soft hover-lift border-gradient animate-on-scroll">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("features.profile.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("features.profile.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-20 px-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-accent/5 z-0"></div>
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-3xl md:text-5xl font-bold gradient-text">
                {t("howItWorks.title")}
              </h2>
              <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("howItWorks.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <div className="text-center animate-on-scroll">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent text-white rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 shadow-soft animate-pulse-subtle">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("howItWorks.step1.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("howItWorks.step1.description")}
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center animate-on-scroll">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent text-white rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 shadow-soft animate-pulse-subtle">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("howItWorks.step2.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("howItWorks.step2.description")}
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center animate-on-scroll">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent text-white rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 shadow-soft animate-pulse-subtle">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("howItWorks.step3.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("howItWorks.step3.description")}
                </p>
              </div>

              {/* Connecting line */}
              <div className="hidden md:block absolute top-[40px] left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] h-0.5 bg-gradient-to-r from-primary/30 via-accent/50 to-primary/30"></div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-3xl md:text-5xl font-bold gradient-text">
                {t("pricing.title")}
              </h2>
              <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("pricing.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Basic Plan */}
              <div className="bg-card p-8 rounded-xl shadow-soft hover-lift border-gradient animate-on-scroll">
                <h3 className="text-xl font-semibold mb-3">
                  {t("pricing.basic.title")}
                </h3>
                <div className="text-4xl font-bold mb-4 gradient-text">
                  {t("pricing.basic.price")}
                  <span className="text-lg text-muted-foreground">
                    {t("pricing.basic.period")}
                  </span>
                </div>
                <p className="text-muted-foreground mb-6">
                  {t("pricing.basic.description")}
                </p>
                <ul className="space-y-3 mb-8">
                  {(() => {
                    const features = t("pricing.basic.features");
                    // Check if features is an array
                    if (Array.isArray(features)) {
                      return features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <svg
                            className="w-5 h-5 text-primary mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ));
                    } else {
                      // Fallback for when features is not an array
                      return (
                        <li className="flex items-center">
                          <svg
                            className="w-5 h-5 text-primary mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>
                            Online bookings, Email reminders, Business profile
                          </span>
                        </li>
                      );
                    }
                  })()}
                </ul>
                <Link
                  href="/signup?plan=basic"
                  className="block w-full py-3 bg-card border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-center"
                >
                  {t("pricing.basic.cta")}
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="bg-card p-8 rounded-xl shadow-soft hover-lift relative transform md:scale-105 border-gradient animate-on-scroll">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-3 py-1 uppercase tracking-wide rounded-bl">
                  {t("pricing.pro.popular")}
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("pricing.pro.title")}
                </h3>
                <div className="text-4xl font-bold mb-4 gradient-text">
                  {t("pricing.pro.price")}
                  <span className="text-lg text-muted-foreground">
                    {t("pricing.pro.period")}
                  </span>
                </div>
                <p className="text-muted-foreground mb-6">
                  {t("pricing.pro.description")}
                </p>
                <ul className="space-y-3 mb-8">
                  {(() => {
                    const features = t("pricing.pro.features");
                    // Check if features is an array
                    if (Array.isArray(features)) {
                      return features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <svg
                            className="w-5 h-5 text-primary mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ));
                    } else {
                      // Fallback for when features is not an array
                      return (
                        <li className="flex items-center">
                          <svg
                            className="w-5 h-5 text-primary mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>
                            All Basic features, SMS reminders, Multiple staff
                            members, Advanced analytics
                          </span>
                        </li>
                      );
                    }
                  })()}
                </ul>
                <Link
                  href="/signup?plan=pro"
                  className="block w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center hover-lift"
                >
                  {t("pricing.pro.cta")}
                </Link>
              </div>

              {/* Premium Plan */}
              <div className="bg-card p-8 rounded-xl shadow-soft hover-lift border-gradient animate-on-scroll">
                <h3 className="text-xl font-semibold mb-3">
                  {t("pricing.premium.title")}
                </h3>
                <div className="text-4xl font-bold mb-4 gradient-text">
                  {t("pricing.premium.price")}
                  <span className="text-lg text-muted-foreground">
                    {t("pricing.premium.period")}
                  </span>
                </div>
                <p className="text-muted-foreground mb-6">
                  {t("pricing.premium.description")}
                </p>
                <ul className="space-y-3 mb-8">
                  {(() => {
                    const features = t("pricing.premium.features");
                    // Check if features is an array
                    if (Array.isArray(features)) {
                      return features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <svg
                            className="w-5 h-5 text-primary mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ));
                    } else {
                      // Fallback for when features is not an array
                      return (
                        <li className="flex items-center">
                          <svg
                            className="w-5 h-5 text-primary mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>
                            All Pro features, Multiple locations, Custom
                            branding, Priority support
                          </span>
                        </li>
                      );
                    }
                  })()}
                </ul>
                <Link
                  href="/signup?plan=premium"
                  className="block w-full py-3 bg-card border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-center"
                >
                  {t("pricing.premium.cta")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg z-0"></div>
          <div className="container mx-auto max-w-4xl text-center relative z-10">
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
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-gray-300 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4 gradient-text">
                {t("app.name")}
              </div>
              <p className="text-gray-400">{t("footer.description")}</p>
              <div className="mt-6 flex gap-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">
                {t("footer.product")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("nav.features")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("nav.pricing")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("nav.howItWorks")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">
                {t("footer.company")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">
                {t("footer.legal")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer.termsOfService")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer.privacyPolicy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer.cookiePolicy")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>
              {t("footer.copyright").replace(
                "{year}",
                new Date().getFullYear().toString()
              )}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
