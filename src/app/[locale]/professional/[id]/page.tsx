"use client";

import { useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  selectCurrentCompany,
  selectCompaniesLoading,
} from "@/lib/redux/slices/companiesSlice";
import { fetchCompanyById } from "@/lib/redux/slices/companiesSlice";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Service, OpeningHours, DayHours } from "@/types";

export default function ProfessionalPage() {
  const { id } = useParams();
  const { t } = useTranslations();

  const dispatch = useAppDispatch();
  const professional = useAppSelector(selectCurrentCompany);
  const loading = useAppSelector(selectCompaniesLoading);

  useEffect(() => {
    dispatch(fetchCompanyById(id as string));
  }, [dispatch, id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">{t("professional.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-primary/10">
        {professional.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${professional.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/40" />
          </div>
        )}
        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div className="text-foreground">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              {professional.name}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              {professional.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Services Section */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-8 section-title">
              {t("professional.services")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {professional.services?.map((service: Service) => (
                <div
                  key={service.id}
                  className="bg-card rounded-lg shadow-card p-6 hover:shadow-card-hover transition-all duration-300 hover-lift"
                >
                  <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {service.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      {service.price.toFixed(2)} €
                    </span>
                    <span className="text-muted-foreground">
                      {service.duration} {t("professional.minutes")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Info Section */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-card rounded-lg shadow-card p-6 hover-lift">
              <h2 className="text-2xl font-bold mb-6 section-title">
                {t("professional.contact")}
              </h2>
              <div className="space-y-4">
                {professional.address && (
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-muted-foreground mt-1 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-muted-foreground">
                      {professional.address}
                    </p>
                  </div>
                )}
                {professional.phone && (
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-muted-foreground mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <a
                      href={`tel:${professional.phone}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {professional.phone}
                    </a>
                  </div>
                )}
                {professional.website && (
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-muted-foreground mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    <a
                      href={professional.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {professional.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Opening Hours */}
            {professional.opening_hours && (
              <div className="bg-card rounded-lg shadow-card p-6 hover-lift">
                <h2 className="text-2xl font-bold mb-6 section-title">
                  {t("professional.openingHours")}
                </h2>
                <div className="space-y-2">
                  {(
                    Object.entries(professional.opening_hours) as [
                      string,
                      DayHours
                    ][]
                  ).map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex justify-between items-center"
                    >
                      <span className="text-muted-foreground capitalize">
                        {t(`days.${day}`)}
                      </span>
                      {hours.open ? (
                        <span className="text-card-foreground">
                          {hours.start} - {hours.end}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {t("professional.closed")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media */}
            {(professional.facebook || professional.instagram) && (
              <div className="bg-card rounded-lg shadow-card p-6 hover-lift">
                <h2 className="text-2xl font-bold mb-6 section-title">
                  {t("professional.socialMedia")}
                </h2>
                <div className="flex space-x-4">
                  {professional.facebook && (
                    <a
                      href={professional.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {professional.instagram && (
                    <a
                      href={professional.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
