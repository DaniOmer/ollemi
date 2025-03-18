"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";

export default function ProfessionalHome() {
  const { t } = useTranslations();

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
      <div className="flex-grow">
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
      </div>
    </div>
  );
}
