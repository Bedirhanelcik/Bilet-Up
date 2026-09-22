"use client";

import Link from "next/link";
import { AlertCircle, CalendarDays, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { CoverImage } from "@/components/shared/CoverImage";
import { EventRail } from "@/components/home/EventRail";
import { useGetDiscoverableEventsQuery } from "@/features/events/eventsApi";
import { selectEventsByOrganizerName, selectOrganizers } from "@/features/events/selectors";
import { categoryDisplayName } from "@/lib/mock/categories";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export function OrganizerProfileContent({ name }: { name: string }) {
  const { t, locale } = useTranslation();
  const { data: events = [], isLoading } = useGetDiscoverableEventsQuery();
  const organizerEvents = selectEventsByOrganizerName(events, name);
  const organizer = selectOrganizers(organizerEvents, 1)[0];
  const upcoming = organizerEvents.filter((e) => e.status === "published" || e.status === "live");
  const past = organizerEvents.filter((e) => e.status === "completed");
  // Reuses the same real event photography for the header backdrop rather than a stock banner —
  // the organizer's own soonest upcoming poster (or, once nothing's upcoming, whatever event they
  // have) is already a picture that actually represents them.
  const coverImage = (upcoming[0] ?? organizerEvents[0])?.coverImageURL;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="mt-10 flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-56 shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="size-6" />
        </span>
        <h1 className="font-heading text-lg font-semibold">{t("organizerProfile.notFoundTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("organizerProfile.notFoundDesc")}</p>
        <Link href="/organizers" className={buttonVariants({ variant: "outline" })}>
          {t("organizerProfile.browseOrganizers")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="relative mt-6 h-40 w-full overflow-hidden rounded-3xl border border-border sm:h-56">
        {coverImage ? (
          <>
            <CoverImage src={coverImage} alt="" sizes="100vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />
          </>
        ) : (
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent" />
        )}
      </div>

      <div className="relative -mt-10 flex flex-wrap items-end gap-5 px-2 sm:-mt-12">
        <Avatar size="lg" className="size-20 border-4 border-background shadow-md sm:size-24">
          <AvatarImage src={organizer.logoURL || undefined} alt="" />
          <AvatarFallback className="text-xl">{organizer.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="pb-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{organizer.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-gold text-gold" />
              {organizer.avgRating.toFixed(1)} {t("organizerProfile.avgRating")}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {t("sections.eventCount", { count: organizer.eventCount })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {organizer.cities.join(", ")}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 px-2">
        {organizer.categories.map((c) => (
          <Badge key={c} variant="secondary">
            {categoryDisplayName(c, locale)}
          </Badge>
        ))}
      </div>

      {upcoming.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-xl font-semibold">{t("organizerProfile.upcomingEvents")}</h2>
          <div className="mt-4">
            <EventRail events={upcoming} />
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-xl font-semibold">{t("organizerProfile.pastEvents")}</h2>
          <div className="mt-4">
            <EventRail events={past} />
          </div>
        </section>
      )}
    </div>
  );
}
