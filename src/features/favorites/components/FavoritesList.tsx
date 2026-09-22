"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/features/events/components/EventCard";
import { EventCardSkeleton } from "@/features/events/components/EventCardSkeleton";
import { useGetDiscoverableEventsQuery } from "@/features/events/eventsApi";
import { useGetFavoriteEventIdsQuery } from "@/features/favorites/favoritesApi";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export function FavoritesList({ uid }: { uid: string }) {
  const { t } = useTranslation();
  const {
    data: favoriteIds = [],
    isLoading: isLoadingFavorites,
    isError: isFavoritesError,
    refetch: refetchFavorites,
  } = useGetFavoriteEventIdsQuery(uid);
  const {
    data: events = [],
    isLoading: isLoadingEvents,
    isError: isEventsError,
    refetch: refetchEvents,
  } = useGetDiscoverableEventsQuery();

  if (isLoadingFavorites || isLoadingEvents) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <EventCardSkeleton />
        <EventCardSkeleton />
      </div>
    );
  }

  if (isFavoritesError || isEventsError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card py-10 text-center">
        <p className="text-sm text-muted-foreground">{t("favorites.loadError")}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchFavorites();
            refetchEvents();
          }}
        >
          {t("common.tryAgain")}
        </Button>
      </div>
    );
  }

  const favorites = events.filter((e) => favoriteIds.includes(e.id));

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-10 text-center">
        <Heart className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("favorites.empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {favorites.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
