"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { EnhancedBookingFlow } from "@/components/booking/EnhancedBookingFlow";
import { Service, Company } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Globe, Clock } from "lucide-react";

export default function BookingPage() {
  const { t } = useTranslations();
  const { companyId } = useParams();

  const [company, setCompany] = useState<Company | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/companies/${companyId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch company data");
        }

        const data = await response.json();
        setCompany(data);

        // Extract services from the company data
        if (data.services && Array.isArray(data.services)) {
          setServices(data.services);
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
        setError("Impossible de récupérer les informations de l'entreprise.");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Entreprise non trouvée"}
          </h1>
          <p className="text-gray-600 mb-6">
            Nous n'avons pas pu trouver les informations demandées.
          </p>
          <Link
            href="/"
            className="text-primary hover:text-primary/80 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href={`/pro/${companyId}`}
          className="text-primary hover:text-primary/80 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la page de {company.name}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">{company.name}</h2>

              {company.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={company.imageUrl}
                    alt={company.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                {company.address && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span>{company.address}</span>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <a
                      href={`tel:${company.phone}`}
                      className="hover:text-primary"
                    >
                      {company.phone}
                    </a>
                  </div>
                )}

                {company.website && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary truncate"
                    >
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-1">Horaires d'ouverture</h3>
                    <ul className="space-y-1 text-sm">
                      {company.opening_hours && (
                        <>
                          <li className="flex justify-between">
                            <span>Lundi</span>
                            <span>
                              {company.opening_hours.monday?.open
                                ? `${company.opening_hours.monday.start} - ${company.opening_hours.monday.end}`
                                : "Fermé"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Mardi</span>
                            <span>
                              {company.opening_hours.tuesday?.open
                                ? `${company.opening_hours.tuesday.start} - ${company.opening_hours.tuesday.end}`
                                : "Fermé"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Mercredi</span>
                            <span>
                              {company.opening_hours.wednesday?.open
                                ? `${company.opening_hours.wednesday.start} - ${company.opening_hours.wednesday.end}`
                                : "Fermé"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Jeudi</span>
                            <span>
                              {company.opening_hours.thursday?.open
                                ? `${company.opening_hours.thursday.start} - ${company.opening_hours.thursday.end}`
                                : "Fermé"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Vendredi</span>
                            <span>
                              {company.opening_hours.friday?.open
                                ? `${company.opening_hours.friday.start} - ${company.opening_hours.friday.end}`
                                : "Fermé"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Samedi</span>
                            <span>
                              {company.opening_hours.saturday?.open
                                ? `${company.opening_hours.saturday.start} - ${company.opening_hours.saturday.end}`
                                : "Fermé"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Dimanche</span>
                            <span>
                              {company.opening_hours.sunday?.open
                                ? `${company.opening_hours.sunday.start} - ${company.opening_hours.sunday.end}`
                                : "Fermé"}
                            </span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Flow */}
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Réserver un rendez-vous</h1>
          <EnhancedBookingFlow
            companyId={companyId as string}
            services={services}
          />
        </div>
      </div>
    </div>
  );
}
