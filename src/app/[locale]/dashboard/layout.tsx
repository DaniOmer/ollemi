"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { selectUserProfile, resetState } from "@/lib/redux/slices/userSlice";
import { logout } from "@/lib/redux/slices/authSlice";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const user = useAppSelector(selectUserProfile);
  const dispatch = useAppDispatch();
  const { t } = useTranslations();

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(resetState());
    router.push("/");
  };

  const sidebarLinks = pathname.includes("/dashboard/pro")
    ? [
        { href: "/dashboard/pro", label: "Tableau de bord", icon: BarChart },
        {
          href: "/dashboard/pro/bookings",
          label: "Réservations",
          icon: Calendar,
        },
        {
          href: "/dashboard/pro/availabilities",
          label: "Disponibilités",
          icon: Clock,
        },
        { href: "/dashboard/pro/services", label: "Services", icon: Scissors },
        { href: "/dashboard/pro/customers", label: "Clients", icon: Users },
        {
          href: "/dashboard/pro/documents",
          label: "Documents",
          icon: FileText,
        },
        {
          href: "/dashboard/pro/settings",
          label: "Paramètres",
          icon: Settings,
        },
      ]
    : [
        { href: "/dashboard/client", label: "Tableau de bord", icon: BarChart },
        {
          href: "/dashboard/client/schedule",
          label: "Mes rendez-vous",
          icon: Calendar,
        },
        {
          href: "/dashboard/client/documents",
          label: "Documents",
          icon: FileText,
        },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <Link href="/" className="text-2xl font-bold gradient-text">
              {t("app.name")} Pro
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-2">
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
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-200 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6" />
              </button>
              <button className="flex items-center space-x-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <User className="w-6 h-6" />
                <span className="text-sm text-black font-medium">
                  {user?.first_name} {user?.last_name}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="px-4 py-3 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Ollemi Pro. Tous droits réservés.
          </div>
        </footer>
      </div>
    </div>
  );
}
