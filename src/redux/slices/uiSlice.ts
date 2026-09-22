import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  mobileNavOpen: boolean;
  commandMenuOpen: boolean;
}

const initialState: UiState = {
  mobileNavOpen: false,
  commandMenuOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload;
    },
    setCommandMenuOpen(state, action: PayloadAction<boolean>) {
      state.commandMenuOpen = action.payload;
    },
  },
});

export const { setMobileNavOpen, setCommandMenuOpen } = uiSlice.actions;
export default uiSlice.reducer;
