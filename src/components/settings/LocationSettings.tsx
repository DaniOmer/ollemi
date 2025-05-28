import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppDispatch } from "@/lib/redux/store";
import {
  updateAddressThunk,
  createAddressThunk,
  fetchCompanyById,
} from "@/lib/redux/slices/companiesSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Company, Address } from "@/types";
import {
  AddressAutocomplete,
  AddressData,
} from "@/components/forms/AddressAutocomplete";

// Extend the Company type to include address
type ExtendedCompany = Company & {
  address?: Address;
};

type LocationSettingsProps = {
  company: ExtendedCompany;
};

export default function LocationSettings({ company }: LocationSettingsProps) {
  const { t } = useTranslations();
  const dispatch = useAppDispatch();

  const [isSaving, setIsSaving] = useState(false);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [addressFormData, setAddressFormData] = useState<Partial<Address>>({});

  // Initialize address data from company
  useEffect(() => {
    if (company && company.address) {
      setAddressFormData({
        formatted_address: company.address.formatted_address,
        street_number: company.address.street_number,
        street_name: company.address.street_name,
        city: company.address.city,
        state: company.address.state,
        postal_code: company.address.postal_code,
        country: company.address.country,
        place_id: company.address.place_id,
        latitude: company.address.latitude,
        longitude: company.address.longitude,
      });
    }
  }, [company]);

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

  const handleSaveChanges = async () => {
    if (!company.id) return;

    setIsSaving(true);

    try {
      // Update or create address
      if (Object.keys(addressFormData).length > 0) {
        if (company.address?.id) {
          // Update existing address
          await dispatch(
            updateAddressThunk({
              companyId: company.id,
              addressId: company.address.id,
              addressData: addressFormData,
            })
          ).unwrap();
        } else {
          // Create new address
          await dispatch(
            createAddressThunk({
              companyId: company.id,
              addressData: addressFormData as Omit<
                Address,
                "id" | "company_id" | "created_at" | "updated_at"
              >,
            })
          ).unwrap();
        }
      }

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
        <CardTitle>{t("settings.location")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>{t("settings.locationInfo")}</Label>
          <AddressAutocomplete
            onAddressSelect={handleAddressSelect}
            defaultValue={company.address?.formatted_address || ""}
            label={t("settings.streetAddress")}
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="country">{t("settings.country")}</Label>
            <Input
              id="country"
              value={addressFormData.country || addressData?.country || ""}
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
                addressFormData.postal_code || addressData?.postalCode || ""
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
            <Label htmlFor="streetNumber">{t("settings.streetNumber")}</Label>
            <Input
              id="streetNumber"
              value={
                addressFormData.street_number || addressData?.streetNumber || ""
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
  );
}
