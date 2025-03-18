"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslations } from "@/hooks/useTranslations";

export default function ClientHeader() {
  const { t } = useTranslations();

  return (
    <header className="shadow-soft sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold gradient-text">
          <Link href="/">{t("app.name")}</Link>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link
            href="/"
            className="hover:text-primary transition-colors relative group"
          >
            {t("nav.features")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="#categories"
            className="hover:text-primary transition-colors relative group"
          >
            {t("client.home.categories.title")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="#how-it-works"
            className="hover:text-primary transition-colors relative group"
          >
            {t("client.home.howItWorks.title")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/professional"
            className="px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
          >
            Espace Pro
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {t("nav.login")}
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-primary text-white rounded-lg hover-lift hover:bg-primary/90 transition-all"
          >
            {t("nav.signup")}
          </Link>
        </div>
      </div>
    </header>
  );
}
