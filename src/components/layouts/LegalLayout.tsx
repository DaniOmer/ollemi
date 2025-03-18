"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
}

export default function LegalLayout({
  children,
  title,
  lastUpdated,
}: LegalLayoutProps) {
  const { t } = useTranslations();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;

  const legalPages = [
    {
      title: t("footer.termsOfService"),
      href: `/${locale}/legal/terms`,
    },
    {
      title: t("footer.privacyPolicy"),
      href: `/${locale}/legal/privacy`,
    },
    {
      title: t("footer.cookiesPolicy"),
      href: `/${locale}/legal/cookies`,
    },
    {
      title: t("footer.gdpr"),
      href: `/${locale}/legal/gdpr`,
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-xl">{t("nav.legalDocs")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col space-y-1">
                  {legalPages.map((page) => (
                    <Link key={page.href} href={page.href} passHref>
                      <Button
                        variant={pathname === page.href ? "default" : "ghost"}
                        className={cn(
                          "justify-start w-full rounded-none px-6 py-3 text-left",
                          pathname === page.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        )}
                      >
                        {page.title}
                      </Button>
                    </Link>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="animate-fade-in shadow-soft">
              <CardHeader className="border-b">
                <div className="flex flex-col space-y-2">
                  <CardTitle className="text-3xl font-extrabold gradient-text">
                    {title}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {t("legal.lastUpdated")}: {lastUpdated}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-lg max-w-none">{children}</div>
              </CardContent>
            </Card>

            <div className="mt-8 flex justify-between items-center">
              <Link href={`/${locale}`} passHref>
                <Button variant="outline" className="hover-lift">
                  &larr; {t("nav.backToHome")}
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-primary"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {t("nav.backToTop")} &uarr;
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
