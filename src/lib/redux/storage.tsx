"use client";

import createWebStorage from "redux-persist/lib/storage/createWebStorage";

// Create a noop storage for SSR
const createNoopStorage = () => {
  return {
    getItem: (_key: string) => Promise.resolve(null),
    setItem: (_key: string, value: any) => Promise.resolve(value),
    removeItem: (_key: string) => Promise.resolve(),
  };
};

// Use proper storage based on environment
const storageEngine =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

export default storageEngine;
