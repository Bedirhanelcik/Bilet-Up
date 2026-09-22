"use client";

import Link from "next/link";
import { Ticket } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { HeaderAuthControls } from "@/components/layout/HeaderAuthControls";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { CitySelector } from "@/components/layout/CitySelector";
import { GlobalSearch } from "@/features/search/components/GlobalSearch";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

/**
 * Three-region navbar — logo (start), search (center, grows to fill the space between logo and
 * the right cluster), everything else (end): nav links, city selector, language/theme, and
 * account access. Every item shares the same `h-9` control height and sits in one `items-center`
 * row, so nothing needs its own vertical offset to line up on the same baseline.
 */
export function Header() {
  const { t } = useTranslation();
  const navLinks = [
    { href: "/discover", label: t("nav.discover") },
    { href: "/organizers", label: t("nav.organizers") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-heading text-lg font-bold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Ticket className="size-4.5" />
          </span>
          BiletUP
        </Link>

        <div className="hidden flex-1 justify-center sm:flex">
          <div className="w-full max-w-md">
            <GlobalSearch />
          </div>
        </div>

        <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:ms-0">
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="sm:hidden">
            <GlobalSearch iconOnly />
          </div>
          <CitySelector />
          <LanguageSelector />
          <ThemeToggle />
          <NotificationBell />
          <HeaderAuthControls />
        </div>
      </div>
    </header>
  );
}
