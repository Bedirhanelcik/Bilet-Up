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
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { organizerLogoPath } from "@/lib/firebase/storage";
import { createOrganizerProfileSchema, type OrganizerProfileValues } from "@/features/organizer/schemas";
import { useUpdateOrganizerProfileMutation } from "@/features/organizer/organizerApi";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { OrganizerProfile } from "@/types/organizer";

export function EditOrganizerProfileForm({
  uid,
  profile,
  onDone,
}: {
  uid: string;
  profile: OrganizerProfile;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const [updateOrganizerProfile, { isLoading }] = useUpdateOrganizerProfileMutation();
  const organizerProfileSchema = useMemo(() => createOrganizerProfileSchema(t), [t]);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizerProfileValues>({
    resolver: zodResolver(organizerProfileSchema),
    defaultValues: { name: profile.name, bio: profile.bio ?? "", logoURL: profile.logoURL ?? "" },
  });

  async function onSubmit(values: OrganizerProfileValues) {
    try {
      await updateOrganizerProfile({
        uid,
        name: values.name,
        bio: values.bio?.trim() ?? "",
        logoURL: values.logoURL?.trim() || null,
      }).unwrap();
      toast.success(t("organizerDashboard.updateProfileSuccess"));
      onDone();
    } catch {
      toast.error(t("organizerDashboard.updateProfileError"));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label>{t("organizerDashboard.logo")}</Label>
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
              fallbackLabel={profile.name.charAt(0).toUpperCase() || "?"}
            />
          )}
        />
        {errors.logoURL && <p className="text-xs text-destructive">{errors.logoURL.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-org-name">{t("organizerDashboard.organizerName")}</Label>
        <Input id="edit-org-name" aria-invalid={!!errors.name} {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-org-bio">{t("profile.bio")}</Label>
        <Textarea id="edit-org-bio" rows={3} aria-invalid={!!errors.bio} {...register("bio")} />
        {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {t("profile.saveChanges")}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} disabled={isLoading}>
          {t("profile.cancel")}
        </Button>
      </div>
    </form>
  );
}
