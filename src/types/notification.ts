export type NotificationType =
  | "event-reminder"
  | "ticket-purchased"
  | "new-event-from-followed"
  | "event-updated"
  | "favorite-added";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  eventId: string | null;
  read: boolean;
  createdAt: string; // ISO
}
