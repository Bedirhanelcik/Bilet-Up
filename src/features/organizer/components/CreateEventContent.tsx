"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { eventCoverImagePath } from "@/lib/firebase/storage";
import { CATEGORIES, categoryDisplayName } from "@/lib/mock/categories";
import { createCreateEventSchema, type CreateEventValues } from "@/features/organizer/schemas";
import { useCreateEventMutation } from "@/features/organizer/organizerApi";
import { useRequireOrganizer } from "@/features/organizer/useRequireOrganizer";
import { BecomeOrganizerForm } from "@/features/organizer/components/BecomeOrganizerForm";
import { newEventId } from "@/lib/firebase/organizerEvents";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export function CreateEventContent() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { user, organizerProfile, isChecking } = useRequireOrganizer();
  const [createEvent, { isLoading }] = useCreateEventMutation();
  // Generated once, at mount, via a lazy useState initializer — so the cover image can be
  // uploaded to its final Storage path before the event doc exists, and createEvent() then
  // writes to this same pre-chosen id. newEventId() is a pure local id generator (no network
  // I/O, no auth dependency), so it's safe to compute unconditionally as long as Firebase itself
  // is configured; the lazy initializer guarantees it never runs a second time, even across
  // re-renders, so no image already uploaded under this id is ever orphaned by a new one.
  const [draftEventId] = useState(() => (isFirebaseConfigured ? newEventId() : ""));

  const createEventSchema = useMemo(() => createCreateEventSchema(t), [t]);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      venue: "",
      city: "",
      address: "",
      coverImageURL: "",
      startAt: "",
      endAt: "",
      ticketTypes: [{ name: "General Admission", price: 0, quantityTotal: 100 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "ticketTypes" });

  if (isChecking || !user || !draftEventId) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!organizerProfile) {
    return <BecomeOrganizerForm uid={user.uid} defaultName={user.displayName ?? ""} />;
  }

  async function onSubmit(values: CreateEventValues) {
    try {
      const result = await createEvent({
        uid: user!.uid,
        organizerProfile: { name: organizerProfile!.name, logoURL: organizerProfile!.logoURL },
        input: {
          ...values,
          startAt: new Date(values.startAt).toISOString(),
          endAt: new Date(values.endAt).toISOString(),
        },
        eventId: draftEventId,
      }).unwrap();
      toast.success(t("organizerForm.eventCreatedDraft"));
      router.push(`/organizer/events/${result.eventId}`);
    } catch {
      toast.error(t("organizerForm.eventCreateError"));
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="font-heading text-2xl font-bold tracking-tight">{t("organizerForm.createEventTitle")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("organizerForm.createEventSubtitle")}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold">{t("organizerForm.tabDetails")}</h2>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">{t("organizerForm.title")}</Label>
            <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">{t("organizerForm.description")}</Label>
            <Textarea id="description" rows={4} aria-invalid={!!errors.description} {...register("description")} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">{t("organizerForm.category")}</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category" className="w-full" aria-invalid={!!errors.category}>
                    <SelectValue placeholder={t("organizerForm.chooseCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {categoryDisplayName(c.slug, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="venue">{t("eventDetail.venue")}</Label>
              <Input id="venue" aria-invalid={!!errors.venue} {...register("venue")} />
              {errors.venue && <p className="text-xs text-destructive">{errors.venue.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">{t("filters.location")}</Label>
              <Input id="city" aria-invalid={!!errors.city} {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">{t("eventDetail.address")}</Label>
            <Input id="address" aria-invalid={!!errors.address} {...register("address")} />
            {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("organizerForm.coverImage")}</Label>
            <Controller
              control={control}
              name="coverImageURL"
              render={({ field }) => (
                <ImageUploadField
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  storagePath={eventCoverImagePath(user!.uid, draftEventId)}
                  label={t("organizerForm.eventCoverImageAria")}
                />
              )}
            />
            {errors.coverImageURL && <p className="text-xs text-destructive">{errors.coverImageURL.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startAt">{t("organizerForm.starts")}</Label>
              <Input id="startAt" type="datetime-local" aria-invalid={!!errors.startAt} {...register("startAt")} />
              {errors.startAt && <p className="text-xs text-destructive">{errors.startAt.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endAt">{t("organizerForm.ends")}</Label>
              <Input id="endAt" type="datetime-local" aria-invalid={!!errors.endAt} {...register("endAt")} />
              {errors.endAt && <p className="text-xs text-destructive">{errors.endAt.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">{t("organizerForm.ticketTypes")}</h2>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => append({ name: "", price: 0, quantityTotal: 50 })}
            >
              <Plus className="size-3.5" />
              {t("organizerForm.addTicketType")}
            </Button>
          </div>

          {errors.ticketTypes?.root && <p className="text-xs text-destructive">{errors.ticketTypes.root.message}</p>}

          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-end">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Label htmlFor={`ticketTypes.${index}.name`}>{t("profile.name")}</Label>
                <Input id={`ticketTypes.${index}.name`} {...register(`ticketTypes.${index}.name`)} />
                {errors.ticketTypes?.[index]?.name && (
                  <p className="text-xs text-destructive">{errors.ticketTypes[index]?.name?.message}</p>
                )}
              </div>
              <div className="flex items-end gap-3">
                <div className="grid grid-cols-2 gap-3 sm:flex">
                  <div className="flex flex-col gap-1.5 sm:w-24">
                    <Label htmlFor={`ticketTypes.${index}.price`}>{t("organizerForm.price")}</Label>
                    <Input
                      id={`ticketTypes.${index}.price`}
                      type="number"
                      step="0.01"
                      {...register(`ticketTypes.${index}.price`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:w-24">
                    <Label htmlFor={`ticketTypes.${index}.quantityTotal`}>{t("organizerForm.quantity")}</Label>
                    <Input
                      id={`ticketTypes.${index}.quantityTotal`}
                      type="number"
                      {...register(`ticketTypes.${index}.quantityTotal`, { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  aria-label={t("organizerForm.removeTicketTypeAria")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {t("organizerForm.createEventTitle")}
        </Button>
      </form>
    </div>
  );
}
