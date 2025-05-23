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
} from "@/lib/redux/slices/userSlice";

import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconFilled } from "@heroicons/react/24/solid";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  Service,
  OpeningHours,
  TeamMember,
  Review,
  Photo,
  Company,
} from "@/types";
import { EnhancedBookingFlow } from "@/components/booking/EnhancedBookingFlow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useToast } from "@/components/ui/use-toast";

export default function ProfessionalPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState("prestations");
  const [isFavorite, setIsFavorite] = useState(false);
  const { id } = useParams();
  const { t } = useTranslations();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const professional = useAppSelector(selectCurrentCompany);
  const loading = useAppSelector(selectCompaniesLoading);

  const [showShareTooltip, setShowShareTooltip] = useState(false);

  // Set to use mock data by default
  useEffect(() => {
    // Still try to fetch from API in case it works
    dispatch(fetchCompanyById(id as string));
  }, [dispatch, id]);

  useEffect(() => {
    const checkFavorite = async () => {
      const response = await dispatch(
        checkUserFavoriteThunk(professional.id)
      ).unwrap();
      setIsFavorite(response?.isFavorite!);
    };
    checkFavorite();
  }, [dispatch, professional.id]);

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

  // Grouper les services par catégorie
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
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {professional.name}
          </h1>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              <span className="text-xl font-semibold">
                {professional.rating || "0"}
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
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">
              Ouvert jusqu'à{" "}
              {professional.opening_hours?.monday?.end || "19:00"}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">{professional.address}</span>
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

      {/* Navigation par onglets */}
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

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-6">
        {/* Section Photos */}
        {activeTab === "photos" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {professional.photos && professional.photos.length > 0 ? (
                professional.photos.map((photo: Photo, index: number) => (
                  <div
                    key={photo.id || index}
                    className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={
                        photo.alt || `${professional.name} - Photo ${index + 1}`
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  Aucune photo disponible
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Prestations */}
        {activeTab === "prestations" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Prestations
            </h2>

            {/* Catégories de services */}
            <div className="flex overflow-x-auto mb-6 pb-2">
              {Object.keys(servicesByCategory).map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 mr-2 bg-gray-200 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-300"
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Liste des services */}
            <div className="space-y-6">
              {Object.entries(servicesByCategory).map(
                ([category, services]) => (
                  <div key={category}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {category}
                    </h3>
                    <div className="space-y-4">
                      {services.map((service) => (
                        <Dialog key={service.id}>
                          <DialogTrigger asChild>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer">
                              <div className="p-4">
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                                      {service.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 mb-2">
                                      {service.description}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <span>{service.duration} min</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900 mb-2">
                                      {service.price.toFixed(2)} €
                                    </div>
                                    <button
                                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                                      onClick={() =>
                                        setSelectedService(service)
                                      }
                                    >
                                      Réserver
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[900px] p-0">
                            <DialogHeader className="p-4 border-b">
                              <DialogTitle>{service.name}</DialogTitle>
                              <DialogDescription>
                                {t("professional.bookFor")}
                              </DialogDescription>
                            </DialogHeader>
                            <EnhancedBookingFlow
                              companyId={professional.id}
                              services={[service]}
                            />
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-6">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Tout voir
              </button>
            </div>
          </div>
        )}

        {/* Section Équipe */}
        {activeTab === "equipe" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Équipe</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {professional.team && professional.team.length > 0 ? (
                professional.team.map((member: TeamMember) => (
                  <div key={member.id} className="text-center">
                    <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden bg-gray-200">
                      {member.image_url ? (
                        <img
                          src={member.image_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-12 h-12"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <div className="flex justify-center mt-1">
                      <div className="flex items-center">
                        <span className="text-lg font-semibold mr-1">5.0</span>
                        <svg
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  Aucun membre d'équipe disponible
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Événements */}
        {activeTab === "events" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Événements
            </h2>
          </div>
        )}

        {/* Section Avis */}
        {activeTab === "avis" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Avis</h2>
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-2xl font-bold text-gray-900">
                  {professional.reviews.length
                    ? professional.rating.toFixed(1)
                    : "0"}
                </span>
                <span className="ml-1 text-gray-500">
                  ({professional.reviews.length})
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {professional.reviews && professional.reviews.length > 0 ? (
                professional.reviews.map((review: Review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-200 pb-6"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-gray-400">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Client</div>
                        <div className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700">{review.review}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Aucun avis disponible
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Acheter */}
        {activeTab === "acheter" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acheter</h2>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Abonnements
                    </h3>
                    <p className="text-sm text-gray-500">
                      Achetez une série de séances.
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                    Acheter
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Cartes cadeaux
                    </h3>
                    <p className="text-sm text-gray-500">
                      Faites-vous plaisir ou gâtez vos proches en leur offrant
                      des prestations.
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                    Acheter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section À propos */}
        {activeTab === "apropos" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos</h2>

            {professional.description ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <p className="text-gray-700 whitespace-pre-line">
                  {professional.description}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 text-center text-gray-500">
                Aucune description disponible
              </div>
            )}

            {/* Carte */}
            <div className="h-64 bg-gray-200 rounded-lg mb-6">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Carte
              </div>
            </div>

            {/* Informations de contact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Contact
              </h3>
              <div className="space-y-3">
                {professional.address && (
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-gray-500 mt-0.5 mr-3"
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
                    <p className="text-gray-700">{professional.address}</p>
                  </div>
                )}
                {professional.phone && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-500 mr-3"
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
                      className="text-gray-700 hover:text-gray-900"
                    >
                      {professional.phone}
                    </a>
                  </div>
                )}
                {professional.website && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-500 mr-3"
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
                      className="text-gray-700 hover:text-gray-900"
                    >
                      {professional.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
