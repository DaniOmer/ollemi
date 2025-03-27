"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";

export default function ProfessionalPage() {
  const { id } = useParams();
  const { t } = useTranslations();

  return (
    <div>
      <h1>{t("professional.title")}</h1>
    </div>
  );
}
