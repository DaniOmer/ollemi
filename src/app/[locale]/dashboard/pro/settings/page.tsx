"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";

import {
  selectCurrentCompany,
  fetchCompanyById,
} from "@/lib/redux/slices/companiesSlice";
import { selectUserProfile } from "@/lib/redux/slices/userSlice";

import { Company, Address } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  GeneralSettings,
  LocationSettings,
  TeamSettings,
  SubscriptionSettings,
  SecuritySettings,
} from "@/components/settings";

export default function SettingsPage() {
  const { t } = useTranslations();
  const dispatch = useAppDispatch();
  const company = useAppSelector(selectCurrentCompany);
  const user = useAppSelector(selectUserProfile);

  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [addressFormData, setAddressFormData] = useState<Partial<Address>>({});

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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{t("settings.title")}</h1>

      <Tabs
        defaultValue="general"
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">{t("settings.general")}</TabsTrigger>
          <TabsTrigger value="location">{t("settings.location")}</TabsTrigger>
          <TabsTrigger value="team">{t("settings.team")}</TabsTrigger>
          <TabsTrigger value="subscription">
            {t("settings.subscription")}
          </TabsTrigger>
          <TabsTrigger value="security">{t("settings.security")}</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <GeneralSettings company={currentCompany} />
        </TabsContent>

        {/* Location Settings */}
        <TabsContent value="location" className="space-y-6">
          <LocationSettings company={currentCompany} />
        </TabsContent>

        {/* Team Settings */}
        <TabsContent value="team" className="space-y-6">
          <TeamSettings company={currentCompany} />
        </TabsContent>

        {/* Subscription Settings */}
        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionSettings />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
