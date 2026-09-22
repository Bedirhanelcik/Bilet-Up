export type EventTemporalState = "upcoming" | "live" | "completed";

/**
 * Derives an event's real-time state from its schedule rather than its stored `status`
 * field — `status` is organizer/seed-controlled (e.g. an event can sit in "published"
 * indefinitely) and isn't guaranteed to flip to "live"/"completed" exactly on schedule.
 * Ticket eligibility checks against this, not against `status`.
 */
export function getEventTemporalState(
  startAt: string,
  endAt: string,
  now: Date = new Date()
): EventTemporalState {
  const t = now.getTime();
  if (t < new Date(startAt).getTime()) return "upcoming";
  if (t > new Date(endAt).getTime()) return "completed";
  return "live";
}
