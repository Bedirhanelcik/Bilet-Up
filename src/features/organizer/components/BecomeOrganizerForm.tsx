"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { organizerLogoPath } from "@/lib/firebase/storage";
import { createOrganizerProfileSchema, type OrganizerProfileValues } from "@/features/organizer/schemas";
import { useCreateOrganizerProfileMutation } from "@/features/organizer/organizerApi";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export function BecomeOrganizerForm({ uid, defaultName }: { uid: string; defaultName: string }) {
  const { t } = useTranslation();
  const [createOrganizerProfile, { isLoading }] = useCreateOrganizerProfileMutation();
  const organizerProfileSchema = useMemo(() => createOrganizerProfileSchema(t), [t]);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizerProfileValues>({
    resolver: zodResolver(organizerProfileSchema),
    defaultValues: { name: defaultName, bio: "", logoURL: "" },
  });

  async function onSubmit(values: OrganizerProfileValues) {
    try {
      await createOrganizerProfile({
        uid,
        name: values.name,
        bio: values.bio?.trim() ?? "",
        logoURL: values.logoURL?.trim() || null,
      }).unwrap();
      toast.success(t("organizerDashboard.createProfileSuccess"));
    } catch {
      toast.error(t("organizerDashboard.createProfileError"));
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Store className="size-6" />
      </span>
      <div>
        <h1 className="font-heading text-xl font-semibold">{t("organizerDashboard.becomeOrganizerTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("organizerDashboard.becomeOrganizerDesc")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-name">{t("organizerDashboard.organizerName")}</Label>
          <Input id="org-name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-bio">{t("profile.bio")}</Label>
          <Textarea
            id="org-bio"
            rows={3}
            placeholder={t("organizerDashboard.bioPlaceholder")}
            aria-invalid={!!errors.bio}
            {...register("bio")}
          />
          {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("organizerDashboard.logoOptional")}</Label>
          <Controller
            control={control}
            name="logoURL"
            render={({ field }) => (
              <ImageUploadField
                value={field.value ?? ""}
                onChange={field.onChange}
                storagePath={organizerLogoPath(uid)}
                shape="circle"
                label={t("organizerForm.organizerLogoAria")}
                fallbackLabel={defaultName.charAt(0).toUpperCase() || "?"}
              />
            )}
          />
          {errors.logoURL && <p className="text-xs text-destructive">{errors.logoURL.message}</p>}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {t("organizerDashboard.createProfile")}
        </Button>
      </form>
    </div>
  );
}
