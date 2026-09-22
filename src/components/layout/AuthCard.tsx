import Link from "next/link";
import { Ticket } from "lucide-react";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <Link href="/" className="mx-auto mb-6 flex items-center gap-2 font-heading text-lg font-bold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Ticket className="size-4.5" />
        </span>
        BiletUP
      </Link>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">{children}</div>
    </div>
  );
}
