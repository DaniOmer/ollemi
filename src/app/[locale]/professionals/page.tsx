"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { fetchCompanies } from "@/lib/redux/slices/companiesSlice";
import { fetchCategories } from "@/lib/redux/slices/categoriesSlice";
import {
  selectCompanies,
  selectCompaniesLoading,
} from "@/lib/redux/slices/companiesSlice";
import {
  selectCategories,
  selectCategoriesLoading,
} from "@/lib/redux/slices/categoriesSlice";
import { Company, Category, Service } from "@/types";
import { useTranslations } from "@/hooks/useTranslations";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import {
  MapPin,
  Search,
  Filter,
  Star,
  ChevronDown,
  X,
  Check,
} from "lucide-react";

export default function ProfessionalsPage() {
  const { t } = useTranslations();
  const dispatch = useAppDispatch();

  // Redux state
  const companies = useAppSelector(selectCompanies);
  const categories = useAppSelector(selectCategories);
  const isLoading = useAppSelector(selectCompaniesLoading);
  const categoriesLoading = useAppSelector(selectCategoriesLoading);

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [minRating, setMinRating] = useState(0);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("recommended");

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Apply filters when dependencies change
  useEffect(() => {
    if (!companies) return;

    let filtered = [...companies];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          company.services?.some((service: Service) =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((company) =>
        company.company_categories?.some((cc: { category: Category }) =>
          selectedCategories.includes(cc.category.id)
        )
      );
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(
        (company) =>
          company.city
            ?.toLowerCase()
            .includes(selectedLocation.toLowerCase()) ||
          company.zipcode?.includes(selectedLocation)
      );
    }

    // Apply price filter
    filtered = filtered.filter((company) => {
      if (!company.services || company.services.length === 0) return true;
      const minPrice = Math.min(
        ...company.services.map((s: Service) => s.price)
      );
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // Apply rating filter
    filtered = filtered.filter((company) => {
      if (!company.rating) return minRating === 0;
      return company.rating >= minRating;
    });

    // Apply sorting
    if (sortOption === "priceAsc") {
      filtered.sort((a, b) => {
        const aMinPrice = a.services?.length
          ? Math.min(...a.services.map((s: Service) => s.price))
          : 0;
        const bMinPrice = b.services?.length
          ? Math.min(...b.services.map((s: Service) => s.price))
          : 0;
        return aMinPrice - bMinPrice;
      });
    } else if (sortOption === "priceDesc") {
      filtered.sort((a, b) => {
        const aMinPrice = a.services?.length
          ? Math.min(...a.services.map((s: Service) => s.price))
          : 0;
        const bMinPrice = b.services?.length
          ? Math.min(...b.services.map((s: Service) => s.price))
          : 0;
        return bMinPrice - aMinPrice;
      });
    } else if (sortOption === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredCompanies(filtered);
  }, [
    companies,
    searchTerm,
    selectedCategories,
    selectedLocation,
    priceRange,
    minRating,
    sortOption,
  ]);

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedLocation("");
    setPriceRange([0, 500000]);
    setMinRating(0);
    setSortOption("recommended");
  };

  // Professional card component
  const ProfessionalCard = ({ professional }: { professional: Company }) => {
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
          {professional.rating && (
            <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 flex items-center text-sm font-medium">
              <Star className="w-4 h-4 text-yellow-400 mr-1 fill-yellow-400" />
              {professional.rating.toFixed(1)}
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-xl font-semibold mb-2">{professional.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {professional.addresses?.city || t("common.noLocation")}
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
          {professional.services && professional.services.length > 0 && (
            <div className="text-sm mb-4">
              <span className="font-medium">
                {`${professional.services[0].duration} min - ${professional.services[0].price} FCFA`}
              </span>
            </div>
          )}
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

  // Rating stars component
  const RatingStars = ({
    rating,
    onChange,
  }: {
    rating: number;
    onChange: (rating: number) => void;
  }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section with Search */}
        <section className="py-12 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background z-0"></div>
          <div className="md:container mx-auto md:max-w-6xl relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight gradient-text mb-4">
                {t("search.title")}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("client.home.subtitle")}
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-card rounded-xl shadow-soft p-3 md:p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("client.home.search.placeholder")}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-input bg-background"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="md:w-1/4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("client.home.search.locationPlaceholder")}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-input bg-background"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    />
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <button
                  className="px-4 py-3 bg-secondary rounded-lg text-foreground hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                  {t("search.filters.title")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 px-4">
          <div className="md:container mx-auto md:max-w-6xl">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Filters Sidebar */}
              <div
                className={`md:w-1/4 bg-card rounded-xl shadow-soft p-4 md:p-6 h-fit ${
                  isFilterOpen ? "block" : "hidden md:block"
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {t("search.filters.title")}
                  </h2>
                  <button
                    className="md:hidden text-muted-foreground"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Categories Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">
                    {t("client.home.categories.title")}
                  </h3>
                  <div className="space-y-2">
                    {categoriesLoading ? (
                      <div className="animate-pulse space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-6 bg-primary/5 rounded w-full"
                          ></div>
                        ))}
                      </div>
                    ) : (
                      categories.map((category: Category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer ${
                              selectedCategories.includes(category.id)
                                ? "bg-primary text-white"
                                : "border border-input"
                            }`}
                            onClick={() => toggleCategory(category.id)}
                          >
                            {selectedCategories.includes(category.id) && (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                          <span className="text-sm">{category.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">
                    {t("search.filters.price")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>{priceRange[0]} FCFA</span>
                      <span>{priceRange[1]} FCFA</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500000"
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">
                    {t("search.filters.rating")}
                  </h3>
                  <RatingStars
                    rating={minRating}
                    onChange={(rating) => setMinRating(rating)}
                  />
                </div>

                {/* Reset Filters */}
                <button
                  className="w-full py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                  onClick={resetFilters}
                >
                  {t("common.reset")}
                </button>
              </div>

              {/* Results */}
              <div className="md:w-3/4">
                {/* Sort and Results Count */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div className="text-lg font-medium mb-4 md:mb-0">
                    {filteredCompanies.length}{" "}
                    {t("client.category.professionalsFound")}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {t("search.sort.title")}:
                    </span>
                    <div className="relative">
                      <select
                        className="appearance-none bg-card border border-input rounded-lg px-4 py-2 pr-8 text-sm"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                      >
                        <option value="recommended">
                          {t("search.sort.recommended")}
                        </option>
                        <option value="priceAsc">
                          {t("search.sort.priceAsc")}
                        </option>
                        <option value="priceDesc">
                          {t("search.sort.priceDesc")}
                        </option>
                        <option value="rating">
                          {t("search.sort.rating")}
                        </option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 pointer-events-none text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Mobile Filter Button */}
                <div className="md:hidden mb-4">
                  <button
                    className="w-full py-3 bg-secondary rounded-lg text-foreground hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <Filter className="h-4 w-4" />
                    {t("search.filters.title")}
                  </button>
                </div>

                {/* Results Grid */}
                {isLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
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
                ) : filteredCompanies.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map((company) => (
                      <ProfessionalCard
                        key={company.id}
                        professional={company}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-card rounded-xl shadow-soft">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">
                      {t("search.noResults")}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {t("category.tryDifferentSearch")}
                    </p>
                    <button
                      className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      onClick={resetFilters}
                    >
                      {t("category.clearSearch")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
