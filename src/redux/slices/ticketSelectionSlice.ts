import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SelectedTicket {
  ticketTypeId: string;
  name: string;
  price: number;
  quantity: number;
}

interface TicketSelectionState {
  eventId: string | null;
  eventSlug: string | null;
  items: SelectedTicket[];
}

const initialState: TicketSelectionState = {
  eventId: null,
  eventSlug: null,
  items: [],
};

const ticketSelectionSlice = createSlice({
  name: "ticketSelection",
  initialState,
  reducers: {
    startSelection(state, action: PayloadAction<{ eventId: string; eventSlug: string }>) {
      if (state.eventId !== action.payload.eventId) {
        state.eventId = action.payload.eventId;
        state.eventSlug = action.payload.eventSlug;
        state.items = [];
      }
    },
    setQuantity(
      state,
      action: PayloadAction<{ ticketTypeId: string; name: string; price: number; quantity: number }>
    ) {
      const { ticketTypeId, name, price, quantity } = action.payload;
      const existing = state.items.find((i) => i.ticketTypeId === ticketTypeId);
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.ticketTypeId !== ticketTypeId);
        return;
      }
      if (existing) {
        existing.quantity = quantity;
      } else {
        state.items.push({ ticketTypeId, name, price, quantity });
      }
    },
    clearSelection() {
      return initialState;
    },
  },
});

export const { startSelection, setQuantity, clearSelection } = ticketSelectionSlice.actions;
export default ticketSelectionSlice.reducer;
