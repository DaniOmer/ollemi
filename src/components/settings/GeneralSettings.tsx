import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppDispatch } from "@/lib/redux/store";
import {
  updateCompanyThunk,
  deletePhotoThunk,
  fetchCompanyById,
  uploadPhotoThunk,
} from "@/lib/redux/slices/companiesSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Company, Photo } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUpload } from "@/components/forms/PhotoUpload";
import { v4 as uuidv4 } from "uuid";
import { uploadFileWithSignedUrl } from "@/utils/uploadUtils";

// Extend the Company type to include team and photos
type TeamMember = {
  id: string;
  name: string;
  imageUrl?: string;
};

type ExtendedCompany = Company & {
  team?: TeamMember[];
  photos?: Photo[];
};

type GeneralSettingsProps = {
  company: ExtendedCompany;
};

export default function GeneralSettings({ company }: GeneralSettingsProps) {
  const { t } = useTranslations();
  const dispatch = useAppDispatch();

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [tempPhotos, setTempPhotos] = useState<Photo[]>([]);

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
    }
  }, [company]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRemovePhoto = async (photoId: string) => {
    if (company && company.id) {
      // Delete from database
      await dispatch(
        deletePhotoThunk({
          companyId: company.id,
          photoId: photoId,
        })
      ).unwrap();
    }
  };

  const handleAddTempPhoto = (photo: Photo) => {
    setTempPhotos((prev) => [...prev, photo]);
  };

  const handleRemoveTempPhoto = (photoId: string) => {
    setTempPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const handleSaveChanges = async () => {
    if (!company.id) return;

    setIsSaving(true);

    try {
      // Update company information
      if (Object.keys(formData).length > 0) {
        await dispatch(
          updateCompanyThunk({
            id: company.id,
            company: formData,
          })
        ).unwrap();
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
              `companies/${company.id}/photos`,
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
                pro_id: company.id,
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
            companyId: company.id,
            photoUrl: photo.url,
          })
        );
      }

      // Clear temporary photos
      setTempPhotos([]);

      // Refresh company data
      dispatch(fetchCompanyById(company.id));
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
              <Label htmlFor="description">{t("settings.description")}</Label>
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
                  (company.team?.length || 0) <= 1
                    ? "solo"
                    : (company.team?.length || 0) <= 5
                    ? "small"
                    : (company.team?.length || 0) <= 10
                    ? "medium"
                    : "large"
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.selectTeamSize")} />
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
            companyId={company.id}
            existingPhotos={company.photos || []}
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
  );
}
