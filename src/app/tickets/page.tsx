"use client";

import { useRequireAuth } from "@/features/auth/useRequireAuth";
import { MyTicketsList } from "@/features/tickets/components/MyTicketsList";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export default function MyTicketsPage() {
  const { t } = useTranslation();
  const { user, isChecking } = useRequireAuth();

  if (isChecking || !user) {
    return <div className="flex flex-1 items-center justify-center py-24 text-muted-foreground">{t("common.loading")}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="font-heading text-2xl font-bold tracking-tight">{t("profile.myTicketsCardTitle")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("tickets.pageSubtitle")}</p>
      <div className="mt-6">
        <MyTicketsList uid={user.uid} />
      </div>
    </div>
  );
}
