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
import { userAvatarPath } from "@/lib/firebase/storage";
import { createEditProfileSchema, type EditProfileValues } from "@/features/profile/schemas";
import { useUpdateProfileMutation } from "@/features/profile/profileApi";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { AuthUser } from "@/redux/slices/authSlice";
import type { UserProfileDoc } from "@/lib/firebase/users";

export function EditProfileForm({
  user,
  profile,
  onDone,
}: {
  user: AuthUser;
  profile: UserProfileDoc | null;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const editProfileSchema = useMemo(() => createEditProfileSchema(t), [t]);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      displayName: user.displayName ?? "",
      bio: profile?.bio ?? "",
      photoURL: user.photoURL ?? "",
    },
  });

  async function onSubmit(values: EditProfileValues) {
    try {
      await updateProfile({
        uid: user.uid,
        displayName: values.displayName,
        bio: values.bio?.trim() || null,
        photoURL: values.photoURL?.trim() || null,
        currentUser: user,
      }).unwrap();
      toast.success(t("profile.updateSuccess"));
      onDone();
    } catch {
      toast.error(t("profile.updateError"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label>{t("profile.photo")}</Label>
        <Controller
          control={control}
          name="photoURL"
          render={({ field }) => (
            <ImageUploadField
              value={field.value ?? ""}
              onChange={field.onChange}
              storagePath={userAvatarPath(user.uid)}
              shape="circle"
              label={t("profile.profilePhoto")}
              fallbackLabel={(user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-name">{t("profile.name")}</Label>
        <Input id="edit-name" aria-invalid={!!errors.displayName} {...register("displayName")} />
        {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-bio">{t("profile.bio")}</Label>
        <Textarea
          id="edit-bio"
          rows={3}
          placeholder={t("profile.bioPlaceholder")}
          aria-invalid={!!errors.bio}
          {...register("bio")}
        />
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
