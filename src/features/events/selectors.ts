import type { EventSummary } from "@/types/event";

export function selectFeaturedEvents(events: EventSummary[]): EventSummary[] {
  return events.filter((e) => e.featured);
}

export function selectTrendingEvents(events: EventSummary[]): EventSummary[] {
  return events.filter((e) => e.trending);
}


/** Completed events, most recently finished first — the "past events" homepage slice. */
export function selectPastEvents(events: EventSummary[], limit = 8): EventSummary[] {
  return events
    .filter((e) => e.status === "completed")
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
    .slice(0, limit);
}

/**
 * Rules-based, deterministic recommendations: events in one of the user's chosen interest
 * categories, soonest first. Interests are stored capitalized (see onboardingSlice's
 * INTEREST_CATEGORIES) while event categories are stored as lowercase slugs (see
 * lib/mock/categories.ts), so the match is case-insensitive.
 */
export function selectRecommendedEvents(
  events: EventSummary[],
  favoriteCategories: string[],
  limit = 8
): EventSummary[] {
  const wanted = new Set(favoriteCategories.map((c) => c.toLowerCase()));
  if (wanted.size === 0) return [];
  return events
    .filter((e) => (e.status === "published" || e.status === "live") && wanted.has(e.category.toLowerCase()))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, limit);
}

export function selectRelatedEvents(
  events: EventSummary[],
  current: { id: string; category: string },
  limit = 4
): EventSummary[] {
  return events.filter((e) => e.id !== current.id && e.category === current.category).slice(0, limit);
}

/** Other discoverable events at the same venue — the event detail page's "More at this venue"
 * sidebar list, soonest first. */
export function selectEventsByVenue(
  events: EventSummary[],
  current: { id: string; venue: string },
  limit = 6
): EventSummary[] {
  return events
    .filter((e) => e.id !== current.id && e.venue === current.venue)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, limit);
}

export interface DerivedOrganizer {
  name: string;
  logoURL: string;
  eventCount: number;
  avgRating: number;
  cities: string[];
  categories: string[];
}

/**
 * There is no `organizers` collection query backing this — every seeded/demo event shares one
 * real Firestore `organizerId` (see scripts/seed-events.mjs), so "organizer" identity in the UI
 * is the denormalized `organizerName` field on events, derived client-side from the same
 * discoverable-events result every other homepage/search feature already fetches. Grouping by
 * name (not id) is intentional, not a workaround to fix later.
 */
export function selectOrganizers(events: EventSummary[], limit = 12): DerivedOrganizer[] {
  const byName = new Map<string, EventSummary[]>();
  for (const e of events) {
    const list = byName.get(e.organizerName);
    if (list) list.push(e);
    else byName.set(e.organizerName, [e]);
  }
  return Array.from(byName.entries())
    .map(([name, evts]) => ({
      name,
      logoURL: evts[0].organizerLogoURL,
      eventCount: evts.length,
      avgRating: evts.reduce((sum, e) => sum + e.ratingAverage, 0) / evts.length,
      cities: Array.from(new Set(evts.map((e) => e.city))),
      categories: Array.from(new Set(evts.map((e) => e.category))),
    }))
    .sort((a, b) => b.eventCount - a.eventCount || b.avgRating - a.avgRating)
    .slice(0, limit);
}

export function selectEventsByOrganizerName(events: EventSummary[], organizerName: string): EventSummary[] {
  return events.filter((e) => e.organizerName === organizerName);
}

export interface CityRail {
  city: string;
  events: EventSummary[];
}

/**
 * The `limit` highest-volume cities among discoverable (non-completed) events, each with its
 * own upcoming events, soonest first — drives the homepage's per-city rails. A city only ever
 * appears here because real events exist there; nothing is a fixed/hardcoded list. `minEvents`
 * excludes a city entirely rather than rendering a rail too thin to feel like a real section.
 */
export function selectTopCityRails(
  events: EventSummary[],
  cityCount = 3,
  eventsPerCity = 8,
  minEvents = 1
): CityRail[] {
  const byCity = new Map<string, EventSummary[]>();
  for (const e of events) {
    if (e.status !== "published" && e.status !== "live") continue;
    const list = byCity.get(e.city);
    if (list) list.push(e);
    else byCity.set(e.city, [e]);
  }
  return Array.from(byCity.entries())
    .filter(([, evts]) => evts.length >= minEvents)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, cityCount)
    .map(([city, evts]) => ({
      city,
      events: [...evts]
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
        .slice(0, eventsPerCity),
    }));
}

/**
 * Discoverable (published/live) events in a single category, soonest first — drives the
 * homepage's per-category rails (Concerts, Theater, Comedy, ...). Unlike city rails this never
 * excludes a category for being thin; the seed dataset is sized so every listed category clears
 * a healthy minimum on its own (see scripts/seed-events.mjs).
 */
export function selectCategoryEvents(events: EventSummary[], category: string, limit = 10): EventSummary[] {
  return events
    .filter((e) => (e.status === "published" || e.status === "live") && e.category === category)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, limit);
}
