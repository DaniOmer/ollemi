export const subscriptionPlans = [
  {
    name: "Basic",
    description: "Plan de démarrage pour prendre en main la plateforme",
    price: 10,
    currency: "EUR",
    interval: "month",
    interval_count: 1,
    trial_period_days: 7,
    is_active: true,
    features: {
      appointments: 1000,
      services: 100,
      featured: false,
      locations: 1,
      eventsEnabled: false,
      // Communication
      reminders: {
        email: true,
        sms: false,
        inApp: true,
        freePerMonth: 50,
      },
      marketingCampaigns: {
        email: 1,
        sms: 0,
      },
      clientPortal: true,
      // Équipe & ressources
      advancedScheduling: false,
      payroll: false,
      // Protection revenus
      depositRequired: false,
      penaltyNoShow: false,
      marketplaceListing: false,
      // Analytics & reporting
      analyticsDashboard: false,
      reportExport: false,
      scheduledReports: false,
      // Fidélité & cadeaux
      loyaltyProgram: false,
      giftCards: false,
      // Gestion ventes & stock
      pos: false,
      inventory: false,
      // Intégrations
      apiAccess: false,
      syncGoogleCalendar: false,
      syncOutlook: false,
      zoomIntegration: false,
      // Mobile
      mobileAppAccess: true,
      // Clientèle
      waitlist: false,
    },
  },
  {
    name: "Pro",
    description: "Fonctionnalités avancées pour développer votre activité",
    price: 20,
    currency: "EUR",
    interval: "month",
    interval_count: 1,
    trial_period_days: 7,
    is_active: true,
    features: {
      appointments: 3000,
      services: 200,
      featured: false,
      locations: 1,
      eventsEnabled: true,
      // Communication
      reminders: {
        email: true,
        sms: true,
        inApp: true,
        freePerMonth: 200,
      },
      marketingCampaigns: {
        email: 5,
        sms: 2,
      },
      clientPortal: true,
      // Équipe & ressources
      advancedScheduling: true,
      payroll: false,
      // Protection revenus
      depositRequired: true,
      penaltyNoShow: true,
      marketplaceListing: true,
      // Analytics & reporting
      analyticsDashboard: true,
      reportExport: true,
      scheduledReports: true,
      // Fidélité & cadeaux
      loyaltyProgram: true,
      giftCards: true,
      // Gestion ventes & stock
      pos: false,
      inventory: false,
      // Intégrations
      apiAccess: true,
      syncGoogleCalendar: true,
      syncOutlook: true,
      zoomIntegration: true,
      // Mobile
      mobileAppAccess: true,
      // Clientèle
      waitlist: true,
    },
  },
  {
    name: "Enterprise",
    description:
      "Solution complète et personnalisable pour les grands salons et chaînes",
    price: 30,
    currency: "EUR",
    interval: "month",
    interval_count: 1,
    trial_period_days: 7,
    is_active: true,
    features: {
      appointments: 10000,
      services: 500,
      featured: true,
      locations: 5,
      eventsEnabled: true,
      // Communication
      reminders: {
        email: true,
        sms: true,
        inApp: true,
        freePerMonth: 1000,
      },
      marketingCampaigns: {
        email: 20,
        sms: 10,
      },
      clientPortal: true,
      // Équipe & ressources
      advancedScheduling: true,
      payroll: true,
      // Protection revenus
      depositRequired: true,
      penaltyNoShow: true,
      marketplaceListing: true,
      // Analytics & reporting
      analyticsDashboard: true,
      reportExport: true,
      scheduledReports: true,
      // Fidélité & cadeaux
      loyaltyProgram: true,
      giftCards: true,
      // Gestion ventes & stock
      pos: true,
      inventory: true,
      // Intégrations
      apiAccess: true,
      syncGoogleCalendar: true,
      syncOutlook: true,
      zoomIntegration: true,
      // Mobile
      mobileAppAccess: true,
      // Clientèle
      waitlist: true,
    },
  },
];
