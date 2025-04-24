"use client";

import React from "react";
import { useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ReduxProvider } from "@/lib/redux/provider";
import { Toaster } from "react-hot-toast";

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Properly unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const locale = unwrappedParams.locale;

  const [messages, setMessages] = useState<Record<string, any> | null>(null);

  // Set the HTML lang attribute on the client side
  useEffect(() => {
    if (locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  useEffect(() => {
    // Load messages dynamically
    import(`@/messages/${locale}/common.json`)
      .then((module) => {
        setMessages(module.default);
      })
      .catch((error) => {
        console.error("Failed to load messages:", error);
      });
  }, [locale]);

  if (!messages) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-teal-100">
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-center">
          <h1 className="text-5xl font-bold mb-4 text-white tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
              Ollemi
            </span>
          </h1>
          <div className="flex justify-center my-6">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-teal-400/30 animate-spin"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-blue-400/70 animate-pulse"></div>
            </div>
          </div>
          <p className="text-slate-300 text-lg animate-pulse">
            Loading your experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ReduxProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">{children}</div>
        </div>
        <Toaster position="top-right" />
      </NextIntlClientProvider>
    </ReduxProvider>
  );
}
