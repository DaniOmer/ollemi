"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { selectIsAuthenticated, logout } from "@/lib/redux/slices/authSlice";
import { selectUserProfile } from "@/lib/redux/slices/userSlice";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  User,
  Calendar,
  Settings,
  LogOut,
  BarChart,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const { t } = useTranslations();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const profile = useAppSelector(selectUserProfile);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isProfessionalSection = pathname?.includes("/professional");

  const dashboardPath = profile?.role === "pro" ? "/pro" : "/client";

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/");
    setUserMenuOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenuElement = document.getElementById("user-menu");
      const mobileMenuElement = document.getElementById("mobile-menu");

      if (userMenuElement && !userMenuElement.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }

      if (
        mobileMenuElement &&
        !mobileMenuElement.contains(event.target as Node) &&
        !document
          .getElementById("mobile-menu-button")
          ?.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigation links based on section
  const getNavLinks = () => {
    if (isProfessionalSection) {
      // Professional section
      return [
        { href: "#features", label: t("nav.features") },
        { href: "#how-it-works", label: t("nav.howItWorks") },
        { href: "#pricing", label: t("nav.pricing") },
      ];
    } else {
      // Client section
      return [
        { href: "/", label: t("nav.features") },
        { href: "/#categories", label: t("client.home.categories.title") },
        { href: "/#how-it-works", label: t("client.home.howItWorks.title") },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-background/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold gradient-text">
              {t("app.name")}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex">
              <LanguageSwitcher />
            </div>

            {/* Section switcher */}
            <Link
              href={isProfessionalSection ? "/" : "/professional"}
              className="hidden md:flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-secondary/70 transition-colors text-sm font-medium"
            >
              {isProfessionalSection
                ? t("nav.clientSection")
                : t("nav.professionalSection")}
            </Link>

            {/* Auth buttons or user menu */}
            {profile ? (
              <div className="relative" id="user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center shadow-soft">
                    {profile?.first_name?.charAt(0)}
                    {profile?.last_name?.charAt(0)}
                  </div>
                  <ChevronDown className="w-4 h-4 text-foreground/70" />
                </button>

                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-border/50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-border/50">
                      <p className="text-sm font-medium">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={`/dashboard/${dashboardPath}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary/30 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <BarChart className="w-4 h-4" />
                        {t("nav.dashboard")}
                      </Link>
                      <Link
                        href={`${dashboardPath}/appointments`}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary/30 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Calendar className="w-4 h-4" />
                        {t("nav.appointments")}
                      </Link>
                      <Link
                        href={`${dashboardPath}/settings`}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary/30 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        {t("nav.settings")}
                      </Link>
                    </div>
                    <div className="border-t border-border/50 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg hover:bg-secondary/70 transition-colors text-sm font-medium"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium shadow-sm"
                >
                  {t("nav.signup")}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              id="mobile-menu-button"
              className="lg:hidden flex items-center justify-center p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden fixed left-0 w-screen h-full min-h-fit bg-white border-t border-border/50 animate-slide-down z-50 shadow-md"
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col justify-center items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground/80 hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Section switcher for mobile */}
              <Link
                href={isProfessionalSection ? "/" : "/professional"}
                className="text-foreground/80 hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {isProfessionalSection
                  ? t("nav.clientSection")
                  : t("nav.professionalSection")}
              </Link>

              {/* Auth links for mobile */}
              {!profile && (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/login"
                    className="w-full py-2 text-center rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/signup"
                    className="w-full py-2 text-center bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.signup")}
                  </Link>
                </div>
              )}
              <div className="md:hidden mt-8">
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
