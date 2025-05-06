"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchCompanies } from "@/lib/redux/slices/companiesSlice";
import { fetchCategories } from "@/lib/redux/slices/categoriesSlice";
import {
  Professional,
  Company,
  Category,
  Photo,
  Service,
  Address,
} from "@/types";
import { useTranslations } from "@/hooks/useTranslations";
import { MapPin, ChevronRight, Search } from "lucide-react";

import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import Carousel from "@/components/ui/Carousel";
import CategoryCard from "@/components/categories/CategoryCard";
import {
  AddressAutocomplete,
  AddressData,
} from "@/components/forms/AddressAutocomplete";
import { ServiceSearchAutocomplete } from "@/components/forms/ServiceSearchAutocomplete";
import Select from "@/components/ui/select";
import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import {
  selectCompanies,
  selectCompaniesLoading,
} from "@/lib/redux/slices/companiesSlice";
import {
  selectCategories,
  selectCategoriesLoading,
} from "@/lib/redux/slices/categoriesSlice";

export default function Home() {
  const { t } = useTranslations();
  const [searchLocation, setSearchLocation] = useState("");
  const [searchAddress, setSearchAddress] = useState<AddressData | null>(null);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const dispatch = useAppDispatch();
  const companies = useAppSelector(selectCompanies);
  const categories = useAppSelector(selectCategories);
  const categoriesLoading = useAppSelector(selectCategoriesLoading);
  const loading = useAppSelector(selectCompaniesLoading);

  // Prepare categories for the Select component
  const categoryOptions = categories.map((category: Category) => ({
    value: category.name, // Use category name as value for now, adjust if needed
    label: category.name,
  }));

  // Fetch companies
  useEffect(() => {
    const fetchCompanyList = async () => {
      await dispatch(fetchCompanies());
    };
    fetchCompanyList();
  }, [dispatch]);

  // Fetch categories
  useEffect(() => {
    const fetchCompanyCategories = async () => {
      await dispatch(fetchCategories());
    };
    fetchCompanyCategories();
  }, [dispatch]);

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

  const handleAddressSelect = (address: AddressData) => {
    setSearchAddress(address);
    setSearchLocation(address.fullAddress);
  };

  // Professional card component
  const ProfessionalCard = ({
    professional,
  }: {
    professional: Professional & {
      photos: Photo[];
      services: Service[];
      addresses: Address;
    };
  }) => {
    return (
      <div className="bg-card rounded-xl shadow-soft overflow-hidden hover-lift transition-all">
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10">
          {professional.photos && professional.photos.length > 0 ? (
            <Image
              src={professional.photos[0].url}
              alt={professional.photos[0].alt || professional.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl font-bold text-primary/20">
                {professional.name.charAt(0)}
              </div>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-xl font-semibold mb-2">{professional.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {professional.addresses?.formatted_address}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {professional.services &&
              professional.services.slice(0, 3).map((service) => (
                <span
                  key={service.id}
                  className="text-xs px-2 py-1 bg-secondary rounded-full"
                >
                  {service.name}
                </span>
              ))}
            {professional.services && professional.services.length > 3 && (
              <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                +{professional.services.length - 3}
              </span>
            )}
          </div>
          <Link
            href={`/pro/${professional.id}`}
            className="block w-full py-2 bg-primary text-white rounded-lg text-center hover:bg-primary/90 transition-colors"
          >
            {t("professional.book")}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section with Search */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background z-0"></div>
          <div className="md:container mx-auto md:max-w-6xl relative z-10">
            <div className="text-center mb-12 animate-slide-up">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight gradient-text mb-6">
                {t("client.home.title")}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("client.home.subtitle")}
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-card rounded-xl shadow-soft p-3 md:p-6 mb-6 md:mb-12 animate-slide-up">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="col-span-4 md:col-span-1">
                  <label className="block text-sm font-medium mb-2">
                    {t("client.home.search.service")}
                  </label>
                  <Select
                    options={categoryOptions}
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    placeholder={t("client.home.search.servicePlaceholder")}
                    className="w-full"
                    disabled={categoriesLoading}
                  />
                </div>
                <div className="col-span-4 md:col-span-1">
                  <label className="block text-sm font-medium mb-2">
                    {t("client.home.search.location")}
                  </label>
                  <div className="relative h-[50px]">
                    <AddressAutocomplete
                      onAddressSelect={handleAddressSelect}
                      defaultValue={searchLocation}
                      placeholder={t("client.home.search.locationPlaceholder")}
                      className="w-full"
                      inputClassName="w-full h-[50px] px-4 py-3 pl-10 rounded-lg border border-input bg-background"
                      required={false}
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="col-span-4 md:col-span-1">
                  <label className="block text-sm font-medium mb-2">
                    {t("client.home.search.date")}
                  </label>
                  <input
                    type="date"
                    className="w-full h-[50px] px-4 py-3 rounded-lg border border-input bg-background"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                  />
                </div>
                <div className="col-span-4 md:col-span-1 flex items-end">
                  <Link
                    href={`/search?category=${encodeURIComponent(
                      searchCategory
                    )}&location=${encodeURIComponent(
                      searchLocation
                    )}&date=${encodeURIComponent(searchDate)}`}
                    className="w-full py-3.5 bg-primary rounded-lg text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    {t("client.home.search.button")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center animate-on-scroll">
            <p className="mt-10 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
              <span className="text-primary font-bold">568 </span>
              {t("client.home.proof.subtitle")}.
            </p>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-10 px-4 bg-secondary/30">
          <div className="md:container mx-auto max-w-6xl">
            <div className="flex justify-between items-center gap-2 mb-12">
              <h2 className="text-xl md:text-3xl font-bold gradient-text">
                {t("client.home.categories.title")}
              </h2>
              <Link
                href="/categories"
                className="text-sm md:text-base text-primary hover:underline flex items-center"
              >
                {t("client.home.categories.viewAll")}
                <ChevronRight className="w-4 h-4 md:ml-1" />
              </Link>
            </div>

            {categoriesLoading ? (
              // Skeleton loaders for categories
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-xl overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-primary/5"></div>
                    <div className="p-4">
                      <div className="h-6 w-24 bg-primary/5 rounded"></div>
                    </div>
                  </div>
                ))
            ) : (
              <Carousel
                slidesPerView={1.3}
                spaceBetween={16}
                breakpoints={{
                  500: { slidesPerView: 2.3, spaceBetween: 16 },
                  768: { slidesPerView: 3.3, spaceBetween: 20 },
                  1024: { slidesPerView: 4.3, spaceBetween: 24 },
                }}
                className=""
                pagination={true}
              >
                {categories.map((category: Category) => {
                  return (
                    <CategoryCard
                      key={category.id}
                      id={category.id}
                      name={category.name}
                      imageUrl={category.imageUrl}
                    />
                  );
                })}
              </Carousel>
            )}
          </div>
        </section>

        {/* Featured Professionals */}
        <section className="py-10 px-4">
          <div className="md:container mx-auto max-w-6xl">
            <div className="flex justify-between items-center gap-2 mb-12">
              <h2 className="text-xl md:text-3xl font-bold gradient-text">
                {t("client.home.featured.title")}
              </h2>
              <Link
                href="/professionals"
                className="text-sm md:text-base text-primary hover:underline flex items-center"
              >
                {t("client.home.featured.viewAll")}
                <ChevronRight className="w-4 h-4 md:ml-1" />
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
            ) : companies.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {companies.slice(0, 3).map(
                  (
                    company: Company & {
                      photos: Photo[];
                      services: Service[];
                      addresses: Address;
                    }
                  ) => (
                    <ProfessionalCard key={company.id} professional={company} />
                  )
                )}
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
          className="py-10 md:py-20 px-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-accent/5 z-0"></div>
          <div className="md:container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-xl md:text-3xl font-bold gradient-text">
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
                  <span className="text-2xl font-bold">2</span>
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
          <div className="md:container mx-auto max-w-4xl text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white animate-on-scroll">
              {t("client.home.cta.title")}
            </h2>
            <p className="text-xl mb-8 text-white max-w-2xl mx-auto animate-on-scroll">
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
      <Footer />
    </div>
  );
}
