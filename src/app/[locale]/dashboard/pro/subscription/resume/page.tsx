"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { resumeSubscription } from "@/lib/services/subscription";
import { useUser } from "@/hooks/use-user";

export default function ResumeSubscriptionPage() {
  const t = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [isResuming, setIsResuming] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [resumeComplete, setResumeComplete] = useState(false);

  const supabase = createClientComponentClient();

  // Fetch subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("subscriptions")
          .select(
            `
            *,
            subscription_plans:plan_id (
              id,
              name,
              description,
              price,
              currency,
              interval
            )
          `
          )
          .eq("user_id", user.id)
          .eq("status", "active")
          .eq("cancel_at_period_end", true)
          .single();

        if (error) throw error;

        if (data) {
          setSubscription(data);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        toast({
          title: t("error"),
          description: t("subscription.fetchError"),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [supabase, user, t, toast]);

  // Handle resuming subscription
  const handleResumeSubscription = async () => {
    if (!subscription?.id) return;

    setIsResuming(true);

    try {
      await resumeSubscription(subscription.id);

      toast({
        title: t("subscription.resumeSuccess.title"),
        description: t("subscription.resumeSuccess.description"),
      });

      // Update state to show success message
      setResumeComplete(true);
    } catch (error) {
      console.error("Error resuming subscription:", error);
      toast({
        title: t("error"),
        description: t("subscription.resumeError"),
      });
    } finally {
      setIsResuming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container max-w-2xl py-10">
        <Alert>
          <AlertTitle>{t("subscription.noCancel.title")}</AlertTitle>
          <AlertDescription>
            {t("subscription.noCancel.description")}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/dashboard/pro/subscription")}>
            {t("subscription.viewPlans")}
          </Button>
        </div>
      </div>
    );
  }

  if (resumeComplete) {
    return (
      <div className="container max-w-lg py-10">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-2 text-green-500" />
            <CardTitle className="text-xl">
              {t("subscription.resumeSuccess.title")}
            </CardTitle>
            <CardDescription>
              {t("subscription.resumeSuccess.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center">
              {t("subscription.resumeSuccess.message")}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button
              variant="default"
              onClick={() => router.push("/dashboard/pro/subscription/manage")}
            >
              {t("subscription.viewSubscription")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t("subscription.resume.title")}</CardTitle>
          <CardDescription>
            {t("subscription.resume.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t("subscription.currentPlan")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.plan")}
                </p>
                <p className="font-medium">
                  {subscription.subscription_plans?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.price")}
                </p>
                <p className="font-medium">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency:
                      subscription.subscription_plans?.currency || "EUR",
                  }).format(subscription.subscription_plans?.price || 0)}
                  /{subscription.subscription_plans?.interval}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.currentPeriodEnd")}
                </p>
                <p className="font-medium">
                  {new Date(
                    subscription.current_period_end
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <Alert>
            <AlertTitle>{t("subscription.resumeInfo.title")}</AlertTitle>
            <AlertDescription>
              {t("subscription.resumeInfo.description")}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/pro/subscription/manage")}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="default"
            onClick={handleResumeSubscription}
            disabled={isResuming}
          >
            {isResuming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("subscription.resumeSubscription")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
