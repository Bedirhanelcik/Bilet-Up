"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useGetDiscoverableEventsQuery } from "@/features/events/eventsApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSelectedCity } from "@/redux/slices/citySlice";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const STORAGE_KEY = "biletup:selected-city";

/**
 * A compact navbar location selector — real cities derived from the same discoverable-events
 * query every other page already fetches (RTK Query dedupes it, no extra network call). Picking
 * a city both navigates to `/discover?location=<city>` (the exact filter FiltersBar/DiscoverContent
 * already read from the URL — see filterAndSortEvents) and updates the shared `city` Redux slice
 * so the homepage can lead with that city's rail. Persisted to localStorage so the choice
 * survives a reload; read once on mount, never inside the reducer itself.
 */
export function CitySelector() {
  const { t, intlTag } = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selectedCity = useAppSelector((s) => s.city.selectedCity);
  const [open, setOpen] = useState(false);
  const { data: events = [] } = useGetDiscoverableEventsQuery();

  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) {
      if (e.status === "completed") continue;
      counts.set(e.city, (counts.get(e.city) ?? 0) + 1);
    }
    return Array.from(counts.keys()).sort((a, b) => a.localeCompare(b, intlTag));
  }, [events, intlTag]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) dispatch(setSelectedCity(stored));
    } catch {
      // Best-effort convenience only.
    }
    // Restore once on mount only — later changes flow the other way (selection -> storage).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectCity(city: string | null) {
    dispatch(setSelectedCity(city));
    try {
      if (city) localStorage.setItem(STORAGE_KEY, city);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Best-effort convenience only.
    }
    setOpen(false);
    router.push(city ? `/discover?location=${encodeURIComponent(city)}` : "/discover");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          />
        }
      >
        <MapPin className="size-4 text-primary" />
        <span className="max-w-24 truncate">{selectedCity ?? t("common.selectCity")}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-80 w-56 overflow-y-auto p-1.5">
        <button
          type="button"
          onClick={() => selectCity(null)}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-start text-sm hover:bg-accent",
            !selectedCity && "font-medium text-primary"
          )}
        >
          {t("filters.allCities")}
          {!selectedCity && <Check className="size-3.5" />}
        </button>
        {cities.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => selectCity(city)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-start text-sm hover:bg-accent",
              selectedCity === city && "font-medium text-primary"
            )}
          >
            {city}
            {selectedCity === city && <Check className="size-3.5" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

