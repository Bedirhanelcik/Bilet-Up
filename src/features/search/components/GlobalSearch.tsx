"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { CalendarDays, Clock, MapPin, Search, Star, Ticket } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, categoryDisplayName } from "@/lib/mock/categories";
import { formatPriceRange, formatShortDate } from "@/lib/format";
import { useGetDiscoverableEventsQuery } from "@/features/events/eventsApi";
import { selectOrganizers } from "@/features/events/selectors";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const RECENT_SEARCHES_KEY = "biletup:recent-searches";
const MAX_RECENT = 5;
const MAX_RESULTS_PER_GROUP = 5;

function readRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeRecentSearch(term: string) {
  try {
    const existing = readRecentSearches().filter((t) => t.toLowerCase() !== term.toLowerCase());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([term, ...existing].slice(0, MAX_RECENT)));
  } catch {
    // Best-effort convenience only — a full/blocked localStorage just means no recent list.
  }
}

/**
 * A global, keyboard-first search over events, organizers, categories, and cities — all derived
 * from the same `useGetDiscoverableEventsQuery()` result every other page already fetches (RTK
 * Query dedupes the request), so opening the palette never triggers a second network call.
 */
export function GlobalSearch({ iconOnly = false }: { iconOnly?: boolean }) {
  const { t, locale, intlTag } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const { data: events = [], isLoading } = useGetDiscoverableEventsQuery();
  const organizers = useMemo(() => selectOrganizers(events, 50), [events]);
  // Read once per open/close toggle (not on every keystroke) — a plain render-time computation,
  // not a store subscription, so there's no need for an effect here.
  const recent = useMemo(() => (open ? readRecentSearches() : []), [open]);

  // Global shortcut: Cmd+K (Mac) / Ctrl+K (Windows/Linux). Also opens on a bare "/" when focus
  // isn't already inside a text field, matching the convention most search-first products use.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isTypingTarget =
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !isTypingTarget) {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced so fast typing doesn't recompute five filtered lists on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setQuery(rawQuery), 150);
    return () => clearTimeout(timeout);
  }, [rawQuery]);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return { events: [], organizers: [], categories: [], cities: [] };
    const matchedEvents = events
      .filter((e) => `${e.title} ${e.venue} ${e.city}`.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS_PER_GROUP);
    const matchedOrganizers = organizers.filter((o) => o.name.toLowerCase().includes(q)).slice(0, MAX_RESULTS_PER_GROUP);
    const matchedCategories = CATEGORIES.filter((c) => categoryDisplayName(c.slug, locale).toLowerCase().includes(q)).slice(0, MAX_RESULTS_PER_GROUP);
    const allCities = Array.from(new Set(events.map((e) => e.city)));
    const matchedCities = allCities.filter((c) => c.toLowerCase().includes(q)).slice(0, MAX_RESULTS_PER_GROUP);
    return { events: matchedEvents, organizers: matchedOrganizers, categories: matchedCategories, cities: matchedCities };
  }, [q, events, organizers, locale]);

  const hasAnyResults =
    results.events.length > 0 || results.organizers.length > 0 || results.categories.length > 0 || results.cities.length > 0;

  function go(path: string, recordTerm?: string) {
    if (recordTerm && recordTerm.trim()) writeRecentSearch(recordTerm.trim());
    setOpen(false);
    setRawQuery("");
    setQuery("");
    router.push(path);
  }

  return (
    <>
      {iconOnly ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          aria-label={t("search.openSearch")}
        >
          <Search className="size-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-full items-center gap-2.5 rounded-full border border-border bg-muted/50 px-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
          aria-label={t("search.openSearch")}
        >
          <Search className="size-4 shrink-0" />
          <span className="flex-1 truncate text-start">{t("search.button")}</span>
          <kbd className="hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:inline">
            ⌘K
          </kbd>
        </button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t("search.dialogTitle")}
        description={t("search.dialogDesc")}
        className="sm:max-w-xl"
      >
        <Command shouldFilter={false}>
        <CommandInput
          value={rawQuery}
          onValueChange={setRawQuery}
          placeholder={t("search.inputPlaceholder")}
          aria-label={t("search.inputLabel")}
        />
        <CommandList>
          {isLoading ? (
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : !q ? (
            recent.length > 0 ? (
              <CommandGroup heading={t("search.recentSearches")}>
                {recent.map((term) => (
                  <CommandItem key={term} onSelect={() => setRawQuery(term)}>
                    <Clock className="size-4 text-muted-foreground" />
                    {term}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty>{t("search.startTyping")}</CommandEmpty>
            )
          ) : !hasAnyResults ? (
            <CommandEmpty>{t("search.noResultsFor", { query })}</CommandEmpty>
          ) : (
            <>
              {results.events.length > 0 && (
                <CommandGroup heading={t("search.events")}>
                  {results.events.map((event) => (
                    <CommandItem
                      key={event.id}
                      onSelect={() => go(`/events/${event.slug}`, query)}
                      className="items-start"
                    >
                      <Ticket className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">{event.title}</span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="size-3 shrink-0" />
                          {formatShortDate(event.startAt, locale)}
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">{event.city}</span>
                        </span>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        {formatPriceRange(event.priceMin, event.priceMax, locale)}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.organizers.length > 0 && (
                <CommandGroup heading={t("search.organizers")}>
                  {results.organizers.map((organizer) => (
                    <CommandItem
                      key={organizer.name}
                      onSelect={() => go(`/organizers/${encodeURIComponent(organizer.name)}`, query)}
                    >
                      <Avatar size="sm">
                        <AvatarImage src={organizer.logoURL || undefined} alt="" />
                        <AvatarFallback>{organizer.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate">{organizer.name}</span>
                      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <Star className="size-3 fill-gold text-gold" />
                        {organizer.avgRating.toLocaleString(intlTag, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.categories.length > 0 && (
                <CommandGroup heading={t("search.categories")}>
                  {results.categories.map((category) => {
                    const Icon = (Icons[category.icon as keyof typeof Icons] ?? Icons.Ticket) as Icons.LucideIcon;
                    return (
                      <CommandItem
                        key={category.slug}
                        onSelect={() => go(`/discover?category=${category.slug}`, query)}
                      >
                        <Icon className="size-4 text-muted-foreground" />
                        {categoryDisplayName(category.slug, locale)}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {results.cities.length > 0 && (
                <CommandGroup heading={t("search.cities")}>
                  {results.cities.map((city) => (
                    <CommandItem key={city} onSelect={() => go(`/discover?location=${encodeURIComponent(city)}`, query)}>
                      <MapPin className="size-4 text-muted-foreground" />
                      {city}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}

          {q && hasAnyResults && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={() => go(`/discover?q=${encodeURIComponent(query)}`, query)}>
                  <Search className="size-4 text-muted-foreground" />
                  {t("search.searchOnDiscover", { query })}
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
