import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import filtersReducer from "./slices/filtersSlice";
import ticketSelectionReducer from "./slices/ticketSelectionSlice";
import onboardingReducer from "./slices/onboardingSlice";
import cityReducer from "./slices/citySlice";

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      filters: filtersReducer,
      ticketSelection: ticketSelectionReducer,
      onboarding: onboardingReducer,
      city: cityReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
