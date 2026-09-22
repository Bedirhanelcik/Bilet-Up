import { z } from "zod";
import type { TranslateFn } from "@/lib/i18n/LocaleProvider";

export function createReviewSchema(t: TranslateFn) {
  return z.object({
    rating: z.number().int(t("reviews.ratingRequired")).min(1, t("reviews.ratingRequired")).max(5),
    text: z.string().min(10, t("reviews.textRequired")).max(1000, t("reviews.textMax")),
  });
}
export type ReviewValues = z.infer<ReturnType<typeof createReviewSchema>>;
