export interface Organizer {
  id: string;
  name: string;
  bio: string;
  logoURL: string;
  followerCount: number;
  eventCount: number;
  verified: boolean;
}

/**
 * The signed-in user's own organizer profile (`organizers/{uid}`), as read/written by the
 * Sprint 5 organizer dashboard. A user "becomes an organizer" by gaining this document, not by
 * editing `users/{uid}.role` — see firestore.rules' comment on the `users` match block.
 */
export interface OrganizerProfile {
  id: string; // == ownerUid
  name: string;
  bio: string;
  logoURL: string | null;
  followerCount: number;
  createdAt: string; // ISO
}
