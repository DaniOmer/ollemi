import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  createCheckoutSessionThunk,
  fetchSubscriptionPlansThunk,
  fetchActiveSubscriptionThunk,
} from "@/lib/redux/slices/subscriptionSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Download, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  cancelSubscription,
  resumeSubscription,
} from "@/lib/services/subscriptions";
import Badge from "@/components/ui/badge";

type BillingInterval = "month" | "year";

export default function SubscriptionSettings() {
  const { t } = useTranslations();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // Subscription states from Redux
  const { plans, activeSubscription, checkoutSession, status, error } =
    useAppSelector((state) => state.subscription);

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month");
  const [invoices, setInvoices] = useState<any[]>([]);

  // New states for cancellation confirmation
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  // Update current subscription when active subscription changes
  useEffect(() => {
    if (activeSubscription) {
      setCurrentSubscription(activeSubscription);
    }
  }, [activeSubscription]);

  // Fetch subscription plans and current subscription
  useEffect(() => {
    dispatch(fetchSubscriptionPlansThunk(billingInterval));
    dispatch(fetchActiveSubscriptionThunk());
  }, [dispatch, billingInterval]);

  // Handle subscription checkout
  const handleSubscribe = async (planId: string) => {
    setIsSubscribing(true);

    try {
      const result = await dispatch(
        createCheckoutSessionThunk({
          planId,
          successUrl: `${window.location.origin}/dashboard/pro/settings`,
          cancelUrl: `${window.location.origin}/dashboard/pro/settings`,
        })
      ).unwrap();

      // Use the URL directly from the result
      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error(`Failed to create checkout session`);
      }
    } catch (error) {
      console.error("Error starting subscription:", error);
      toast({
        title: t("error"),
        description: t("subscription.checkoutError"),
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  // Format price to display currency correctly
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  // Helper to format features
  const formatFeature = (key: string, value: any, parentKey?: string) => {
    const translationKeyBase = parentKey ? `${parentKey}.${key}` : key;
    const translationKey = `subscription.features.${translationKeyBase}`;

    // Try translating the feature key itself first
    let featureName = t(translationKey);
    if (featureName === translationKey) {
      featureName = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    }

    if (typeof value === "boolean") {
      return `${featureName}: ${value ? t("yes") : t("no")}`;
    }
    if (
      (key === "appointments" || key === "services") &&
      typeof value === "number"
    ) {
      const displayValue =
        value === -1 || value > 999 ? t("subscription.unlimited") : value;
      return `${featureName}: ${displayValue}`;
    }
    if (key === "freePerMonth" && typeof value === "number") {
      return `${featureName}: ${value} ${t("subscription.freePerMonthSuffix")}`;
    }
    if (typeof value === "number") {
      return `${featureName}: ${value}`;
    }
    // If it's an object, we don't display a value directly here, handled in the loop
    if (typeof value === "object" && value !== null) {
      return null; // Don't render a line item for the object itself
    }

    // Handle potential null or undefined values gracefully for other types
    return `${featureName}: ${value ? String(value) : "-"}`;
  };

  // Check if the user is already subscribed to this plan
  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId;
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription?.id) return;

    setIsCancelling(true);

    try {
      await cancelSubscription(currentSubscription.id, true);

      toast({
        title: t("subscription.cancelSuccess.title"),
        description: t("subscription.cancelSuccess.description"),
      });

      // Update subscription status
      setCurrentSubscription({
        ...currentSubscription,
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

  const handleResumeSubscription = async () => {
    if (!currentSubscription?.id) return;

    setIsResuming(true);

    try {
      await resumeSubscription(currentSubscription.id);

      toast({
        title: t("subscription.resumeSuccess.title"),
        description: t("subscription.resumeSuccess.description"),
      });

      // Update subscription status
      setCurrentSubscription({
        ...currentSubscription,
        cancel_at_period_end: false,
      });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.subscription")}</CardTitle>
        <CardDescription>{t("subscription.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === "loading" ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Current Subscription Details */}
            {/* {currentSubscription && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>{t("subscription.details")}</CardTitle>
                  <CardDescription>
                    {t("subscription.currentDetails")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("subscription.plan")}
                      </p>
                      <p className="font-medium">
                        {currentSubscription.subscription_plans?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("subscription.status")}
                      </p>
                      <p className="font-medium capitalize">
                        {currentSubscription.status}
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
                            currentSubscription.subscription_plans?.currency ||
                            "EUR",
                        }).format(
                          currentSubscription.subscription_plans?.price || 0
                        )}
                        /
                        {t(
                          `subscription.${
                            currentSubscription.subscription_plans?.interval ||
                            "month"
                          }`
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("subscription.currentPeriodEnd")}
                      </p>
                      <p className="font-medium">
                        {new Date(
                          currentSubscription.current_period_end
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {currentSubscription.cancel_at_period_end && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>
                        {t("subscription.cancelScheduled.title")}
                      </AlertTitle>
                      <AlertDescription>
                        {t("subscription.cancelScheduled.description")}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                  {!currentSubscription.cancel_at_period_end ? (
                    <Button
                      variant="destructive"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      {t("subscription.cancel")}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={handleResumeSubscription}
                      disabled={isResuming}
                    >
                      {isResuming && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {t("subscription.resumeSubscription")}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )} */}

            {/* Billing interval selector */}
            <div className="flex justify-end mb-6">
              <Tabs
                defaultValue="month"
                className="w-[200px]"
                onValueChange={(value) =>
                  setBillingInterval(value as BillingInterval)
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="month">
                    {t("subscription.monthly")}
                  </TabsTrigger>
                  <TabsTrigger value="year">
                    {t("subscription.yearly")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {plans.length === 0 ? (
              <div className="text-center p-8">
                <p>{t("subscription.noPlans")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`w-full h-full flex flex-col relative ${
                      plan.name === "Pro" ? "border-primary shadow-lg" : ""
                    }`}
                  >
                    {activeSubscription?.plan_id === plan.id && (
                      <Badge className="absolute top-2 right-2">
                        {t("subscription.currentPlan")}
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="text-3xl font-bold mb-4">
                        {formatPrice(plan.price, plan.currency)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{t(`subscription.${plan.interval}`)}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {Object.entries(plan.features || {}).map(
                          ([key, value]) => {
                            if (typeof value === "object" && value !== null) {
                              // Render nested features
                              return (
                                <li key={key} className="ml-4 pt-2">
                                  <span className="font-medium text-sm text-muted-foreground">
                                    {(() => {
                                      const titleKey = `subscription.features.${key}.title`;
                                      const fallbackKey = `subscription.features.${key}`;
                                      let title = t(titleKey);
                                      if (title === titleKey) {
                                        title = t(fallbackKey);
                                        if (title === fallbackKey) {
                                          title = key
                                            .replace(/([A-Z])/g, " $1")
                                            .replace(/^./, (str) =>
                                              str.toUpperCase()
                                            );
                                        }
                                      }
                                      return `${title}:`;
                                    })()}
                                  </span>
                                  <ul className="list-none pl-4 space-y-1 mt-1">
                                    {Object.entries(value).map(
                                      ([subKey, subValue]) => {
                                        const formattedSubFeature =
                                          formatFeature(
                                            subKey,
                                            subValue,
                                            key // Pass parent key for translation
                                          );
                                        return formattedSubFeature ? (
                                          <li
                                            key={subKey}
                                            className="flex items-center text-sm"
                                          >
                                            <CheckCircle className="h-3 w-3 text-primary mr-2 flex-shrink-0" />
                                            <span>{formattedSubFeature}</span>
                                          </li>
                                        ) : null;
                                      }
                                    )}
                                  </ul>
                                </li>
                              );
                            } else {
                              // Render simple features
                              const formattedFeature = formatFeature(
                                key,
                                value
                              );
                              return formattedFeature ? (
                                <li key={key} className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                                  <span>{formattedFeature}</span>
                                </li>
                              ) : null;
                            }
                          }
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={isCurrentPlan(plan.id) ? "outline" : "default"}
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isSubscribing || isCurrentPlan(plan.id)}
                      >
                        {isSubscribing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {isCurrentPlan(plan.id)
                          ? t("subscription.currentPlan")
                          : t("subscription.subscribe")}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

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
                    <li>{t("subscription.cancelConfirm.point3")}</li>
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

            {/* Invoices section */}
            {invoices.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">
                  {t("subscription.invoices")}
                </h3>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <Card key={invoice.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {new Date(
                                invoice.created * 1000
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(
                                invoice.amount_paid / 100,
                                invoice.currency
                              )}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(invoice.hosted_invoice_url)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t("subscription.view")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(invoice.invoice_pdf)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t("subscription.download")}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
