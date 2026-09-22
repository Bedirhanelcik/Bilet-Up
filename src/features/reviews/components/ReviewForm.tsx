"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createReviewSchema, type ReviewValues } from "@/features/reviews/schemas";
import { useSubmitReviewMutation } from "@/features/reviews/reviewsApi";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { Review } from "@/types/review";

export function ReviewForm({
  eventId,
  slug,
  uid,
  userDisplayName,
  userPhotoURL,
  existingReview,
  onDone,
}: {
  eventId: string;
  slug: string;
  uid: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  existingReview: Review | null;
  onDone?: () => void;
}) {
  const { t } = useTranslation();
  const [submitReview, { isLoading }] = useSubmitReviewMutation();
  const reviewSchema = useMemo(() => createReviewSchema(t), [t]);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      text: existingReview?.text ?? "",
    },
  });

  async function onSubmit(values: ReviewValues) {
    try {
      await submitReview({ uid, eventId, slug, values, userDisplayName, userPhotoURL }).unwrap();
      toast.success(existingReview ? t("reviews.updateSuccess") : t("reviews.submitSuccess"));
      onDone?.();
    } catch {
      toast.error(t("reviews.submitError"));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label>{t("reviews.yourRating")}</Label>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;
                const filled = value <= field.value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={field.value === value}
                    aria-label={t("reviews.starAriaLabel", { count: value })}
                    onClick={() => field.onChange(value)}
                    className="p-0.5"
                  >
                    <Star className={cn("size-6", filled ? "fill-gold text-gold" : "text-muted-foreground")} />
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.rating && <p className="text-xs text-destructive">{errors.rating.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-text">{t("reviews.yourReview")}</Label>
        <Textarea
          id="review-text"
          rows={4}
          placeholder={t("reviews.reviewPlaceholder")}
          aria-invalid={!!errors.text}
          {...register("text")}
        />
        {errors.text && <p className="text-xs text-destructive">{errors.text.message}</p>}
      </div>

      <Button type="submit" size="sm" className="self-start" disabled={isLoading}>
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {existingReview ? t("reviews.updateReview") : t("reviews.submitReview")}
      </Button>
    </form>
  );
}
