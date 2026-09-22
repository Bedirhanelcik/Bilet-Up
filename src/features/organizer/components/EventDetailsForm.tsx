"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { eventCoverImagePath } from "@/lib/firebase/storage";
import { CATEGORIES, categoryDisplayName } from "@/lib/mock/categories";
import { createEventDetailsSchema, type EventDetailsValues } from "@/features/organizer/schemas";
import { useUpdateEventDetailsMutation } from "@/features/organizer/organizerApi";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { EventDetail } from "@/types/event";

/** ISO string -> the local-time value a `datetime-local` input expects ("YYYY-MM-DDTHH:mm"). */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventDetailsForm({ event, organizerUid }: { event: EventDetail; organizerUid: string }) {
  const { t, locale } = useTranslation();
  const [updateEventDetails, { isLoading }] = useUpdateEventDetailsMutation();
  const eventDetailsSchema = useMemo(() => createEventDetailsSchema(t), [t]);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventDetailsValues>({
    resolver: zodResolver(eventDetailsSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      category: event.category,
      venue: event.venue,
      city: event.city,
      address: event.address,
      coverImageURL: event.coverImageURL ?? "",
      startAt: toDatetimeLocal(event.startAt),
      endAt: toDatetimeLocal(event.endAt),
    },
  });

  async function onSubmit(values: EventDetailsValues) {
    try {
      await updateEventDetails({
        eventId: event.id,
        organizerUid,
        slug: event.slug,
        input: {
          ...values,
          startAt: new Date(values.startAt).toISOString(),
          endAt: new Date(values.endAt).toISOString(),
        },
      }).unwrap();
      toast.success(t("organizerForm.eventUpdated"));
    } catch {
      toast.error(t("organizerForm.eventUpdateError"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-title">{t("organizerForm.title")}</Label>
        <Input id="edit-title" aria-invalid={!!errors.title} {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-description">{t("organizerForm.description")}</Label>
        <Textarea id="edit-description" rows={4} aria-invalid={!!errors.description} {...register("description")} />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-category">{t("organizerForm.category")}</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="edit-category" className="w-full" aria-invalid={!!errors.category}>
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
          <Label htmlFor="edit-venue">{t("eventDetail.venue")}</Label>
          <Input id="edit-venue" aria-invalid={!!errors.venue} {...register("venue")} />
          {errors.venue && <p className="text-xs text-destructive">{errors.venue.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-city">{t("filters.location")}</Label>
          <Input id="edit-city" aria-invalid={!!errors.city} {...register("city")} />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-address">{t("eventDetail.address")}</Label>
        <Input id="edit-address" aria-invalid={!!errors.address} {...register("address")} />
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
              storagePath={eventCoverImagePath(organizerUid, event.id)}
              label={t("organizerForm.eventCoverImageAria")}
            />
          )}
        />
        {errors.coverImageURL && <p className="text-xs text-destructive">{errors.coverImageURL.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-startAt">{t("organizerForm.starts")}</Label>
          <Input id="edit-startAt" type="datetime-local" aria-invalid={!!errors.startAt} {...register("startAt")} />
          {errors.startAt && <p className="text-xs text-destructive">{errors.startAt.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-endAt">{t("organizerForm.ends")}</Label>
          <Input id="edit-endAt" type="datetime-local" aria-invalid={!!errors.endAt} {...register("endAt")} />
          {errors.endAt && <p className="text-xs text-destructive">{errors.endAt.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="self-start">
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {t("profile.saveChanges")}
      </Button>
    </form>
  );
}
