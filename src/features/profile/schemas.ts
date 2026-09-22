import { z } from "zod";
import type { TranslateFn } from "@/lib/i18n/LocaleProvider";

export function createEditProfileSchema(t: TranslateFn) {
  return z.object({
    displayName: z.string().min(2, t("auth.nameRequired")).max(60, t("profile.nameMax")),
    bio: z.string().max(280, t("profile.bioMax")).optional(),
    photoURL: z.string().url(t("profile.photoUrlInvalid")).or(z.literal("")).optional(),
  });
}

export type EditProfileValues = z.infer<ReturnType<typeof createEditProfileSchema>>;
