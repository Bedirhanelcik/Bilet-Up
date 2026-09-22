import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FirebaseError } from "firebase/app";

export interface ApiError {
  code: string;
  message: string;
}

export function toApiError(error: unknown): ApiError {
  const firebaseError = error as Partial<FirebaseError>;
  if (firebaseError?.code) {
    return { code: firebaseError.code, message: firebaseError.message ?? "Request failed." };
  }
  return { code: "unknown", message: error instanceof Error ? error.message : "Request failed." };
}

/**
 * Firestore is accessed through the client SDK, not HTTP, so there is no URL for
 * RTK Query to fetch. Each injected endpoint uses `queryFn`/`onCacheEntryAdded` to
 * call the Firestore SDK directly (including onSnapshot for realtime data) while
 * still getting RTK Query's caching, invalidation and loading/error states.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: [
    "Event",
    "Organizer",
    "TicketType",
    "Order",
    "Ticket",
    "Review",
    "Notification",
    "Favorite",
    "Follow",
    "UserProfile",
  ],
  endpoints: () => ({}),
});
