"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";

export default function DashboardHeader() {
  const { t } = useTranslations();

  return (
    <header className="bg-card border-b shadow-soft sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-2xl font-bold gradient-text">
            <Link href="/">{t("app.name")}</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-primary/5"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white shadow-soft">
                JD
              </div>
              <span>Jane Doe</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
