import type { Category } from "@/types/event";
import { DEFAULT_LOCALE, type LocaleCode } from "@/lib/i18n/locales";
import { DICTIONARIES, type Dictionary } from "@/lib/i18n/dictionaries";

type CategorySlug = keyof Dictionary["categories"];

// Real, verified (HTTP 200) Unsplash photos, one per category — distinct from every event cover
// in scripts/seed-events.mjs, so category tiles never repeat an image already used elsewhere.
function img(id: string): string {
  return `https://images.unsplash.com/${id}?w=800&h=800&fit=crop&auto=format&q=80`;
}

// `name` is the Turkish fallback label (used only if a slug isn't found in the active locale's
// dictionary). `slug` is the stable, language-independent identifier stored on `events.category`
// and on `INTEREST_CATEGORIES`, and doubles as the key into `dictionaries/*.ts`'s `categories`
// section — never shown to users directly, always resolved via `categoryDisplayName` below so
// slug and display text can vary independently per language.
export const CATEGORIES: Category[] = [
  { slug: "music", name: "Müzik", icon: "Music", image: img("photo-1459749411175-04bf5292ceea") },
  { slug: "festivals", name: "Festivaller", icon: "PartyPopper", image: img("photo-1514525253161-7a46d19cd819") },
  { slug: "technology", name: "Teknoloji", icon: "Cpu", image: img("photo-1504384764586-bb4cdc1707b0") },
  { slug: "sports", name: "Spor", icon: "Trophy", image: img("photo-1628779238951-be2c9f2a59f4") },
  { slug: "theater", name: "Tiyatro", icon: "Drama", image: img("photo-1503095396549-807759245b35") },
  { slug: "business", name: "İş Dünyası", icon: "Briefcase", image: img("photo-1529070538774-1843cb3265df") },
  { slug: "gaming", name: "Oyun", icon: "Gamepad2", image: img("photo-1633545495735-25df17fb9f31") },
  { slug: "art", name: "Sanat", icon: "Palette", image: img("photo-1569783721854-33a99b4c0bae") },
  { slug: "food", name: "Yemek", icon: "UtensilsCrossed", image: img("photo-1678646142794-253fdd20fa05") },
  { slug: "comedy", name: "Komedi", icon: "Mic2", image: img("photo-1683304554869-8a871c913096") },
  { slug: "nightlife", name: "Gece Hayatı", icon: "Martini", image: img("photo-1687511844598-165c1fc387cc") },
  { slug: "education", name: "Eğitim", icon: "GraduationCap", image: img("photo-1492538368677-f6e0afe31dcc") },
  {
    slug: "family",
    name: "Aile",
    icon: "Baby",
    // Wikimedia Commons (real, openly-licensed photography) rather than Unsplash — see the
    // seed-events.mjs header comment on image sourcing for this dataset-expansion pass.
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Alicia%2C_Santa_Monica_Pier%2C_Santa_Monica%2C_California_%2812%29_%283124894073%29.jpg/960px-Alicia%2C_Santa_Monica_Pier%2C_Santa_Monica%2C_California_%2812%29_%283124894073%29.jpg",
  },
];

const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

/**
 * Resolves any category identifier — a slug ("music") or a legacy/ad-hoc capitalized value
 * ("Music", as stored by `INTEREST_CATEGORIES` and a handful of hand-created events that predate
 * the slug convention) — to its display name in the given locale (Turkish by default). Falls back
 * to the raw value so an unknown string still renders instead of disappearing.
 */
export function categoryDisplayName(value: string, locale: LocaleCode = DEFAULT_LOCALE): string {
  const slug = value.toLowerCase();
  if ((CATEGORY_SLUGS as string[]).includes(slug)) {
    return DICTIONARIES[locale].categories[slug as CategorySlug];
  }
  return value;
}
