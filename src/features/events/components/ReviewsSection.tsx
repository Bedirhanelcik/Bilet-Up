"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/redux/hooks";
import { useGetReviewsForEventQuery } from "@/features/reviews/reviewsApi";
import { useReviewEligibility } from "@/features/reviews/useReviewEligibility";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { formatShortDate } from "@/lib/format";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export function ReviewsSection({
  eventId,
  slug,
  startAt,
  endAt,
  ratingAverage,
  ratingCount,
}: {
  eventId: string;
  slug: string;
  startAt: string;
  endAt: string;
  ratingAverage: number;
  ratingCount: number;
}) {
  const { t, locale } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const { data: reviews = [], isLoading } = useGetReviewsForEventQuery(eventId);
  const { status, myReview } = useReviewEligibility(eventId, startAt, endAt);
  const [isEditing, setIsEditing] = useState(false);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const showForm = status === "can-create" || (status === "can-edit" && isEditing);

  return (
    <section>
      <h2 className="font-heading text-xl font-semibold">{t("reviews.title")}</h2>
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-1 sm:w-40">
          <div className="font-heading text-4xl font-bold">{ratingAverage.toFixed(1)}</div>
          <div className="flex gap-0.5 text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={i < Math.round(ratingAverage) ? "size-4 fill-gold" : "size-4 text-muted-foreground"}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground">{t("reviews.ratingsCount", { count: ratingCount })}</div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          {distribution.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-8 shrink-0">
                {star} {t("reviews.starUnit")}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-end">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {status === "loading" && <Skeleton className="h-24 w-full rounded-2xl" />}

        {status === "signed-out" && <p className="text-sm text-muted-foreground">{t("reviews.signInPrompt")}</p>}

        {status === "event-not-completed" && (
          <p className="text-sm text-muted-foreground">{t("reviews.notCompletedPrompt")}</p>
        )}

        {status === "no-ticket" && <p className="text-sm text-muted-foreground">{t("reviews.noTicketPrompt")}</p>}

        {status === "can-edit" && !isEditing && myReview && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{t("reviews.alreadyReviewed")}</p>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              {t("reviews.editYourReview")}
            </Button>
          </div>
        )}

        {showForm && user && (
          <ReviewForm
            eventId={eventId}
            slug={slug}
            uid={user.uid}
            userDisplayName={user.displayName ?? t("reviews.anonymous")}
            userPhotoURL={user.photoURL}
            existingReview={myReview}
            onDone={() => setIsEditing(false)}
          />
        )}
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {isLoading && (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        )}

        {!isLoading && reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("reviews.noReviewsYet")}</p>
        )}

        {reviews.map((review) => (
          <div key={review.id} className="flex gap-3">
            <Avatar size="lg" className="shrink-0">
              <AvatarImage src={review.userPhotoURL ?? undefined} alt="" />
              <AvatarFallback>{review.userDisplayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{review.userDisplayName}</span>
                <span className="text-xs text-muted-foreground">{formatShortDate(review.createdAt, locale)}</span>
              </div>
              <div className="mt-0.5 flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={i < review.rating ? "size-3 fill-gold" : "size-3 text-muted-foreground"} />
                ))}
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{review.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
