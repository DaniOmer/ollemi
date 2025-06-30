"use client";

import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import storageEngine from "./storage";

// Import reducers
import authReducer from "./slices/authSlice";
import companiesReducer from "./slices/companiesSlice";
import userReducer from "./slices/userSlice";
import onboardingReducer from "./slices/onboardingSlice";
import categoriesReducer from "./slices/categoriesSlice";
import availabilityReducer from "./slices/availabilitySlice";
import storageReducer from "./slices/storageSlice";
import bookingsReducer from "./slices/bookingSlice";
import subscriptionSlice from "./slices/subscriptionSlice";
import stripeSlice from "./slices/stripeSlice";

// Configure persist options
const persistConfig = {
  key: "root",
  storage: storageEngine,
  whitelist: [
    "user",
    "onboarding",
    "companies",
    "categories",
    "availability",
    "bookings",
    "storage",
  ], // Not persist auth (which has tokens) and subscription (which has stripe data)
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  companies: companiesReducer,
  user: userReducer,
  onboarding: onboardingReducer,
  categories: categoriesReducer,
  availability: availabilityReducer,
  storage: storageReducer,
  bookings: bookingsReducer,
  subscription: subscriptionSlice,
  stripe: stripeSlice,
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
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
