import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const INTEREST_CATEGORIES = [
  "Music",
  "Technology",
  "Sports",
  "Art",
  "Festivals",
  "Business",
  "Gaming",
  "Theater",
  "Family",
] as const;

export type InterestCategory = (typeof INTEREST_CATEGORIES)[number];

interface OnboardingState {
  step: number;
  selectedInterests: InterestCategory[];
  completed: boolean;
}

const initialState: OnboardingState = {
  step: 0,
  selectedInterests: [],
  completed: false,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    toggleInterest(state, action: PayloadAction<InterestCategory>) {
      const idx = state.selectedInterests.indexOf(action.payload);
      if (idx >= 0) state.selectedInterests.splice(idx, 1);
      else state.selectedInterests.push(action.payload);
    },
    completeOnboarding(state) {
      state.completed = true;
    },
    resetOnboarding() {
      return initialState;
    },
  },
});

export const { setStep, toggleInterest, completeOnboarding, resetOnboarding } =
  onboardingSlice.actions;
export default onboardingSlice.reducer;
