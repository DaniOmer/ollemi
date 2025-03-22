import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface OnboardingState {
  businessName: string;
  website: string;
  services: any[];
  teamSize: string;
  location: {
    address?: string;
    city?: string;
    zipcode?: string;
    country?: string;
  };
  currentStep: string;
  isCompleted: boolean;
}

const initialState: OnboardingState = {
  businessName: "",
  website: "",
  services: [],
  teamSize: "",
  location: {},
  currentStep: "business-name",
  isCompleted: false,
};

export const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setBusinessInfo: (
      state,
      action: PayloadAction<{ businessName: string; website: string }>
    ) => {
      state.businessName = action.payload.businessName;
      state.website = action.payload.website;
    },
    setServices: (state, action: PayloadAction<any[]>) => {
      state.services = action.payload;
    },
    setTeamSize: (state, action: PayloadAction<string>) => {
      state.teamSize = action.payload;
    },
    setLocation: (
      state,
      action: PayloadAction<{
        address?: string;
        city?: string;
        zipcode?: string;
        country?: string;
      }>
    ) => {
      state.location = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<string>) => {
      state.currentStep = action.payload;
    },
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.isCompleted = action.payload;
    },
    resetOnboarding: (state) => {
      return initialState;
    },
  },
});

export const {
  setBusinessInfo,
  setServices,
  setTeamSize,
  setLocation,
  setCurrentStep,
  setOnboardingCompleted,
  resetOnboarding,
} = onboardingSlice.actions;

// Selectors
export const selectBusinessInfo = (state: RootState) => ({
  businessName: state.onboarding.businessName,
  website: state.onboarding.website,
});
export const selectServices = (state: RootState) => state.onboarding.services;
export const selectTeamSize = (state: RootState) => state.onboarding.teamSize;
export const selectLocation = (state: RootState) => state.onboarding.location;
export const selectCurrentStep = (state: RootState) =>
  state.onboarding.currentStep;
export const selectIsOnboardingCompleted = (state: RootState) =>
  state.onboarding.isCompleted;
export const selectAllOnboardingData = (state: RootState) => state.onboarding;

export default onboardingSlice.reducer;
