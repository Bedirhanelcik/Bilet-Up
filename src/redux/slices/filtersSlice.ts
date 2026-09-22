import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SortOption = "date-asc" | "date-desc" | "price-asc" | "price-desc" | "popularity";
export type Timeframe = "upcoming" | "past" | "all";

export interface EventFilters {
  query: string;
  category: string | null;
  location: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  priceMin: number | null;
  priceMax: number | null;
  sort: SortOption;
  /** Defaults to "upcoming" — matches the pre-existing behavior of never showing completed
   * events on Discover unless explicitly asked for. */
  timeframe: Timeframe;
}

const initialState: EventFilters = {
  query: "",
  category: null,
  location: null,
  dateFrom: null,
  dateTo: null,
  priceMin: null,
  priceMax: null,
  sort: "date-asc",
  timeframe: "upcoming",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setCategory(state, action: PayloadAction<string | null>) {
      state.category = action.payload;
    },
    setLocation(state, action: PayloadAction<string | null>) {
      state.location = action.payload;
    },
    setDateRange(state, action: PayloadAction<{ from: string | null; to: string | null }>) {
      state.dateFrom = action.payload.from;
      state.dateTo = action.payload.to;
    },
    setPriceRange(state, action: PayloadAction<{ min: number | null; max: number | null }>) {
      state.priceMin = action.payload.min;
      state.priceMax = action.payload.max;
    },
    setSort(state, action: PayloadAction<SortOption>) {
      state.sort = action.payload;
    },
    setTimeframe(state, action: PayloadAction<Timeframe>) {
      state.timeframe = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setQuery,
  setCategory,
  setLocation,
  setDateRange,
  setPriceRange,
  setSort,
  setTimeframe,
  resetFilters,
} = filtersSlice.actions;
export default filtersSlice.reducer;
