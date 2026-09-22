export type OrderStatus = "completed" | "refunded";

export interface OrderItem {
  ticketTypeId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string; // ISO
}

export type TicketStatus = "valid" | "used" | "void";

export interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  userId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  status: TicketStatus;
  usedAt: string | null; // ISO
  usedByOrganizerUid: string | null;
  purchasedAt: string; // ISO
  // Denormalized at purchase time so "My tickets" and the ticket detail page never need
  // an extra event read, and a ticket keeps showing what was actually bought even if the
  // event is later edited, unpublished, or cancelled (see docs/data-model.md).
  eventTitle: string;
  eventSlug: string;
  eventCoverImageURL: string;
  eventVenue: string;
  eventCity: string;
  eventStartAt: string; // ISO
  eventEndAt: string; // ISO
}

/**
 * A ticket as shown in an organizer's attendee list for one of their events — the same
 * `tickets/{ticketId}` document, decorated with the buyer's public display name/email
 * (looked up separately; `tickets` docs only store `userId`) for search/display.
 */
export interface AttendeeTicket {
  id: string;
  userId: string;
  buyerDisplayName: string | null;
  buyerEmail: string | null;
  ticketTypeId: string;
  ticketTypeName: string;
  status: TicketStatus;
  purchasedAt: string; // ISO
  usedAt: string | null; // ISO
}
