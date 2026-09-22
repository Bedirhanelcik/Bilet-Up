import { z } from "zod";
import type { TranslateFn } from "@/lib/i18n/LocaleProvider";

export function createOrganizerProfileSchema(t: TranslateFn) {
  return z.object({
    name: z.string().min(2, t("organizerForm.organizerNameRequired")).max(60, t("profile.nameMax")),
    bio: z.string().max(280, t("profile.bioMax")).optional(),
    logoURL: z.string().url(t("profile.photoUrlInvalid")).or(z.literal("")),
  });
}
export type OrganizerProfileValues = z.infer<ReturnType<typeof createOrganizerProfileSchema>>;

// Plain z.number() (not z.coerce.number()) so the form's input type matches its output type —
// react-hook-form's `valueAsNumber: true` on each numeric <input> does the string->number coercion
// instead, which keeps zodResolver's generic types (and TicketTypeValues) simple `number`s.
export function createTicketTypeSchema(t: TranslateFn) {
  return z.object({
    name: z.string().min(1, t("organizerForm.ttNameRequired")).max(60, t("profile.nameMax")),
    price: z.number().min(0, t("organizerForm.ttPriceNegative")),
    quantityTotal: z.number().int(t("organizerForm.ttQuantityWhole")).min(1, t("organizerForm.ttQuantityMin1")),
  });
}
export type TicketTypeValues = z.infer<ReturnType<typeof createTicketTypeSchema>>;

function eventDetailsShape(t: TranslateFn) {
  return {
    title: z.string().min(3, t("organizerForm.titleRequired")).max(120, t("organizerForm.titleMax")),
    description: z.string().min(10, t("organizerForm.descRequired")).max(2000, t("organizerForm.descMax")),
    category: z.string().min(1, t("organizerForm.chooseCategory")),
    venue: z.string().min(1, t("organizerForm.venueRequired")).max(120, t("organizerForm.venueMax")),
    city: z.string().min(1, t("organizerForm.cityRequired")).max(60, t("organizerForm.cityMax")),
    address: z.string().min(1, t("organizerForm.addressRequired")).max(200, t("organizerForm.addressMax")),
    coverImageURL: z.string().url(t("profile.photoUrlInvalid")).or(z.literal("")),
    startAt: z.string().min(1, t("organizerForm.startRequired")),
    endAt: z.string().min(1, t("organizerForm.endRequired")),
  };
}

export function createEventDetailsSchema(t: TranslateFn) {
  return z
    .object(eventDetailsShape(t))
    .refine((v) => new Date(v.endAt).getTime() > new Date(v.startAt).getTime(), {
      message: t("organizerForm.endAfterStart"),
      path: ["endAt"],
    });
}
export type EventDetailsValues = z.infer<ReturnType<typeof createEventDetailsSchema>>;

export function createCreateEventSchema(t: TranslateFn) {
  return z
    .object({
      ...eventDetailsShape(t),
      ticketTypes: z.array(createTicketTypeSchema(t)).min(1, t("organizerForm.atLeastOneTicketType")),
    })
    .refine((v) => new Date(v.endAt).getTime() > new Date(v.startAt).getTime(), {
      message: t("organizerForm.endAfterStart"),
      path: ["endAt"],
    });
}
export type CreateEventValues = z.infer<ReturnType<typeof createCreateEventSchema>>;
