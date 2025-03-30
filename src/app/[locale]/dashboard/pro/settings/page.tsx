"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { selectCurrentCompany } from "@/lib/redux/slices/companiesSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Company, OpeningHours, TeamMember, Photo, DayHours } from "@/types";
import Image from "next/image";
import { Plus, Trash2, Upload, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const { t } = useTranslations();
  const dispatch = useAppDispatch();
  const company = useAppSelector(selectCurrentCompany);
  console.log("company", company);
  const [activeTab, setActiveTab] = useState("general");

  // Mock data for testing
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{t("settings.title")}</h1>

      <Tabs defaultValue="general" className="space-y-6">
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
                    <Input id="name" defaultValue={currentCompany.name} />
                  </div>
                  <div>
                    <Label htmlFor="description">
                      {t("settings.description")}
                    </Label>
                    <Textarea
                      id="description"
                      defaultValue={currentCompany.description}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">{t("settings.website")}</Label>
                    <Input id="website" defaultValue={currentCompany.website} />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("settings.phone")}</Label>
                    <Input id="phone" defaultValue={currentCompany.phone} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instagram">{t("settings.instagram")}</Label>
                    <Input
                      id="instagram"
                      defaultValue={currentCompany.instagram}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook">{t("settings.facebook")}</Label>
                    <Input
                      id="facebook"
                      defaultValue={currentCompany.facebook}
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
                  {/* <Label>{t("settings.photos")}</Label> */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {t("settings.addPhoto")}
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentCompany.photos?.map((photo: Photo) => (
                    <div
                      key={photo.id}
                      className="relative group aspect-square"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.alt || ""}
                        fill
                        className="rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="bg-white/20 hover:bg-white/30"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="min-w-[120px]">{t("common.save")}</Button>
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
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">{t("settings.address")}</Label>
                <Input id="address" defaultValue={currentCompany.address} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">{t("settings.city")}</Label>
                  <Input id="city" defaultValue={currentCompany.city} />
                </div>
                <div>
                  <Label htmlFor="zipcode">{t("settings.zipcode")}</Label>
                  <Input id="zipcode" defaultValue={currentCompany.zipcode} />
                </div>
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
