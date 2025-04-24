"use client";

import React from "react";
import IntlProvider from "@/components/providers/IntlProvider";

export default function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Properly unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const locale = unwrappedParams.locale;

  return (
    <IntlProvider locale={locale}>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">{children}</main>
      </div>
    </IntlProvider>
  );
}
