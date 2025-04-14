"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function SubscriptionSuccessPage() {
  const t = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show success message
    toast({
      title: t("subscription.success.title"),
      description: t("subscription.success.description"),
    });

    // We could verify the subscription status here by calling an API endpoint
    // For now, we'll just simulate a loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [t, toast]);

  return (
    <div className="container max-w-lg py-10">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-2 text-green-500" />
          <CardTitle className="text-xl">
            {t("subscription.success.title")}
          </CardTitle>
          <CardDescription>
            {t("subscription.success.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center">{t("subscription.success.message")}</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            variant="default"
            onClick={() => router.push("/dashboard/pro")}
            disabled={isLoading}
          >
            {t("dashboard.goto")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
