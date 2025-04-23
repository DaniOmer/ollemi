"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { useRouter } from "next/navigation";
import {
  selectCurrentCompany,
  updateCompanyThunk,
  addCompanyPhotos,
  removeCompanyPhoto,
  selectCompanyPhotos,
  uploadPhotoThunk,
  deletePhotoThunk,
  fetchCompanyById,
  createAddressThunk,
  updateAddressThunk,
} from "@/lib/redux/slices/companiesSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { Company, OpeningHours, Photo, Address } from "@/types";

// Define missing types
type TeamMember = {
  id: string;
  name: string;
  imageUrl?: string;
};

type DayHours = {
  open: boolean;
  start: string;
  end: string;
};
import Image from "next/image";
import {
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  Loader2,
  Download,
  Eye,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { PhotoUpload } from "@/components/forms/PhotoUpload";
import {
  AddressAutocomplete,
  AddressData,
} from "@/components/forms/AddressAutocomplete";
import { v4 as uuidv4 } from "uuid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadFileWithSignedUrl } from "@/utils/uploadUtils";
import { selectUserProfile } from "@/lib/redux/slices/userSlice";
import { useToast } from "@/components/ui/use-toast";
import {
  createCheckoutSession,
  getSubscriptionInvoices,
  cancelSubscription,
  resumeSubscription,
} from "@/lib/services/subscriptions";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  createCheckoutSessionThunk,
  fetchSubscriptionPlansThunk,
} from "@/lib/redux/slices/subscriptionSlice";

// Types for subscription plans
type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  interval_count: number;
  features: {
    appointments: number;
    services: number;
    featured: boolean;
    [key: string]: any;
  };
};

type BillingInterval = "month" | "year";

