"use client";

import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { combineReducers } from "redux";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// Import reducers
import authReducer from "./slices/authSlice";
import appointmentsReducer from "./slices/appointmentsSlice";
import companiesReducer from "./slices/companiesSlice";
import userReducer from "./slices/userSlice";
import onboardingReducer from "./slices/onboardingSlice";

// Create a custom storage that checks for window availability
const customStorage = {
  getItem: (key: string) => {
    if (typeof window !== "undefined") {
      return storage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined") {
      storage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== "undefined") {
      storage.removeItem(key);
    }
  },
};

// Configure persist options
const persistConfig = {
  key: "root",
  storage: typeof window !== "undefined" ? storage : customStorage,
  whitelist: ["auth", "user", "onboarding"], // Persist auth, user, and onboarding state
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  appointments: appointmentsReducer,
  companies: companiesReducer,
  user: userReducer,
  onboarding: onboardingReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Create persistor only on client side
let persistor: any;
if (typeof window !== "undefined") {
  persistor = persistStore(store);
}

export { store, persistor };

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
