"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Ticket, User } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { useLogoutMutation } from "@/features/auth/authApi";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export function HeaderAuthControls() {
  const router = useRouter();
  const { user, status } = useAppSelector((s) => s.auth);
  const [logout] = useLogoutMutation();
  const { t } = useTranslation();

  if (status === "loading") {
    return <div className="size-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!user) {
    return (
      <>
        <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}>
          {t("common.signIn")}
        </Link>
        <Link href="/register" className={buttonVariants({ variant: "default" })}>
          {t("common.getStarted")}
        </Link>
      </>
    );
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="rounded-full" aria-label={t("common.accountMenu")} />}
      >
        {user.photoURL ? (
          <span className="relative size-8 overflow-hidden rounded-full">
            <Image src={user.photoURL} alt="" fill className="object-cover" />
          </span>
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {(user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href="/profile" />}>
          <User className="size-4" />
          {t("common.profile")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/tickets" />}>
          <Ticket className="size-4" />
          {t("common.myTickets")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/organizer" />}>
          <LayoutDashboard className="size-4" />
          {t("common.organizerDashboard")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} variant="destructive">
          <LogOut className="size-4" />
          {t("common.logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
