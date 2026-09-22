"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, LogOut, Pencil, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/features/auth/useRequireAuth";
import { useLogoutMutation } from "@/features/auth/authApi";
import { useGetUserProfileQuery } from "@/features/profile/profileApi";
import { EditProfileForm } from "@/features/profile/components/EditProfileForm";
import { FavoritesList } from "@/features/favorites/components/FavoritesList";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isChecking } = useRequireAuth();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile, isLoading: isLoadingProfile } = useGetUserProfileQuery(user?.uid ?? "", {
    skip: !user,
  });

  if (isChecking || !user) {
    return <div className="flex flex-1 items-center justify-center py-24 text-muted-foreground">{t("common.loading")}</div>;
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      {isEditing ? (
        <EditProfileForm user={user} profile={profile ?? null} onDone={() => setIsEditing(false)} />
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <div className="relative size-16 overflow-hidden rounded-full">
                  <Image src={user.photoURL} alt={user.displayName ?? t("profile.profilePhoto")} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 font-heading text-xl font-semibold text-primary">
                  {(user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="font-heading text-xl font-semibold">{user.displayName ?? t("profile.yourProfile")}</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={isLoadingProfile}>
              <Pencil className="size-3.5" />
              {t("profile.editProfile")}
            </Button>
          </div>

          {profile?.bio && <p className="mt-4 text-sm text-muted-foreground">{profile.bio}</p>}

          {profile && profile.favoriteCategories.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {profile.favoriteCategories.map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
              <Link href="/onboarding" className="text-xs font-medium text-primary hover:underline">
                {t("profile.editInterests")}
              </Link>
            </div>
          )}
        </>
      )}

      <Link
        href="/tickets"
        className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-accent"
      >
        <Ticket className="size-5 text-muted-foreground" />
        <div className="flex-1">
          <div className="text-sm font-medium">{t("profile.myTicketsCardTitle")}</div>
          <div className="text-xs text-muted-foreground">{t("profile.myTicketsCardDesc")}</div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
      </Link>

      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold">{t("profile.myFavorites")}</h2>
        <div className="mt-3">
          <FavoritesList uid={user.uid} />
        </div>
      </div>

      <Button variant="outline" className="mt-8" onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
        {t("common.logOut")}
      </Button>
    </div>
  );
}
