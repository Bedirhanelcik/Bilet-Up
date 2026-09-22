"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Heart, MapPin } from "lucide-react";
import type { MouseEvent } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CoverImage } from "@/components/shared/CoverImage";
import { cn } from "@/lib/utils";
import { formatPriceFrom, formatShortDate } from "@/lib/format";
import { categoryDisplayName } from "@/lib/mock/categories";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAppSelector } from "@/redux/hooks";
import { useGetFavoriteEventIdsQuery, useToggleFavoriteMutation } from "@/features/favorites/favoritesApi";
import type { EventSummary } from "@/types/event";

/**
 * A poster-style card — image-first and cinematic, with only the metadata that actually matters
 * (title, date, city/venue, price, status, favorite) overlaid directly on the photo rather than
 * in a separate panel underneath it. Organizer/rating live on the event detail page, not here.
 */
export function EventCard({ event }: { event: EventSummary }) {
  const { t, locale } = useLocale();
  const user = useAppSelector((s) => s.auth.user);
  const { data: favoriteIds = [] } = useGetFavoriteEventIdsQuery(user?.uid ?? "", { skip: !user });
  const [toggleFavorite, { isLoading: isToggling }] = useToggleFavoriteMutation();
  const isFavorited = favoriteIds.includes(event.id);
  const isPast = event.status === "completed";

  function handleToggleFavorite(e: MouseEvent) {
    e.preventDefault();
    if (!user) {
      toast.error(t("common.signInToFavorite"));
      return;
    }
    if (isToggling) return;
    toggleFavorite({ uid: user.uid, eventId: event.id, eventTitle: event.title, favorited: !isFavorited });
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative isolate flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border border-border/60 shadow-sm transition-shadow hover:shadow-xl hover:shadow-black/20"
    >
      <Link href={`/events/${event.slug}`} className="contents">
        <div className="absolute inset-0 cursor-pointer">
          <CoverImage
            src={event.coverImageURL}
            alt={event.title}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-105",
              isPast && "grayscale-[0.35] brightness-90"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/40" />
        </div>

        <div className="relative flex items-start justify-between p-3">
          <Badge variant="secondary" className="w-fit gap-1 bg-white/15 text-white backdrop-blur-sm">
            {categoryDisplayName(event.category, locale)}
          </Badge>
          {event.status === "live" && <Badge className="gap-1 bg-destructive text-white">{t("eventCard.live")}</Badge>}
          {isPast && (
            <Badge variant="secondary" className="gap-1 bg-white/15 text-white backdrop-blur-sm">
              <CheckCircle2 className="size-3.5" />
              {t("eventCard.completed")}
            </Badge>
          )}
        </div>

        <div className="relative mt-auto flex flex-col gap-1.5 p-4 text-white">
          <span className="text-xs font-medium text-white/75">{formatShortDate(event.startAt, locale)}</span>
          <h3 className="line-clamp-2 font-heading text-lg font-semibold leading-snug">{event.title}</h3>
          <div className="flex items-center gap-1.5 text-sm text-white/80">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {event.venue} · {event.city}
            </span>
          </div>
          <span className="mt-1 text-base font-bold text-gold">
            {formatPriceFrom(event.priceMin, event.priceMax, locale)}
          </span>
        </div>
      </Link>

      <button
        type="button"
        aria-label={isFavorited ? t("eventCard.favoriteRemove") : t("eventCard.favoriteAdd")}
        aria-pressed={isFavorited}
        onClick={handleToggleFavorite}
        className="absolute end-3 top-12 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-white"
      >
        <Heart className={cn("size-4", isFavorited && "fill-destructive text-destructive")} />
      </button>
    </motion.div>
  );
}
