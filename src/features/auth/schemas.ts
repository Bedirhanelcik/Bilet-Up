import { z } from "zod";
import type { TranslateFn } from "@/lib/i18n/LocaleProvider";

export function createLoginSchema(t: TranslateFn) {
  return z.object({
    email: z.string().min(1, t("auth.emailRequired")).email(t("auth.emailInvalid")),
    password: z.string().min(1, t("auth.passwordRequired")),
  });
}

export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;

export function createRegisterSchema(t: TranslateFn) {
  return z.object({
    displayName: z.string().min(2, t("auth.nameRequired")),
    email: z.string().min(1, t("auth.emailRequired")).email(t("auth.emailInvalid")),
    password: z.string().min(6, t("auth.passwordMin")),
  });
}

export type RegisterValues = z.infer<ReturnType<typeof createRegisterSchema>>;
