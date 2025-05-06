import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import Image from "next/image";
import { Company } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

// Define TeamMember type
type TeamMember = {
  id: string;
  name: string;
  imageUrl?: string;
};

// Extend the Company type to include team
type ExtendedCompany = Company & {
  team?: TeamMember[];
};

type TeamSettingsProps = {
  company: ExtendedCompany;
};

export default function TeamSettings({ company }: TeamSettingsProps) {
  const { t } = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.team")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {company.team?.map((member: TeamMember) => (
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
  );
}
