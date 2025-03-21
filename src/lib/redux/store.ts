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
import professionalsReducer from "./slices/professionalsSlice";
import userReducer from "./slices/userSlice";

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
  whitelist: ["auth", "user"], // Only persist auth and user state
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  appointments: appointmentsReducer,
  professionals: professionalsReducer,
  user: userReducer,
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

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
