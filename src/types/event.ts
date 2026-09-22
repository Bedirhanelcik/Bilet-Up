export type EventStatus = "draft" | "published" | "live" | "completed" | "cancelled";

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantityTotal: number;
  quantityRemaining: number;
  description?: string;
}

export interface EventScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface EventFaqItem {
  question: string;
  answer: string;
}

export interface EventSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: EventStatus;
  coverImageURL: string;
  venue: string;
  city: string;
  startAt: string; // ISO
  endAt: string; // ISO
  priceMin: number;
  priceMax: number;
  organizerId: string;
  organizerName: string;
  organizerLogoURL: string;
  ratingAverage: number;
  ratingCount: number;
  favoriteCount: number;
  attendeeCount: number;
  featured: boolean;
  trending: boolean;
}

export interface EventDetail extends EventSummary {
  description: string;
  address: string;
  lineup?: { name: string; role: string; imageURL: string }[];
  schedule?: EventScheduleItem[];
  faq?: EventFaqItem[];
  ticketTypes: TicketType[];
  capacityTotal: number;
  capacityRemaining: number;
  exclusiveContent?: { videoURL: string | null; announcement: string | null } | null;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  /** A real, category-matched photo for visual category cards (not an emoji/icon tile). */
  image: string;
}

/**
 * An organizer's own event as shown on their dashboard/event-list — every status (including
 * "draft"/"cancelled", which the public discovery queries never return) plus the capacity
 * numbers needed for the management table.
 */
export interface OrganizerEventSummary extends EventSummary {
  capacityTotal: number;
  capacityRemaining: number;
  createdAt: string; // ISO
}
