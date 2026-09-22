"use client";

import { Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { useAppSelector } from "@/redux/hooks";
import { useGetFavoriteEventIdsQuery, useToggleFavoriteMutation } from "@/features/favorites/favoritesApi";

export function EventActions({ eventId, title }: { eventId: string; title: string }) {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const { data: favoriteIds = [] } = useGetFavoriteEventIdsQuery(user?.uid ?? "", { skip: !user });
  const [toggleFavorite, { isLoading: isToggling }] = useToggleFavoriteMutation();
  const isFavorited = favoriteIds.includes(eventId);

  function handleToggleFavorite() {
    if (!user) {
      toast.error(t("common.signInToFavorite"));
      return;
    }
    if (isToggling) return;
    toggleFavorite({ uid: user.uid, eventId, eventTitle: title, favorited: !isFavorited });
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled the share sheet — nothing to do
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success(t("eventDetail.linkCopied"));
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        aria-pressed={isFavorited}
        onClick={handleToggleFavorite}
      >
        <Heart className={cn("size-4", isFavorited && "fill-destructive text-destructive")} />
        {isFavorited ? t("eventDetail.favorited") : t("eventDetail.favorite")}
      </Button>
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="size-4" />
        {t("eventDetail.share")}
      </Button>
    </div>
  );
}
