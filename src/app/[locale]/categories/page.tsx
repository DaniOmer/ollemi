"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Category } from "@/types";
import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import {
  fetchCategories,
  selectCategories,
  selectCategoriesLoading,
  selectCategoriesError,
} from "@/lib/redux/slices/categoriesSlice";
import CategoryCard from "@/components/categories/CategoryCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CategoriesPage() {
  const { t } = useTranslations();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const isLoading = useAppSelector(selectCategoriesLoading);
  const error = useAppSelector(selectCategoriesError);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Filter categories based on search term
  const filteredCategories = categories.filter((category: Category) =>
    searchTerm
      ? category.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-12 px-4">
        <div className="md:container mx-auto max-w-6xl">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
              {t("client.home.categories.title")}
            </h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t("client.home.categories.subtitle")}
            </p>
          </div>

          {/* Search Bar */}
          {/* <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  t("client.categories.searchPlaceholder") ||
                  "Search categories..."
                }
                className="w-full px-4 py-3 pl-10 rounded-lg border border-input bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div> */}

          {/* Categories Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
              <button
                onClick={() => dispatch(fetchCategories())}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
              >
                {t("common.tryAgain") || "Try Again"}
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>
                {t("client.home.categories.noResults") ||
                  "No categories found."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category: Category) => (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  imageUrl={category.imageUrl}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
