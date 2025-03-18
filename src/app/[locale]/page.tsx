"use client";

import Link from "next/link";
import Image from "next/image";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useEffect, useState } from "react";
import { getProfessionals } from "@/lib/services/professionals";
import { Professional } from "@/types";
import { useTranslations } from "@/hooks/useTranslations";
import {
  Scissors,
  Smartphone,
  Palette,
  Sun,
  Smile,
  User,
  MapPin,
  ChevronRight,
  Search,
} from "lucide-react";

import ClientHeader from "@/components/layouts/ClientHeader";

export default function Home() {
  const { t } = useTranslations();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchService, setSearchService] = useState("");
  const [searchDate, setSearchDate] = useState("");

  // Fetch professionals
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const response = await getProfessionals();
        if (response.data) {
          setProfessionals(response.data);
        }
      } catch (error) {
        console.error("Error fetching professionals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

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

  // Categories with icons
  const categories = [
    {
      id: "haircut",
      name: t("client.home.categories.haircut"),
      icon: <Scissors className="w-6 h-6" />,
    },
    {
      id: "nails",
      name: t("client.home.categories.nails"),
      icon: <Smartphone className="w-6 h-6" />,
    },
    {
      id: "makeup",
      name: t("client.home.categories.makeup"),
      icon: <Palette className="w-6 h-6" />,
    },
    {
      id: "skincare",
      name: t("client.home.categories.skincare"),
      icon: <Sun className="w-6 h-6" />,
    },
    {
      id: "massage",
      name: t("client.home.categories.massage"),
      icon: <Smile className="w-6 h-6" />,
    },
    {
      id: "barber",
      name: t("client.home.categories.barber"),
      icon: <User className="w-6 h-6" />,
    },
  ];

  // Professional card component
  const ProfessionalCard = ({
    professional,
  }: {
    professional: Professional;
  }) => {
    return (
      <div className="bg-card rounded-xl shadow-soft overflow-hidden hover-lift transition-all">
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10">
          {professional.photos && professional.photos.length > 0 ? (
            <Image
              src={professional.photos[0].url}
              alt={professional.photos[0].alt || professional.business_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl font-bold text-primary/20">
                {professional.business_name.charAt(0)}
              </div>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-xl font-semibold mb-2">
            {professional.business_name}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {professional.city}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {professional.services.slice(0, 3).map((service) => (
              <span
                key={service.id}
                className="text-xs px-2 py-1 bg-secondary rounded-full"
              >
                {service.name}
              </span>
            ))}
            {professional.services.length > 3 && (
              <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                +{professional.services.length - 3}
              </span>
            )}
          </div>
          <Link
            href={`/professional/${professional.id}`}
            className="block w-full py-2 bg-primary text-white rounded-lg text-center hover:bg-primary/90 transition-colors"
          >
            {t("client.professional.book")}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <ClientHeader />

      <main className="flex-grow">
        {/* Hero Section with Search */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background z-0"></div>
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-12 animate-slide-up">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight gradient-text mb-6">
                {t("client.home.title")}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("client.home.subtitle")}
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-card rounded-xl shadow-soft p-6 mb-12 animate-slide-up">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="col-span-4 md:col-span-1">
                  <label className="block text-sm font-medium mb-2">
                    {t("client.home.search.location")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("client.home.search.locationPlaceholder")}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-input bg-background"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="col-span-4 md:col-span-1">
                  <label className="block text-sm font-medium mb-2">
                    {t("client.home.search.service")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("client.home.search.servicePlaceholder")}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-input bg-background"
                      value={searchService}
                      onChange={(e) => setSearchService(e.target.value)}
                    />
                    <Scissors className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="col-span-4 md:col-span-1">
                  <label className="block text-sm font-medium mb-2">
                    {t("client.home.search.date")}
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                  />
                </div>
                <div className="col-span-4 md:col-span-1 flex items-end">
                  <button className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Search className="h-4 w-4" />
                    {t("client.home.search.button")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold gradient-text">
                {t("client.home.categories.title")}
              </h2>
              <Link
                href="/categories"
                className="text-primary hover:underline flex items-center"
              >
                {t("client.home.categories.viewAll")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="bg-card rounded-xl p-6 text-center hover-lift transition-all"
                >
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    {category.icon}
                  </div>
                  <span className="font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Professionals */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold gradient-text">
                {t("client.home.featured.title")}
              </h2>
              <Link
                href="/professionals"
                className="text-primary hover:underline flex items-center"
              >
                {t("client.home.featured.viewAll")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-card rounded-xl shadow-soft overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-primary/5"></div>
                    <div className="p-5">
                      <div className="h-6 bg-primary/5 rounded mb-2"></div>
                      <div className="h-4 bg-primary/5 rounded mb-3 w-2/3"></div>
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 bg-primary/5 rounded w-16"></div>
                        <div className="h-6 bg-primary/5 rounded w-16"></div>
                      </div>
                      <div className="h-10 bg-primary/5 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : professionals.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {professionals.slice(0, 3).map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No professionals found.
              </div>
            )}
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
                {t("client.home.howItWorks.title")}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <div className="text-center animate-on-scroll">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 shadow-soft animate-pulse-subtle">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("client.home.howItWorks.step1.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("client.home.howItWorks.step1.description")}
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center animate-on-scroll">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 shadow-soft animate-pulse-subtle">
                  <span className="text-2xl font-bold ">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("client.home.howItWorks.step2.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("client.home.howItWorks.step2.description")}
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center animate-on-scroll">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 shadow-soft animate-pulse-subtle">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("client.home.howItWorks.step3.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("client.home.howItWorks.step3.description")}
                </p>
              </div>

              {/* Connecting line */}
              <div className="hidden md:block absolute top-[40px] left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] h-0.5 bg-gradient-to-r from-primary/30 via-accent/50 to-primary/30"></div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg z-0"></div>
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white animate-on-scroll">
              {t("client.home.cta.title")}
            </h2>
            <p className="text-xl mb-8 text-white/80 max-w-2xl mx-auto animate-on-scroll">
              {t("client.home.cta.subtitle")}
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-white text-primary rounded-lg font-semibold hover-lift hover:bg-white/95 transition-all shadow-soft animate-on-scroll"
            >
              {t("client.home.cta.button")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
