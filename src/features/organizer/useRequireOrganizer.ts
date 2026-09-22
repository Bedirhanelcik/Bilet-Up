"use client";

import { useRequireAuth } from "@/features/auth/useRequireAuth";
import { useGetMyOrganizerProfileQuery } from "@/features/organizer/organizerApi";

/**
 * Gates the organizer dashboard: requires sign-in (via useRequireAuth), then loads the caller's
 * own `organizers/{uid}` profile. `organizerProfile === null` (once loaded) means this user
 * hasn't created one yet — the dashboard shows a "become an organizer" prompt in that case
 * rather than redirecting, since anyone signed in is allowed to create one.
 *
 * This is a UX convenience only, not the security boundary — every organizer write is
 * independently scoped and enforced by firestore.rules regardless of what this hook returns.
 */
export function useRequireOrganizer() {
  const { user, isChecking: isCheckingAuth } = useRequireAuth();
  const {
    data: organizerProfile,
    isLoading: isLoadingProfile,
    isError,
  } = useGetMyOrganizerProfileQuery(user?.uid ?? "", { skip: !user });

  return {
    user,
    organizerProfile: organizerProfile ?? null,
    isChecking: isCheckingAuth || (!!user && isLoadingProfile),
    isError,
  };
}