export default function SettingsPage() {
  const { t } = useTranslations();
  const dispatch = useAppDispatch();
  const company = useAppSelector(selectCurrentCompany);
  const user = useAppSelector(selectUserProfile);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [addressFormData, setAddressFormData] = useState<Partial<Address>>({});
  const [tempPhotos, setTempPhotos] = useState<Photo[]>([]);

  // Subscription states
  const { plans, checkoutSession, status, error } = useAppSelector(
    (state) => state.subscription
  );
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month");
  const [invoices, setInvoices] = useState<any[]>([]);

  // New states for cancellation confirmation
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  // Initialize form data from company
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        description: company.description,
        phone: company.phone,
        website: company.website,
        instagram: company.instagram,
        facebook: company.facebook,
      });

      // Initialize address data if available
      if (company.addresses) {
        setAddressFormData({
          formatted_address: company.addresses.formatted_address,
          street_number: company.addresses.street_number,
          street_name: company.addresses.street_name,
          city: company.addresses.city,
          state: company.addresses.state,
          postal_code: company.addresses.postal_code,
          country: company.addresses.country,
          place_id: company.addresses.place_id,
          latitude: company.addresses.latitude,
          longitude: company.addresses.longitude,
        });
      }
    }
  }, [company]);

  useEffect(() => {
    if (user?.company_id) {
      dispatch(fetchCompanyById(user.company_id));
    }
  }, [dispatch, user?.company_id]);

  // Mock data for testing if no company is available
  const mockCompany = {
    id: "1",
    user_id: "1",
    name: "Centre Anne Cali",
    description: "Description du centre...",
    phone: "0123456789",
    website: "https://www.annecali.com",
    instagram: "https://www.instagram.com/annecali",
    facebook: "https://www.facebook.com/annecali",
    team_size: 10,
    industry: "Santé",
    created_at: new Date().toISOString(),
    updated_at: null,
    stripe_customer_id: "1234567890",
    imageUrl: "https://example.com/image.jpg",
    rating: 4.9,
    reviewCount: 193,
    services: [],
    opening_hours: {
      monday: { open: true, start: "09:00", end: "19:00" },
      tuesday: { open: true, start: "09:00", end: "19:00" },
      wednesday: { open: true, start: "09:00", end: "19:00" },
      thursday: { open: true, start: "09:00", end: "19:00" },
      friday: { open: true, start: "09:00", end: "19:00" },
      saturday: { open: true, start: "10:00", end: "17:00" },
      sunday: { open: false, start: "", end: "" },
    },
    addresses: {
      id: "1",
      company_id: "1",
      formatted_address: "7 Rue Lamennais, 75008 Paris, France",
      street_number: "7",
      street_name: "Rue Lamennais",
      city: "Paris",
      postal_code: "75008",
      country: "France",
      created_at: new Date().toISOString(),
    },
    team: [],
    reviews: [],
    photos: [],
  };

  const currentCompany = company || mockCompany;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleAddressSelect = (data: AddressData) => {
    setAddressData(data);

    // Update address form data
    setAddressFormData({
      formatted_address: data.fullAddress,
      street_number: data.streetNumber,
      street_name: data.streetName,
      city: data.city,
      state: data.state,
      postal_code: data.postalCode,
      country: data.country,
    });
  };

  const handleRemovePhoto = async (photoId: string) => {
    if (currentCompany && currentCompany.id) {
      // Then delete from database
      await dispatch(
        deletePhotoThunk({
          companyId: currentCompany.id,
          photoId: photoId,
        })
      ).unwrap();
    }
  };

  const handleAddTempPhoto = (photo: Photo) => {
    setTempPhotos((prev: Photo[]) => [...prev, photo]);
  };

  const handleRemoveTempPhoto = (photoId: string) => {
    setTempPhotos((prev: Photo[]) =>
      prev.filter((photo) => photo.id !== photoId)
    );
  };

  const handleSaveChanges = async () => {
    if (!currentCompany.id) return;

    setIsSaving(true);

    try {
      // Update company information
      if (Object.keys(formData).length > 0) {
        await dispatch(
          updateCompanyThunk({
            id: currentCompany.id,
            company: formData,
          })
        ).unwrap();
      }

      // Update or create address
      if (Object.keys(addressFormData).length > 0) {
        if (currentCompany.addresses?.id) {
          // Update existing address
          await dispatch(
            updateAddressThunk({
              companyId: currentCompany.id,
              addressId: currentCompany.addresses.id,
              addressData: addressFormData,
            })
          ).unwrap();
        } else {
          // Create new address
          await dispatch(
            createAddressThunk({
              companyId: currentCompany.id,
              addressData: addressFormData as Omit<
                Address,
                "id" | "company_id" | "created_at" | "updated_at"
              >,
            })
          ).unwrap();
        }
      }

      // Handle photos
      const uploadedPhotos: Photo[] = [];

      if (tempPhotos.length > 0) {
        for (const photo of tempPhotos) {
          // Check if photo has a file property (custom property added for uploads)
          if ((photo as any).file) {
            // Upload the file using signed URLs
            const { url, error } = await uploadFileWithSignedUrl(
              (photo as any).file,
              process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || "",
              `companies/${currentCompany.id}/photos`,
              dispatch
            );

            if (error) {
              console.error("Error uploading photo:", error);
              throw new Error(error);
            }

            if (url) {
              // Create a photo object that matches the Photo type
              const newPhoto: Photo = {
                id: uuidv4(),
                url,
                featured: false,
                alt: null,
                created_at: new Date().toISOString(),
                updated_at: null,
                pro_id: currentCompany.id,
              };
              uploadedPhotos.push(newPhoto);
            }
          }
        }
      }

      // Insert photos into the database
      for (const photo of uploadedPhotos) {
        await dispatch(
          uploadPhotoThunk({
            companyId: currentCompany.id,
            photoUrl: photo.url,
          })
        );
      }

      // Clear temporary photos
      setTempPhotos([]);

      // Refresh company data
      dispatch(fetchCompanyById(currentCompany.id));
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch subscription plans and current subscription
  useEffect(() => {
    dispatch(fetchSubscriptionPlansThunk(billingInterval));
  }, [dispatch, billingInterval]);

  // Handle subscription checkout
  const handleSubscribe = async (planId: string) => {
    setIsSubscribing(true);

    try {
      const result = await dispatch(
        createCheckoutSessionThunk({
          planId,
          successUrl: `${window.location.origin}/dashboard/pro/settings`,
          cancelUrl: `${window.location.origin}/dashboard/pro/settings`,
        })
      ).unwrap();

      // Use the URL directly from the result
      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error(`Failed to create checkout session`);
      }
    } catch (error) {
      console.error("Error starting subscription:", error);
      toast({
        title: t("error"),
        description: t("subscription.checkoutError"),
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  // Format price to display currency correctly
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  // Helper to format features
  const formatFeature = (key: string, value: any, parentKey?: string) => {
    const translationKeyBase = parentKey ? `${parentKey}.${key}` : key;
    const translationKey = `subscription.features.${translationKeyBase}`;

    // Try translating the feature key itself first
    let featureName = t(translationKey);
    if (featureName === translationKey) {
      featureName = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    }

    if (typeof value === "boolean") {
      return `${featureName}: ${value ? t("yes") : t("no")}`;
    }
    if (
      (key === "appointments" || key === "services") &&
      typeof value === "number"
    ) {
      const displayValue =
        value === -1 || value > 999 ? t("subscription.unlimited") : value;
      return `${featureName}: ${displayValue}`;
    }
    if (key === "freePerMonth" && typeof value === "number") {
      return `${featureName}: ${value} ${t("subscription.freePerMonthSuffix")}`;
    }
    if (typeof value === "number") {
      return `${featureName}: ${value}`;
    }
    // If it's an object, we don't display a value directly here, handled in the loop
    if (typeof value === "object" && value !== null) {
      return null; // Don't render a line item for the object itself
    }

    // Handle potential null or undefined values gracefully for other types
    return `${featureName}: ${value ? String(value) : "-"}`;
  };

  // Check if the user is already subscribed to this plan
  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId;
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription?.id) return;

    setIsCancelling(true);

    try {
      await cancelSubscription(currentSubscription.id, true);

      toast({
        title: t("subscription.cancelSuccess.title"),
        description: t("subscription.cancelSuccess.description"),
      });

      // Update subscription status
      setCurrentSubscription({
        ...currentSubscription,
        cancel_at_period_end: true,
      });

      setShowCancelConfirm(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: t("error"),
        description: t("subscription.cancelError"),
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!currentSubscription?.id) return;

    setIsResuming(true);

    try {
      await resumeSubscription(currentSubscription.id);

      toast({
        title: t("subscription.resumeSuccess.title"),
        description: t("subscription.resumeSuccess.description"),
      });

      // Update subscription status
      setCurrentSubscription({
        ...currentSubscription,
        cancel_at_period_end: false,
      });
    } catch (error) {
      console.error("Error resuming subscription:", error);
      toast({
        title: t("error"),
        description: t("subscription.resumeError"),
      });
    } finally {
      setIsResuming(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{t("settings.title")}</h1>

      <Tabs
        defaultValue="general"
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">{t("settings.general")}</TabsTrigger>
          <TabsTrigger value="location">{t("settings.location")}</TabsTrigger>
          {/* <TabsTrigger value="contact">{t("settings.contact")}</TabsTrigger> */}
          {/* <TabsTrigger value="hours">{t("settings.hours")}</TabsTrigger> */}
          <TabsTrigger value="team">{t("settings.team")}</TabsTrigger>
          <TabsTrigger value="subscription">
            {t("settings.subscription")}
          </TabsTrigger>
          <TabsTrigger value="security">{t("settings.security")}</TabsTrigger>
        </TabsList>

        {/* Informations générales */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.generalInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t("settings.companyName")}</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">
                      {t("settings.description")}
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">{t("settings.website")}</Label>
                    <Input
                      id="website"
                      value={formData.website || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("settings.phone")}</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instagram">{t("settings.instagram")}</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook">{t("settings.facebook")}</Label>
                    <Input
                      id="facebook"
                      value={formData.facebook || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>{t("settings.teamSize")}</Label>
                    <Select
                      defaultValue={
                        (currentCompany.team?.length || 0) <= 1
                          ? "solo"
                          : (currentCompany.team?.length || 0) <= 5
                          ? "small"
                          : (currentCompany.team?.length || 0) <= 10
                          ? "medium"
                          : "large"
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("settings.selectTeamSize")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">
                          {t("settings.teamSizeSolo")}
                        </SelectItem>
                        <SelectItem value="small">
                          {t("settings.teamSizeSmall")}
                        </SelectItem>
                        <SelectItem value="medium">
                          {t("settings.teamSizeMedium")}
                        </SelectItem>
                        <SelectItem value="large">
                          {t("settings.teamSizeLarge")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t("settings.photoGallery")}</Label>
                </div>
                <PhotoUpload
                  companyId={currentCompany.id}
                  existingPhotos={currentCompany.photos || []}
                  tempPhotos={tempPhotos}
                  onPhotoRemove={handleRemovePhoto}
                  onAddTempPhoto={handleAddTempPhoto}
                  onRemoveTempPhoto={handleRemoveTempPhoto}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  className="min-w-[120px]"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("settings.saveChanges")
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Localisation */}
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.location")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>{t("settings.locationInfo")}</Label>
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  defaultValue={
                    currentCompany.addresses?.formatted_address || ""
                  }
                  label={t("settings.streetAddress")}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="country">{t("settings.country")}</Label>
                  <Input
                    id="country"
                    value={
                      addressFormData.country || addressData?.country || ""
                    }
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label htmlFor="state">{t("settings.state")}</Label>
                  <Input
                    id="state"
                    value={addressFormData.state || addressData?.state || ""}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">{t("settings.postalCode")}</Label>
                  <Input
                    id="postal_code"
                    value={
                      addressFormData.postal_code ||
                      addressData?.postalCode ||
                      ""
                    }
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">{t("settings.city")}</Label>
                  <Input
                    id="city"
                    value={addressFormData.city || addressData?.city || ""}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label htmlFor="streetNumber">
                    {t("settings.streetNumber")}
                  </Label>
                  <Input
                    id="streetNumber"
                    value={
                      addressFormData.street_number ||
                      addressData?.streetNumber ||
                      ""
                    }
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  className="min-w-[120px]"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("settings.saveChanges")
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        {/* <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.contact")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">{t("settings.phone")}</Label>
                <Input id="phone" defaultValue={currentCompany.phone} />
              </div>
              <div>
                <Label htmlFor="website">{t("settings.website")}</Label>
                <Input id="website" defaultValue={currentCompany.website} />
              </div>
              <div>
                <Label htmlFor="instagram">{t("settings.instagram")}</Label>
                <Input id="instagram" defaultValue={currentCompany.instagram} />
              </div>
              <div>
                <Label htmlFor="facebook">{t("settings.facebook")}</Label>
                <Input id="facebook" defaultValue={currentCompany.facebook} />
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Équipe */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.team")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentCompany.team?.map((member: TeamMember) => (
                  <div key={member.id} className="relative group">
                    <Image
                      src={member.imageUrl || "/placeholder.png"}
                      alt={member.name}
                      width={200}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="h-[200px] flex flex-col items-center justify-center"
                >
                  <Plus className="h-8 w-8 mb-2" />
                  <span>{t("settings.addTeamMember")}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.subscription")}</CardTitle>
              <CardDescription>{t("subscription.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {status === "loading" ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Billing interval selector */}
                  <div className="flex justify-end mb-6">
                    <Tabs
                      defaultValue="month"
                      className="w-[200px]"
                      onValueChange={(value) =>
                        setBillingInterval(value as BillingInterval)
                      }
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="month">
                          {t("subscription.monthly")}
                        </TabsTrigger>
                        <TabsTrigger value="year">
                          {t("subscription.yearly")}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {plans.length === 0 ? (
                    <div className="text-center p-8">
                      <p>{t("subscription.noPlans")}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {plans.map((plan) => (
                        <Card
                          key={plan.id}
                          className={`w-full h-full flex flex-col relative ${
                            plan.name === "Pro"
                              ? "border-primary shadow-lg"
                              : ""
                          }`}
                        >
                          <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>
                              {plan.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            <div className="text-3xl font-bold mb-4">
                              {formatPrice(plan.price, plan.currency)}
                              <span className="text-sm font-normal text-muted-foreground">
                                /{t(`subscription.${plan.interval}`)}
                              </span>
                            </div>
                            <ul className="space-y-2">
                              {Object.entries(plan.features || {}).map(
                                ([key, value]) => {
                                  if (
                                    typeof value === "object" &&
                                    value !== null
                                  ) {
                                    // Render nested features
                                    return (
                                      <li key={key} className="ml-4 pt-2">
                                        <span className="font-medium text-sm text-muted-foreground">
                                          {(() => {
                                            const titleKey = `subscription.features.${key}.title`;
                                            const fallbackKey = `subscription.features.${key}`;
                                            let title = t(titleKey);
                                            if (title === titleKey) {
                                              title = t(fallbackKey);
                                              if (title === fallbackKey) {
                                                title = key
                                                  .replace(/([A-Z])/g, " $1")
                                                  .replace(/^./, (str) =>
                                                    str.toUpperCase()
                                                  );
                                              }
                                            }
                                            return `${title}:`;
                                          })()}
                                        </span>
                                        <ul className="list-none pl-4 space-y-1 mt-1">
                                          {Object.entries(value).map(
                                            ([subKey, subValue]) => {
                                              const formattedSubFeature =
                                                formatFeature(
                                                  subKey,
                                                  subValue,
                                                  key // Pass parent key for translation
                                                );
                                              return formattedSubFeature ? (
                                                <li
                                                  key={subKey}
                                                  className="flex items-center text-sm"
                                                >
                                                  <CheckCircle className="h-3 w-3 text-primary mr-2 flex-shrink-0" />
                                                  <span>
                                                    {formattedSubFeature}
                                                  </span>
                                                </li>
                                              ) : null;
                                            }
                                          )}
                                        </ul>
                                      </li>
                                    );
                                  } else {
                                    // Render simple features
                                    const formattedFeature = formatFeature(
                                      key,
                                      value
                                    );
                                    return formattedFeature ? (
                                      <li
                                        key={key}
                                        className="flex items-center"
                                      >
                                        <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                                        <span>{formattedFeature}</span>
                                      </li>
                                    ) : null;
                                  }
                                }
                              )}
                            </ul>
                          </CardContent>
                          <CardFooter>
                            <Button
                              className="w-full"
                              variant={
                                isCurrentPlan(plan.id) ? "outline" : "default"
                              }
                              onClick={() => handleSubscribe(plan.id)}
                              disabled={isSubscribing || isCurrentPlan(plan.id)}
                            >
                              {isSubscribing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              {isCurrentPlan(plan.id)
                                ? t("subscription.currentPlan")
                                : t("subscription.subscribe")}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Current Subscription Details */}
                  {currentSubscription && (
                    <Card className="mt-8">
                      <CardHeader>
                        <CardTitle>{t("subscription.details")}</CardTitle>
                        <CardDescription>
                          {t("subscription.currentDetails")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {t("subscription.plan")}
                            </p>
                            <p className="font-medium">
                              {currentSubscription.subscription_plans?.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {t("subscription.status")}
                            </p>
                            <p className="font-medium capitalize">
                              {currentSubscription.status}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {t("subscription.price")}
                            </p>
                            <p className="font-medium">
                              {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency:
                                  currentSubscription.subscription_plans
                                    ?.currency || "EUR",
                              }).format(
                                currentSubscription.subscription_plans?.price ||
                                  0
                              )}
                              /
                              {t(
                                `subscription.${
                                  currentSubscription.subscription_plans
                                    ?.interval || "month"
                                }`
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {t("subscription.currentPeriodEnd")}
                            </p>
                            <p className="font-medium">
                              {new Date(
                                currentSubscription.current_period_end
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {currentSubscription.cancel_at_period_end && (
                          <Alert className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>
                              {t("subscription.cancelScheduled.title")}
                            </AlertTitle>
                            <AlertDescription>
                              {t("subscription.cancelScheduled.description")}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-end gap-4">
                        {!currentSubscription.cancel_at_period_end ? (
                          <Button
                            variant="destructive"
                            onClick={() => setShowCancelConfirm(true)}
                          >
                            {t("subscription.cancel")}
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            onClick={handleResumeSubscription}
                            disabled={isResuming}
                          >
                            {isResuming && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t("subscription.resumeSubscription")}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  )}

                  {/* Cancellation Confirmation */}
                  {showCancelConfirm && (
                    <Card className="border-destructive">
                      <CardHeader>
                        <CardTitle>
                          {t("subscription.cancelConfirm.title")}
                        </CardTitle>
                        <CardDescription>
                          {t("subscription.cancelConfirm.description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>{t("subscription.cancelConfirm.message")}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>{t("subscription.cancelConfirm.point1")}</li>
                          <li>{t("subscription.cancelConfirm.point2")}</li>
                          <li>{t("subscription.cancelConfirm.point3")}</li>
                        </ul>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowCancelConfirm(false)}
                        >
                          {t("cancel")}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleCancelSubscription}
                          disabled={isCancelling}
                        >
                          {isCancelling && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {t("subscription.confirmCancel")}
                        </Button>
                      </CardFooter>
                    </Card>
                  )}

                  {/* Invoices section */}
                  {invoices.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">
                        {t("subscription.invoices")}
                      </h3>
                      <div className="space-y-4">
                        {invoices.map((invoice) => (
                          <Card key={invoice.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {new Date(
                                      invoice.created * 1000
                                    ).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatPrice(
                                      invoice.amount_paid / 100,
                                      invoice.currency
                                    )}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(invoice.hosted_invoice_url)
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {t("subscription.view")}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(invoice.invoice_pdf)
                                    }
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    {t("subscription.download")}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.security")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Mot de passe actuel</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div>
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirm-password">
                    Confirmer le mot de passe
                  </Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button variant="default">Mettre à jour le mot de passe</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
