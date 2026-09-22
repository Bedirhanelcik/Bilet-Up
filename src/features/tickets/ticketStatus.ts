import { getEventTemporalState } from "@/lib/eventTiming";
import type { TranslateFn } from "@/lib/i18n/LocaleProvider";
import type { Ticket, TicketStatus } from "@/types/ticket";

export type TicketEligibility = "eligible" | "not-started" | "event-ended" | "already-used" | "void";

/**
 * The event-day validation foundation for Sprint 4: whether a ticket could be used for
 * entry right now. There is no organizer check-in scanner yet (that's a separate,
 * larger flow for a later sprint) — this only computes and displays the state.
 */
export function getTicketEligibility(ticket: Ticket, now: Date = new Date()): TicketEligibility {
  if (ticket.status === "void") return "void";
  if (ticket.status === "used") return "already-used";

  const temporalState = getEventTemporalState(ticket.eventStartAt, ticket.eventEndAt, now);
  if (temporalState === "completed") return "event-ended";
  if (temporalState === "upcoming") return "not-started";
  return "eligible";
}

const TICKET_ELIGIBILITY_KEY: Record<TicketEligibility, string> = {
  eligible: "tickets.eligibleForEntry",
  "not-started": "tickets.entryOpensOnEventDay",
  "event-ended": "tickets.eventHasEnded",
  "already-used": "tickets.alreadyCheckedIn",
  void: "tickets.voided",
};

export function ticketEligibilityLabel(eligibility: TicketEligibility, t: TranslateFn): string {
  return t(TICKET_ELIGIBILITY_KEY[eligibility]);
}

const TICKET_STATUS_KEY: Record<TicketStatus, string> = {
  valid: "tickets.purchased",
  used: "tickets.checkedIn",
  void: "tickets.voided",
};

export function ticketStatusLabel(status: TicketStatus, t: TranslateFn): string {
  return t(TICKET_STATUS_KEY[status]);
}
