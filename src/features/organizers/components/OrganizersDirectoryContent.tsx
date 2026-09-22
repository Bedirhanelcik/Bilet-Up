"use client";

import Link from "next/link";
import { CalendarDays, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDiscoverableEventsQuery } from "@/features/events/eventsApi";
import { selectOrganizers } from "@/features/events/selectors";
import { categoryDisplayName } from "@/lib/mock/categories";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export function OrganizersDirectoryContent() {
  const { t, locale } = useTranslation();
  const { data: events = [], isLoading } = useGetDiscoverableEventsQuery();
  const organizers = selectOrganizers(events, 100);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{t("organizerProfile.directoryTitle")}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{t("organizerProfile.directorySubtitle")}</p>
      </div>

      {isLoading ? (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : organizers.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <p>{t("organizerProfile.noOrganizersYet")}</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {organizers.map((organizer) => (
            <Link
              key={organizer.name}
              href={`/organizers/${encodeURIComponent(organizer.name)}`}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarImage src={organizer.logoURL || undefined} alt="" />
                  <AvatarFallback>{organizer.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate font-heading font-semibold">{organizer.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3 fill-gold text-gold" />
                    {organizer.avgRating.toFixed(1)} {t("organizerProfile.avgRating")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5 shrink-0" />
                {t("sections.eventCount", { count: organizer.eventCount })} · {organizer.cities.join(", ")}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {organizer.categories.slice(0, 3).map((c) => (
                  <Badge key={c} variant="secondary">
                    {categoryDisplayName(c, locale)}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
