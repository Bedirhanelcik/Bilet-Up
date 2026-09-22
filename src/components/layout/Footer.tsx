"use client";

import Link from "next/link";
import { Ticket } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export function Footer() {
  const { t } = useTranslation();

  const footerLinks = [
    {
      heading: t("footer.product"),
      links: [
        { href: "/discover", label: t("footer.discoverEvents") },
        { href: "/organizers", label: t("footer.organizers") },
        { href: "/organizer", label: t("footer.forOrganizers") },
      ],
    },
    {
      heading: t("footer.company"),
      links: [
        { href: "/about", label: t("footer.about") },
        { href: "/contact", label: t("footer.contact") },
      ],
    },
    {
      heading: t("footer.legal"),
      links: [
        { href: "/privacy", label: t("footer.privacy") },
        { href: "/terms", label: t("footer.terms") },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Ticket className="size-4.5" />
            </span>
            BiletUP
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>

        {footerLinks.map((column) => (
          <div key={column.heading}>
            <h3 className="text-sm font-semibold">{column.heading}</h3>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} BiletUP. {t("footer.rights")}
      </div>
    </footer>
  );
}
