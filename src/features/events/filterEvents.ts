import type { EventFilters } from "@/redux/slices/filtersSlice";
import type { EventSummary } from "@/types/event";

export function filterAndSortEvents(events: EventSummary[], filters: EventFilters): EventSummary[] {
  const query = filters.query.trim().toLowerCase();

  let result = events.filter((event) => {
    if (filters.timeframe === "upcoming" && event.status !== "published" && event.status !== "live") return false;
    if (filters.timeframe === "past" && event.status !== "completed") return false;
    if (query) {
      const haystack = `${event.title} ${event.organizerName} ${event.venue}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.category && event.category !== filters.category) return false;
    if (filters.location && event.city !== filters.location) return false;
    if (filters.dateFrom && new Date(event.startAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(event.startAt) > new Date(filters.dateTo)) return false;
    if (filters.priceMin != null && event.priceMax < filters.priceMin) return false;
    if (filters.priceMax != null && event.priceMin > filters.priceMax) return false;
    return true;
  });

  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case "date-desc":
        return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
      case "price-asc":
        return a.priceMin - b.priceMin;
      case "price-desc":
        return b.priceMax - a.priceMax;
      case "popularity":
        return b.favoriteCount - a.favoriteCount;
      case "date-asc":
      default:
        return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    }
  });

  return result;
}
