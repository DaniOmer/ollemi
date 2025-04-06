"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";

import { useTranslations } from "@/hooks/useTranslations";
import { Category, Professional } from "@/types";

import { useAppDispatch } from "@/lib/redux/store";
import { selectCompaniesByCategory } from "@/lib/redux/slices/companiesSlice";
import {
  fetchCategoryById,
  selectCurrentCategory,
} from "@/lib/redux/slices/categoriesSlice";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Search,
  Filter,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const CategoryPage = () => {
  const { t } = useTranslations();
  const params = useParams();
  let categoryId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  const dispatch = useAppDispatch();
  const category = useSelector(selectCurrentCategory);

  // Get companies from the category if available
  const companiesByCategory = category?.companies || [];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch category details with companies included
        const { id } = await params;
        categoryId = id as string;
        await dispatch(
          fetchCategoryById({ id: categoryId, includeCompanies: true })
        );
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, dispatch]);

  // Filter professionals based on search term
  const filteredProfessionals = companiesByCategory.filter(
    (pro: Professional) =>
      searchTerm
        ? pro.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true
  );

  // Professional Card Component
  const ProfessionalCard = ({
    professional,
  }: {
    professional: Professional;
  }) => {
    return (
      <div className="bg-card rounded-xl shadow-soft overflow-hidden hover-lift transition-all">
        <div className="relative h-52 bg-gradient-to-br from-primary/10 to-accent/10">
          {professional.photos && professional.photos.length > 0 ? (
            <Image
              src={professional.photos[0].url}
              alt={professional.photos[0].alt || professional.name}
              fill
              className="object-cover"
            />
          ) : professional.imageUrl ? (
            <Image
              src={professional.imageUrl}
              alt={professional.name}
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
            {professional.addresses?.city || t("professional.noLocation")}
          </div>
          {professional.services && professional.services.length > 0 && (
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
          )}
          <Link
            href={`/pro/${professional.id}`}
            className="block w-full py-2 bg-primary text-white rounded-lg text-center hover:bg-primary/90 transition-colors"
          >
            {t("professional.viewProfile")}
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          {t("common.error")}
        </h2>
        <p className="mb-4">{error}</p>
        <Link href="/" className="text-primary hover:underline">
          {t("nav.backToHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Category Header with Search */}
      <div className="mb-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 gradient-text">
            {category?.name}
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t("client.category.subheading")}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-card rounded-xl shadow-soft p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder={t("client.category.searchPlaceholder")}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-input bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <button
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/90"
              onClick={() => setIsFiltering(!isFiltering)}
            >
              <Filter className="h-4 w-4" />
              {t("client.category.filter")}
            </button>
          </div>

          {/* Advanced Filter Options - Hidden by default */}
          {isFiltering && (
            <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Add filter options here when needed */}
                <div className="col-span-full text-center text-sm text-muted-foreground">
                  {t("client.category.comingSoon")}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professionals Count */}
      <div className="mb-6">
        <h2 className="text-xl font-medium">
          {filteredProfessionals.length} {t("client.category.subheading")}
        </h2>
      </div>

      {/* Professionals List */}
      {filteredProfessionals.length === 0 ? (
        <div className="text-center py-12 bg-secondary/10 rounded-lg">
          <h3 className="font-medium text-xl mb-2">
            {searchTerm
              ? t("client.category.noSearchResults")
              : t("client.category.noProfessionals")}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? t("client.category.tryDifferentSearch")
              : t("client.category.checkBack")}
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm("")}
              className="inline-block px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              {t("client.category.clearSearch")}
            </button>
          ) : (
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              {t("nav.backToHome")}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((professional: Professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
