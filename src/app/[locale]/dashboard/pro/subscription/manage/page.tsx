"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, Loader2 } from "lucide-react";
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
import { cancelSubscription } from "@/lib/services/subscription";
import { useUser } from "@/hooks/use-user";

export default function ManageSubscriptionPage() {
  const t = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
              interval,
              features
            ),
            subscription_invoices (
              id,
              amount,
              currency,
              status,
              created_at
            )
          `
          )
          .eq("user_id", user.id)
          .eq("status", "active")
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

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;

    setIsCancelling(true);

    try {
      await cancelSubscription(subscription.id, true);

      toast({
        title: t("subscription.cancelSuccess.title"),
        description: t("subscription.cancelSuccess.description"),
      });

      // Update subscription status
      setSubscription({
        ...subscription,
        cancel_at_period_end: true,
      });

      setShowCancelConfirm(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: t("error"),
        description: t("subscription.cancelError"),
      });
    } finally {
      setIsCancelling(false);
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
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("subscription.noSubscription.title")}</AlertTitle>
          <AlertDescription>
            {t("subscription.noSubscription.description")}
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

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-2xl font-bold mb-6">
        {t("subscription.manage.title")}
      </h1>

      {/* Subscription Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("subscription.details")}</CardTitle>
          <CardDescription>{t("subscription.currentDetails")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                {t("subscription.status")}
              </p>
              <p className="font-medium capitalize">{subscription.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("subscription.price")}
              </p>
              <p className="font-medium">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: subscription.subscription_plans?.currency || "EUR",
                }).format(subscription.subscription_plans?.price || 0)}
                /{subscription.subscription_plans?.interval}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("subscription.currentPeriodEnd")}
              </p>
              <p className="font-medium">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          </div>

          {subscription.cancel_at_period_end && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("subscription.cancelScheduled.title")}</AlertTitle>
              <AlertDescription>
                {t("subscription.cancelScheduled.description", {
                  date: new Date(
                    subscription.current_period_end
                  ).toLocaleDateString(),
                })}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/pro/subscription")}
          >
            {t("subscription.changePlan")}
          </Button>

          {!subscription.cancel_at_period_end && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelConfirm(true)}
            >
              {t("subscription.cancel")}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Cancellation Confirmation */}
      {showCancelConfirm && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>{t("subscription.cancelConfirm.title")}</CardTitle>
            <CardDescription>
              {t("subscription.cancelConfirm.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{t("subscription.cancelConfirm.message")}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>{t("subscription.cancelConfirm.point1")}</li>
              <li>{t("subscription.cancelConfirm.point2")}</li>
              <li>
                {t("subscription.cancelConfirm.point3", {
                  date: new Date(
                    subscription.current_period_end
                  ).toLocaleDateString(),
                })}
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("subscription.confirmCancel")}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Invoices */}
      {subscription.subscription_invoices?.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("subscription.invoices.title")}</CardTitle>
            <CardDescription>
              {t("subscription.invoices.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">
                      {t("subscription.invoices.date")}
                    </th>
                    <th className="text-left py-3 px-2">
                      {t("subscription.invoices.amount")}
                    </th>
                    <th className="text-left py-3 px-2">
                      {t("subscription.invoices.status")}
                    </th>
                    <th className="text-right py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {subscription.subscription_invoices.map((invoice: any) => (
                    <tr key={invoice.id} className="border-b">
                      <td className="py-3 px-2">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: invoice.currency,
                        }).format(invoice.amount)}
                      </td>
                      <td className="py-3 px-2 capitalize">{invoice.status}</td>
                      <td className="py-3 px-2 text-right">
                        {invoice.invoice_url && (
                          <Button variant="link" size="sm" asChild>
                            <a
                              href={invoice.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {t("subscription.invoices.view")}
                            </a>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
