import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { createSelector } from "@reduxjs/toolkit";

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
const selectOnboardingState = (state: RootState) => state.onboarding;

export const selectBusinessInfo = createSelector(
  [selectOnboardingState],
  (onboarding) => ({
    businessName: onboarding.businessName,
    website: onboarding.website,
  })
);

export const selectServices = createSelector(
  [selectOnboardingState],
  (onboarding) => onboarding.services
);

export const selectTeamSize = createSelector(
  [selectOnboardingState],
  (onboarding) => onboarding.teamSize
);

export const selectLocation = createSelector(
  [selectOnboardingState],
  (onboarding) => onboarding.location
);

export const selectCurrentStep = createSelector(
  [selectOnboardingState],
  (onboarding) => onboarding.currentStep
);

export const selectIsOnboardingCompleted = createSelector(
  [selectOnboardingState],
  (onboarding) => onboarding.isCompleted
);

export const selectAllOnboardingData = createSelector(
  [selectOnboardingState],
  (onboarding) => onboarding
);

export default onboardingSlice.reducer;
