import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "attendee" | "organizer";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  /** Firebase's onAuthStateChanged hasn't reported back yet. */
  status: "loading" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
  user: null,
  status: "loading",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "unauthenticated";
    },
    setUserRole(state, action: PayloadAction<UserRole>) {
      if (state.user) state.user.role = action.payload;
    },
  },
});

export const { setAuthUser, setUserRole } = authSlice.actions;
export default authSlice.reducer;
