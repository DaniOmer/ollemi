"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  FileText,
  Settings,
  BarChart,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Scissors,
  Clock,
  CreditCard,
} from "lucide-react";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { selectUserProfile, resetState } from "@/lib/redux/slices/userSlice";
import { logout } from "@/lib/redux/slices/authSlice";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const user = useAppSelector(selectUserProfile);
  const dispatch = useAppDispatch();
  const t = useTranslations();

  // Add effect to set sidebar open by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(resetState());
    router.push("/");
  };

  const sidebarLinks = pathname.includes("/dashboard/pro")
    ? [
        {
          href: "/dashboard/pro",
          label: t("dashboard.pro.overview"),
          icon: BarChart,
        },
        {
          href: "/dashboard/pro/bookings",
          label: t("dashboard.pro.bookings.sidebar"),
          icon: Calendar,
        },
        {
          href: "/dashboard/pro/availabilities",
          label: t("dashboard.pro.availabilities"),
          icon: Clock,
        },
        {
          href: "/dashboard/pro/services",
          label: t("dashboard.pro.services"),
          icon: Scissors,
        },
        {
          href: "/dashboard/pro/customers",
          label: t("dashboard.pro.customers"),
          icon: Users,
        },
        {
          href: "/dashboard/pro/settings",
          label: t("dashboard.pro.settings"),
          icon: Settings,
        },
      ]
    : [
        {
          href: "/dashboard/client",
          label: t("dashboard.client.overview"),
          icon: BarChart,
        },
        {
          href: "/dashboard/client/bookings",
          label: t("dashboard.client.bookings"),
          icon: Calendar,
        },
        {
          href: "/dashboard/client/settings",
          label: t("dashboard.client.settings"),
          icon: Settings,
        },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar for mobile - slide in from the left */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold gradient-text">
              {t("app.name")}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <LogOut className="w-5 h-5 mr-3" />
              {t("dashboard.logout")}
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar for desktop - always visible */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out hidden lg:block ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <Link href="/" className="text-2xl font-bold gradient-text">
              {t("app.name")}
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <LogOut className="w-5 h-5 mr-3" />
              {t("dashboard.logout")}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-200 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg hidden lg:block"
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button className="flex items-center space-x-1 md:space-x-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <User className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-xs md:text-sm text-black font-medium hidden sm:block">
                  {user?.first_name} {user?.last_name}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 md:p-6">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="px-4 py-2 md:py-3 text-center text-xs md:text-sm text-gray-600">
            © {new Date().getFullYear()} Ollemi Pro.{" "}
            {t("dashboard.footer.rights")}
          </div>
        </footer>
      </div>
    </div>
  );
}
