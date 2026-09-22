export interface Review {
  id: string; // == `${userId}_${eventId}`
  eventId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  rating: number; // 1-5
  text: string;
  createdAt: string; // ISO
}
