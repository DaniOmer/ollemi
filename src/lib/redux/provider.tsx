"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import dynamic from "next/dynamic";

// Dynamically import AuthProvider to avoid issues with SSR
const AuthProvider = dynamic(
  () => import("@/components/providers/AuthProvider"),
  { ssr: false }
);

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  // Add state to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Provider store={store}>
      {isClient && persistor ? (
        <PersistGate loading={null} persistor={persistor}>
          <AuthProvider>{children}</AuthProvider>
        </PersistGate>
      ) : (
        children
      )}
    </Provider>
  );
}
