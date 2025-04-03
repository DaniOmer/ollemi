"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  selectCurrentCompany,
  updateCompanyThunk,
  addCompanyPhotos,
  removeCompanyPhoto,
  selectCompanyPhotos,
  uploadPhotoThunk,
  deletePhotoThunk,
} from "@/lib/redux/slices/companiesSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { Company, OpeningHours, TeamMember, Photo, DayHours } from "@/types";
import Image from "next/image";
import { Plus, Trash2, Upload, CheckCircle, Loader2 } from "lucide-react";
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

export default function SettingsPage() {
  const { t } = useTranslations();
  const dispatch = useAppDispatch();
  const company = useAppSelector(selectCurrentCompany);

  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [tempPhotos, setTempPhotos] = useState<Photo[]>([]);

  // Initialize form data from company
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        description: company.description,
        address: company.address,
        city: company.city,
        zipcode: company.zipcode,
        phone: company.phone,
        website: company.website,
        instagram: company.instagram,
        facebook: company.facebook,
      });
    }
  }, [company]);

  // Mock data for testing if no company is available
  const mockCompany: Company = {
    id: "1",
    user_id: "1",
    name: "Centre Anne Cali",
    description: "Description du centre...",
    address: "7 Rue Lamennais",
    city: "Paris",
    zipcode: "75008",
    phone: "0123456789",
    website: "https://www.annecali.com",
    instagram: "https://www.instagram.com/annecali",
    facebook: "https://www.facebook.com/annecali",
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
    team: [],
    reviews: [],
    photos: [],
  };

  const currentCompany = company || mockCompany;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddressSelect = (data: AddressData) => {
    setAddressData(data);
    setFormData((prev) => ({
      ...prev,
      address: data.streetNumber
        ? `${data.streetNumber} ${data.streetName}`
        : data.streetName,
      city: data.city,
      zipcode: data.postalCode,
    }));
  };

  const handleRemovePhoto = (photoId: string) => {
    // In a real implementation, you would call an API to delete the photo
    console.log("Remove photo:", photoId);
    if (currentCompany && currentCompany.id) {
      // First remove from store
      dispatch(
        removeCompanyPhoto({ companyId: currentCompany.id, photoUrl: photoId })
      );
      // Then delete from database
      dispatch(
        deletePhotoThunk({
          companyId: currentCompany.id,
          photoId: photoId,
        })
      );
    }
  };

  const handleAddTempPhoto = (photo: Photo) => {
    setTempPhotos((prev) => [...prev, photo]);
  };

  const handleRemoveTempPhoto = (photoId: string) => {
    setTempPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const handleSaveChanges = async () => {
    if (!currentCompany.id) return;

    setIsSaving(true);

    try {
      // First, upload any temporary photos
      const uploadedPhotos: Photo[] = [];

      if (tempPhotos.length > 0) {
        for (const photo of tempPhotos) {
          if (photo.file) {
            // Upload the file using signed URLs
            const { url, error } = await uploadFileWithSignedUrl(
              photo.file,
              process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || "",
              `companies/${currentCompany.id}/photos`,
              dispatch
            );

            if (error) {
              console.error("Error uploading photo:", error);
              throw new Error(error);
            }

            if (url) {
              uploadedPhotos.push({
                id: uuidv4(),
                company_id: currentCompany.id,
                url,
                featured: false,
              });
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
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setIsSaving(false);
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">{t("settings.general")}</TabsTrigger>
          <TabsTrigger value="location">{t("settings.location")}</TabsTrigger>
          {/* <TabsTrigger value="contact">{t("settings.contact")}</TabsTrigger> */}
          {/* <TabsTrigger value="hours">{t("settings.hours")}</TabsTrigger> */}
          <TabsTrigger value="team">{t("settings.team")}</TabsTrigger>
          <TabsTrigger value="subscription">
            {t("settings.subscription")}
          </TabsTrigger>
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
                  defaultValue={currentCompany.address}
                  label={t("settings.streetAddress")}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="country">{t("settings.country")}</Label>
                  <Input
                    id="country"
                    value={addressData?.country || ""}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label htmlFor="state">{t("settings.state")}</Label>
                  <Input
                    id="state"
                    value={addressData?.state || ""}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">{t("settings.postalCode")}</Label>
                  <Input
                    id="zipcode"
                    value={formData.zipcode || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">{t("settings.city")}</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="streetNumber">
                    {t("settings.streetNumber")}
                  </Label>
                  <Input
                    id="streetNumber"
                    value={addressData?.streetNumber || ""}
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

        {/* Abonnement et factures */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.subscription")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>{t("settings.currentPlan")}</Label>
                  <p className="text-sm text-gray-500">Premium</p>
                </div>
                <div>
                  <Label>{t("settings.nextBilling")}</Label>
                  <p className="text-sm text-gray-500">1 avril 2024</p>
                </div>
                <Button variant="outline">{t("settings.viewInvoices")}</Button>
                <Button variant="outline">{t("settings.changePlan")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
