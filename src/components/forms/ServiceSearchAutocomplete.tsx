"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { Category } from "@/types";

interface ServiceSearchAutocompleteProps {
  onServiceSelect: (service: string) => void;
  defaultValue?: string;
  categories: Category[];
  className?: string;
  placeholder?: string;
}

export function ServiceSearchAutocomplete({
  onServiceSelect,
  defaultValue = "",
  categories,
  className = "",
  placeholder,
}: ServiceSearchAutocompleteProps) {
  const { t } = useTranslations();
  const [query, setQuery] = useState<string>(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate suggestions based on categories and query
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Get category names
    const categoryNames = categories.map((cat) => cat.name);

    // Filter categories that match the query
    const filteredSuggestions = categoryNames.filter((name) =>
      name.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filteredSuggestions);
  }, [query, categories]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(true);
  };

  const handleSelectService = (service: string) => {
    setQuery(service);
    onServiceSelect(service);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={
            placeholder || t("client.home.search.servicePlaceholder")
          }
          className="w-full h-[50px] px-4 py-3 pl-10 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          onFocus={() => setShowSuggestions(true)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => handleSelectService(suggestion)}
            >
              <Search className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
