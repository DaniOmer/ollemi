"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { XCircle } from "lucide-react";
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

export default function SubscriptionCancelPage() {
  const t = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Show cancel message
    toast({
      title: t("subscription.cancel.title"),
      description: t("subscription.cancel.description"),
    });
  }, [t, toast]);

  return (
    <div className="container max-w-lg py-10">
      <Card className="w-full">
        <CardHeader className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-2 text-red-500" />
          <CardTitle className="text-xl">
            {t("subscription.cancel.title")}
          </CardTitle>
          <CardDescription>
            {t("subscription.cancel.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center">{t("subscription.cancel.message")}</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/pricing")}>
            {t("subscription.viewPlans")}
          </Button>
          <Button
            variant="default"
            onClick={() => router.push("/dashboard/pro")}
          >
            {t("dashboard.goto")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
