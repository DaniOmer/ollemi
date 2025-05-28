"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  selectCurrentCompany,
  selectCompaniesLoading,
} from "@/lib/redux/slices/companiesSlice";
import { fetchCompanyById } from "@/lib/redux/slices/companiesSlice";
import {
  addUserFavoriteThunk,
  removeUserFavoriteThunk,
  checkUserFavoriteThunk,
  selectUserProfile,
} from "@/lib/redux/slices/userSlice";

import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconFilled } from "@heroicons/react/24/solid";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Service } from "@/types";

import { useToast } from "@/components/ui/use-toast";
import {
  AboutTab,
  PhotosTab,
  ReviewsTab,
  ServicesTab,
  TeamTabs,
  BuyTab,
  EventsTab,
} from "@/components/pro";
import GoogleMapLink from "@/components/GoogleMapLink";

export default function ProfessionalPage() {
  const [activeTab, setActiveTab] = useState("prestations");
  const [isFavorite, setIsFavorite] = useState(false);
  const { id } = useParams();
  const { t } = useTranslations();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const professional = useAppSelector(selectCurrentCompany);
  const loading = useAppSelector(selectCompaniesLoading);
  const user = useAppSelector(selectUserProfile);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  useEffect(() => {
    dispatch(fetchCompanyById(id as string));
  }, [dispatch, id]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;
      const response = await dispatch(
        checkUserFavoriteThunk(id as string)
      ).unwrap();
      setIsFavorite(response?.isFavorite!);
    };
    checkFavorite();
  }, [dispatch, id, user]);

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : process.env.NEXT_PUBLIC_BASE_URL || "https://ollemi.com";
  const profileUrl = `${baseUrl}/pro/${id}`;

  const shareProfileUrl = () => {
    if (navigator.share) {
      navigator
        .share({
          title: professional.name,
          text: `Découvrir ${professional.name} sur Ollemi et réserver ses prestations.`,
          url: profileUrl,
        })
        .catch((err) => console.error("Failed to share", err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(profileUrl)
        .then(() => {
          setShowShareTooltip(true);
          setTimeout(() => setShowShareTooltip(false), 2000);
        })
        .catch((err) => console.error("Failed to copy", err));
    }
  };

  const handleAddToFavorites = async () => {
    await dispatch(addUserFavoriteThunk(professional.id));
    setIsFavorite(true);

    toast({
      title: t("common.added"),
      description: t("professional.addedToFavorites"),
    });
  };

  const handleRemoveFromFavorites = async () => {
    await dispatch(removeUserFavoriteThunk(professional.id));
    setIsFavorite(false);

    toast({
      title: t("common.removed"),
      description: t("professional.removedFromFavorites"),
    });
  };

  const handleToggleFavorite = async () => {
    if (isFavorite) {
      handleRemoveFromFavorites();
    } else {
      handleAddToFavorites();
    }
  };

  if (loading && !professional) {
    return <LoadingSpinner />;
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">{t("professional.notFound")}</p>
      </div>
    );
  }

  // Group services by category
  const servicesByCategory: Record<string, Service[]> = {};
  professional.services?.forEach((service: Service) => {
    const category = service.category || "Autres";
    if (!servicesByCategory[category]) {
      servicesByCategory[category] = [];
    }
    servicesByCategory[category].push(service);
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {professional.name}
            </h1>
            <div className="flex items-center">
              <span className="text-xl font-semibold">
                {professional.rating}
              </span>
              <div className="flex ml-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1 text-gray-500">
                ({professional.reviews.length})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-500">
              Ouvert jusqu'à{" "}
              {professional.opening_hours?.monday?.end || "19:00"}
            </span>
            <span className="text-gray-500">•</span>
            <GoogleMapLink address={professional.address?.formatted_address} />
          </div>
          <div className="flex justify-between items-center">
            <div></div>
            <div className="flex gap-2">
              <button
                onClick={shareProfileUrl}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 relative"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                {showShareTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                    Lien copié !
                  </div>
                )}
              </button>
              <button
                onClick={handleToggleFavorite}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                {isFavorite ? (
                  <HeartIconFilled className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto">
            {[
              "photos",
              "prestations",
              "equipe",
              "events",
              "avis",
              "apropos",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "photos" && "Photos"}
                {tab === "prestations" && "Prestations"}
                {tab === "equipe" && "Équipe"}
                {tab === "events" && "Événements"}
                {tab === "avis" && "Avis"}
                {tab === "apropos" && "À propos"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {activeTab === "photos" ? (
          <PhotosTab professional={professional} />
        ) : activeTab === "prestations" ? (
          <ServicesTab
            professional={professional}
            servicesByCategory={servicesByCategory}
          />
        ) : activeTab === "equipe" ? (
          <TeamTabs professional={professional} />
        ) : activeTab === "events" ? (
          <EventsTab />
        ) : activeTab === "avis" ? (
          <ReviewsTab professional={professional} />
        ) : activeTab === "apropos" ? (
          <AboutTab professional={professional} />
        ) : (
          <BuyTab professional={professional} />
        )}
      </div>
    </div>
  );
}
