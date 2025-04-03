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
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  Service,
  OpeningHours,
  DayHours,
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
import Link from "next/link";

export default function ProfessionalPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState("prestations");
  const { id } = useParams();
  const { t } = useTranslations();

  const dispatch = useAppDispatch();
  const professionalFromStore = useAppSelector(selectCurrentCompany);
  const loading = useAppSelector(selectCompaniesLoading);
  const [useMockData, setUseMockData] = useState(false);

  // Mock data for testing
  const mockProfessional: Company = {
    id: "1",
    user_id: "1",
    name: "Centre Anne Cali",
    description:
      "Entrez dans l'univers Anne Cali, kinésithérapeute de formation, elle repense le bien-être pour vous. Découvrez le GAD, une méthode drainante et anti-cellulite révolutionnaire. Un geste profond qui combine les effets d'un palper rouler et d'un drainage lymphatique pour une meilleure circulation et tonicité de la peau. L'équipe du centre vous accueille dans un cadre chaleureux et nous prendrons vos mesures au Scanner 3D lors de votre \"1er RDV Bilan\".",
    address: "7 Rue Lamennais - Code 1638, Paris",
    city: "Paris",
    zipcode: "75008",
    phone: "0123456789",
    website: "https://www.annecali.com",
    instagram: "https://www.instagram.com/annecali",
    facebook: "https://www.facebook.com/annecali",
    imageUrl:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.9,
    reviewCount: 193,
    services: [
      {
        id: "1",
        company_id: "1",
        name: "OFFRE DECOUVERTE - 1ER RDV BILAN",
        description: "Premier rendez-vous avec bilan complet",
        price: 130,
        duration: 75,
        category: "Massages 1er RDV",
      },
      {
        id: "2",
        company_id: "1",
        name: "Massages GAD",
        description: "Massage drainant et anti-cellulite",
        price: 90,
        duration: 60,
        category: "Massages GAD",
      },
      {
        id: "3",
        company_id: "1",
        name: "Massages BELLY GAD ou REFLEXO",
        description: "Massage du ventre ou réflexologie",
        price: 90,
        duration: 60,
        category: "Massages BELLY GAD ou REFLEXO",
      },
      {
        id: "4",
        company_id: "1",
        name: "Massages DETOX ou DEEP TISSUE",
        description: "Massage détoxifiant ou massage profond",
        price: 90,
        duration: 60,
        category: "Massages DETOX ou DEEP TISSUE",
      },
    ],
    opening_hours: {
      monday: { open: true, start: "09:00", end: "19:00" },
      tuesday: { open: true, start: "09:00", end: "19:00" },
      wednesday: { open: true, start: "09:00", end: "19:00" },
      thursday: { open: true, start: "09:00", end: "19:00" },
      friday: { open: true, start: "09:00", end: "19:00" },
      saturday: { open: true, start: "10:00", end: "17:00" },
      sunday: { open: false, start: "", end: "" },
    },
    team: [
      {
        id: "1",
        name: "Jess",
        role: "Masseuse",
        imageUrl:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        id: "2",
        name: "Adeline",
        role: "Masseuse",
        imageUrl:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        id: "3",
        name: "Ben",
        role: "Masseur",
        imageUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        id: "4",
        name: "Traicy",
        role: "Masseuse",
        imageUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    reviews: [
      {
        id: "1",
        rating: 5,
        comment: "Topissime !",
        date: "2025-03-26T09:31:00Z",
      },
      {
        id: "2",
        rating: 5,
        comment:
          "Un grand merci à Franck pour son accueil et sa bienveillance 👍",
        date: "2025-03-11T19:09:00Z",
      },
      {
        id: "3",
        rating: 5,
        comment:
          "Je viens juste de commencer mais je suis déjà conquise ! J'ai beaucoup... accueil top, soins super, équipe au top !",
        date: "2025-03-06T13:54:00Z",
      },
      {
        id: "4",
        rating: 5,
        comment: "Excellent service, je recommande vivement !",
        date: "2025-03-05T17:04:00Z",
      },
    ],
    photos: [
      {
        id: "1",
        company_id: "1",
        url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Salon de massage",
        featured: true,
      },
      {
        id: "2",
        company_id: "1",
        url: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Salle de massage",
        featured: false,
      },
      {
        id: "3",
        company_id: "1",
        url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Produits de massage",
        featured: false,
      },
      {
        id: "4",
        company_id: "1",
        url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Huiles essentielles",
        featured: false,
      },
      {
        id: "5",
        company_id: "1",
        url: "https://images.unsplash.com/photo-1470259078422-826894b933aa?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Accueil du salon",
        featured: false,
      },
      {
        id: "6",
        company_id: "1",
        url: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Table de massage",
        featured: false,
      },
    ],
  };

  // Set to use mock data by default
  useEffect(() => {
    setUseMockData(true);
    // Still try to fetch from API in case it works
    dispatch(fetchCompanyById(id as string));
  }, [dispatch, id]);

  // Use mock data by default, or use data from store if available
  const professional = professionalFromStore || mockProfessional;

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
      {/* Header avec fil d'Ariane */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="container mx-auto">
          <div className="text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Accueil
            </Link>{" "}
            •{" "}
            <Link href="/category" className="hover:text-gray-700">
              {professional.services?.[0]?.category || "Services"}
            </Link>{" "}
            •{" "}
            <Link href="/paris" className="hover:text-gray-700">
              {professional.city || "Paris"}
            </Link>{" "}
            • <span className="text-gray-700">{professional.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {professional.name}
          </h1>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              <span className="text-xl font-semibold">
                {professional.rating || "4.9"}
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
                ({professional.reviewCount || "193"})
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
              <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
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
              </button>
              <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
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
              "avis",
              // "acheter",
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
                {tab === "avis" && "Avis"}
                {/* {tab === "acheter" && "Acheter"} */}
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
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
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
                  {professional.rating || "4.9"}
                </span>
                <span className="ml-1 text-gray-500">
                  ({professional.reviewCount || "193"})
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
                          {new Date(review.date).toLocaleDateString()}
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
                    <p className="text-gray-700">{review.comment}</p>
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
