"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  Clock,
  Calendar,
  Filter,
  ChevronDown,
  Search,
  ArrowLeft,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { Company } from "@/types";
import { searchCompanies } from "@/lib/services/companies";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import {
  AddressAutocomplete,
  AddressData,
} from "@/components/forms/AddressAutocomplete";
import { ServiceSearchAutocomplete } from "@/components/forms/ServiceSearchAutocomplete";
import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import {
  selectCategories,
  fetchCategories,
} from "@/lib/redux/slices/categoriesSlice";

export default function SearchResults() {
  const { t } = useTranslations();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);

  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to safely parse JSON from URL params
  const safeJsonParse = <T,>(str: string | null, fallback: T): T => {
    if (!str) return fallback;
    try {
      return JSON.parse(str) as T;
    } catch (e) {
      console.error("Failed to parse URL param:", e);
      return fallback;
    }
  };

  // Fetch categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const [searchCategory, setSearchCategory] = useState(
    searchParams.get("category") || ""
  );
  const [searchLocation, setSearchLocation] = useState(
    searchParams.get("location") || ""
  );
  const [searchDate, setSearchDate] = useState(searchParams.get("date") || "");
  const [searchAddress, setSearchAddress] = useState<AddressData | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  // Initialize filters from URL parameters
  const [priceRange, setPriceRange] = useState<[number, number]>(
    safeJsonParse(searchParams.get("price"), [0, 200])
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(
    searchParams.get("rating")
      ? parseInt(searchParams.get("rating") || "0")
      : null
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    safeJsonParse(searchParams.get("categories"), [])
  );

  // Initialize selectedCategories with the search category if it exists and categories is empty
  useEffect(() => {
    if (searchCategory && selectedCategories.length === 0) {
      setSelectedCategories([searchCategory]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCategory]); // Only run when searchCategory changes initially

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use the first selected category for the API search
        const categoryToSearch =
          selectedCategories.length > 0
            ? selectedCategories[0]
            : searchCategory;

        const response = await searchCompanies({
          category: categoryToSearch,
          location: searchLocation,
          date: searchDate,
          rating: selectedRating !== null ? selectedRating : undefined,
        });

        if (response.error) {
          throw new Error(response.error);
        }

        setResults(response.data || []);
      } catch (err: any) {
        console.error("Error fetching search results:", err);
        setError(err.message || "Failed to fetch search results");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [
    searchCategory,
    searchLocation,
    searchDate,
    selectedRating,
    selectedCategories,
  ]);

  const handleAddressSelect = (address: AddressData) => {
    setSearchAddress(address);
    setSearchLocation(address.fullAddress);
  };

  // Update URL parameters whenever search criteria or filters change
  useEffect(() => {
    const updateUrlParams = () => {
      const params = new URLSearchParams(window.location.search);

      if (searchCategory) params.set("category", searchCategory);
      else params.delete("category");
      if (searchLocation) params.set("location", searchLocation);
      else params.delete("location");
      if (searchDate) params.set("date", searchDate);
      else params.delete("date");

      if (selectedRating !== null)
        params.set("rating", selectedRating.toString());
      else params.delete("rating");
      if (selectedCategories.length > 0)
        params.set("categories", JSON.stringify(selectedCategories));
      else params.delete("categories");
      if (priceRange[0] !== 0 || priceRange[1] !== 200)
        params.set("price", JSON.stringify(priceRange));
      else params.delete("price");

      // Use replaceState to avoid adding to browser history
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    };
    updateUrlParams();
  }, [
    searchCategory,
    searchLocation,
    searchDate,
    selectedRating,
    selectedCategories,
    priceRange,
  ]);

  const handleSearch = () => {
    // This function might not be strictly needed anymore as useEffect updates URL,
    // but we can keep it if direct button click should trigger something specific
    // For now, it just ensures the latest state is reflected in the URL,
    // which useEffect already does.
    // We could potentially trigger a manual refetch here if needed.
    console.log("Manual search triggered (URL updated via useEffect)");
  };

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  const toggleCategory = (category: string): void => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(selectedRating === rating ? null : rating);
  };

  // Filter results based on selected filters
  const filteredResults = results.filter((company: any) => {
    // Filter by price range if company has services
    const priceFilter =
      !company.services ||
      company.services.some(
        (service: any) =>
          service.price >= priceRange[0] && service.price <= priceRange[1]
      );

    // Filter by rating
    const ratingFilter =
      selectedRating === null ||
      (company.rating && company.rating >= selectedRating);

    // We don't need to filter by categories here since the API already does that
    // and we're using the first selected category for the API search

    return priceFilter && ratingFilter;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Search Header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-6 px-4">
          <div className="container mx-auto max-w-6xl">
            <Link
              href="/"
              className="inline-flex items-center text-primary mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t("search.backToHome")}
            </Link>

            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="col-span-4 md:col-span-1">
                  <label className="block text-sm font-medium mb-2">
                    {t("client.home.search.service")}
                  </label>
                  <ServiceSearchAutocomplete
                    onCategorySelect={setSearchCategory}
                    defaultValue={searchCategory}
                    placeholder={t("client.home.search.servicePlaceholder")}
                    className="w-full"
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
                  <button
                    className="w-full h-[50px] bg-primary rounded-lg text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    onClick={handleSearch}
                  >
                    <Search className="h-4 w-4" />
                    {t("search.searchButton")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="container mx-auto max-w-6xl py-8 px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="w-full md:w-64 shrink-0">
              <div className="bg-white rounded-xl shadow-md p-4 mb-4 md:hidden">
                <button
                  className="w-full flex items-center justify-between text-lg font-medium"
                  onClick={toggleFilters}
                >
                  <div className="flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    {t("search.filters.title")}
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      filtersOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <div
                className={`bg-white rounded-xl shadow-md p-4 ${
                  filtersOpen ? "block" : "hidden md:block"
                }`}
              >
                <h3 className="text-lg font-medium mb-4">
                  {t("search.filters.title")}
                </h3>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t("search.priceRange")}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span>€{priceRange[0]}</span>
                    <span>€{priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full"
                  />
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t("search.rating")}</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        className={`flex items-center w-full p-2 rounded-md transition-colors ${
                          selectedRating === rating
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleRatingSelect(rating)}
                      >
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2">{t("search.andUp")}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t("search.categories")}</h4>
                  <div className="space-y-2">
                    {categories.map(
                      (category: {
                        id: string;
                        name: string;
                        imageUrl: string;
                      }) => (
                        <label key={category.id} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded text-primary mr-2"
                            checked={selectedCategories.includes(category.name)}
                            onChange={() => toggleCategory(category.name)}
                          />
                          {category.name}
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  {loading
                    ? t("search.searching")
                    : error
                    ? t("search.searchError")
                    : filteredResults.length === 0
                    ? t("search.noResults")
                    : `${t("search.resultsCount")} (${filteredResults.length})`}
                </h2>
                {searchCategory && searchLocation && (
                  <p className="text-muted-foreground">
                    {`${t("search.searchingFor")} "${searchCategory}" ${t(
                      "search.in"
                    )} "${searchLocation}"`}
                  </p>
                )}
              </div>

              {loading ? (
                // Skeleton loaders
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3 h-48 md:h-auto bg-gray-200"></div>
                        <div className="p-6 md:w-2/3">
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                          <div className="h-10 bg-gray-200 rounded w-1/3 mt-6"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                  {error}
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium mb-2">
                    {t("search.noResultsFound")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t("search.tryAdjustingFilters")}
                  </p>
                  <button
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    onClick={() => {
                      setSelectedRating(null);
                      setSelectedCategories([]);
                      setPriceRange([0, 200]);
                      // Clear main search fields as well
                      setSearchCategory("");
                      setSearchLocation("");
                      setSearchDate("");
                      // The useEffect hook will clear the URL params
                    }}
                  >
                    {t("search.clearFilters")}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredResults.map((company: any) => (
                    <div
                      key={company.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3 relative">
                          {company.photos && company.photos.length > 0 ? (
                            <div className="h-48 md:h-full relative">
                              <Image
                                src={company.photos[0].url}
                                alt={company.photos[0].alt || company.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-48 md:h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                              <div className="text-6xl font-bold text-primary/20">
                                {company.name.charAt(0)}
                              </div>
                            </div>
                          )}
                          {company.rating && (
                            <div className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-1 flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                              <span className="font-medium">
                                {company.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-6 md:w-2/3">
                          <h3 className="text-xl font-bold mb-2">
                            {company.name}
                          </h3>
                          <div className="flex items-center text-muted-foreground mb-3">
                            <MapPin className="w-4 h-4 mr-1 shrink-0" />
                            <span className="truncate">
                              {company.addresses?.formatted_address}
                            </span>
                          </div>

                          {company.services && company.services.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">
                                {t("search.popularServices")}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {company.services
                                  .slice(0, 3)
                                  .map((service: any) => (
                                    <div
                                      key={service.id}
                                      className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                                    >
                                      <span>{service.name}</span>
                                      <span className="mx-1">•</span>
                                      <span className="font-medium">
                                        €{service.price}
                                      </span>
                                      <span className="mx-1">•</span>
                                      <span className="flex items-center text-muted-foreground">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {service.duration}min
                                      </span>
                                    </div>
                                  ))}
                                {company.services.length > 3 && (
                                  <div className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                                    +{company.services.length - 3}{" "}
                                    {t("search.more")}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-4">
                            <Link
                              href={`/booking/${company.id}`}
                              className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {t("search.bookNow")}
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
