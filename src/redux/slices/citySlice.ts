import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * The navbar's city selector — a lightweight, app-wide "preferred city" that's independent of
 * the Discover page's `filters.location` (which resets per Discover visit). Selecting a city
 * here both navigates to `/discover?location=<city>` (reusing the exact same filter Discover
 * already understands) and reorders the homepage's city rails so that city leads, without
 * inventing a second filtering mechanism.
 */
export interface CityState {
  selectedCity: string | null;
}

const initialState: CityState = {
  selectedCity: null,
};

const citySlice = createSlice({
  name: "city",
  initialState,
  reducers: {
    setSelectedCity(state, action: PayloadAction<string | null>) {
      state.selectedCity = action.payload;
    },
  },
});

export const { setSelectedCity } = citySlice.actions;
export default citySlice.reducer;
