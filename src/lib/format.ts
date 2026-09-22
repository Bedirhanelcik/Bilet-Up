import { DEFAULT_LOCALE, intlTagFor, type LocaleCode } from "@/lib/i18n/locales";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

// Every currency in the seed dataset is priced in Turkish Lira regardless of the viewer's chosen
// UI language (see docs/data-model.md) — only the *formatting* (grouping/decimal symbols, and the
// translated "Free"/"Ücretsiz"/... word) follows the locale, never the currency itself.
const currencyFormatters = new Map<LocaleCode, Intl.NumberFormat>();
function currencyFormatterFor(locale: LocaleCode): Intl.NumberFormat {
  let formatter = currencyFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intlTagFor(locale), {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    });
    currencyFormatters.set(locale, formatter);
  }
  return formatter;
}

export function formatPrice(amount: number, locale: LocaleCode = DEFAULT_LOCALE): string {
  if (amount === 0) return DICTIONARIES[locale].common.free;
  return currencyFormatterFor(locale).format(amount);
}

/**
 * Like `formatPrice`, but never substitutes the "Free"/"Ücretsiz"/... word for a zero amount —
 * for aggregate money values (organizer dashboard "estimated revenue", etc.) where zero means "no
 * revenue yet", not "this costs nothing". Using `formatPrice` there was a real bug: a brand-new
 * organizer's dashboard read "Estimated revenue: Ücretsiz", which reads as nonsense rather than ₺0.
 */
export function formatCurrencyAmount(amount: number, locale: LocaleCode = DEFAULT_LOCALE): string {
  return currencyFormatterFor(locale).format(amount);
}

// U+2066 (LRI) / U+2069 (PDI) force the enclosed run to resolve as left-to-right regardless of
// the surrounding paragraph's base direction. Without this, "450 – 1.200" rendered inside Arabic
// (RTL) text visually reverses to "1.200 – 450" — the bidi algorithm treats the en dash as a
// neutral that takes the *paragraph's* direction, not the numbers', once two LTR number runs sit
// on either side of it in an RTL context. Every formatted-range/date string that mixes Latin
// digits with a separator goes through this so it reads correctly in RTL locales too.
export function ltrIsolate(text: string): string {
  return `⁦${text}⁩`;
}

export function formatPriceRange(min: number, max: number, locale: LocaleCode = DEFAULT_LOCALE): string {
  if (min === 0 && max === 0) return DICTIONARIES[locale].common.free;
  if (min === max) return formatPrice(min, locale);
  return ltrIsolate(`${formatPrice(min, locale)} – ${formatPrice(max, locale)}`);
}

/**
 * Single-price "starting from" display for event cards and other dense listings — a ticketing
 * card should surface the entry price a buyer can actually act on, not a min–max spread that
 * reads as ambiguous at a glance. Falls back to the plain price when there's no real range (every
 * tier costs the same, or the event is free), so no language shows a nonsensical "From ₺0".
 */
export function formatPriceFrom(min: number, max: number, locale: LocaleCode = DEFAULT_LOCALE): string {
  if (min === 0 && max === 0) return DICTIONARIES[locale].common.free;
  if (min === max) return formatPrice(min, locale);
  return ltrIsolate(DICTIONARIES[locale].common.priceFrom.replace("{price}", formatPrice(min, locale)));
}

type DateFormatterKind = "short" | "full" | "time";
const dateFormatters = new Map<string, Intl.DateTimeFormat>();
function dateFormatterFor(locale: LocaleCode, kind: DateFormatterKind): Intl.DateTimeFormat {
  const key = `${locale}:${kind}`;
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    const tag = intlTagFor(locale);
    const options: Intl.DateTimeFormatOptions =
      kind === "short"
        ? { month: "short", day: "numeric" }
        : kind === "full"
          ? { weekday: "long", month: "long", day: "numeric", year: "numeric" }
          : { hour: "numeric", minute: "2-digit" };
    formatter = new Intl.DateTimeFormat(tag, options);
    dateFormatters.set(key, formatter);
  }
  return formatter;
}

export function formatShortDate(iso: string, locale: LocaleCode = DEFAULT_LOCALE): string {
  return dateFormatterFor(locale, "short").format(new Date(iso));
}

export function formatFullDate(iso: string, locale: LocaleCode = DEFAULT_LOCALE): string {
  return dateFormatterFor(locale, "full").format(new Date(iso));
}

export function formatTime(iso: string, locale: LocaleCode = DEFAULT_LOCALE): string {
  return dateFormatterFor(locale, "time").format(new Date(iso));
}

const BACK_VOWELS = "aıou";
const FRONT_VOWELS = "eiöü";
const UNVOICED_CONSONANTS = "fstkçşhp";

/**
 * Appends the Turkish locative suffix ("'da"/"'de", hardened to "'ta"/"'te" after an unvoiced
 * consonant) to a place name, following vowel harmony off its last vowel — e.g. "İstanbul" ->
 * "İstanbul'da", "İzmir" -> "İzmir'de". Turkish-specific grammar: only call this when the active
 * locale is "tr"; every other language instead composes "{city} {sections.cityHighlightsSuffix}"
 * (see EventSection city-rail headings on the homepage). `toLocaleLowerCase("tr-TR")` matters
 * here: the default locale lowercases "İ" to "i̇" (dotted, two codepoints), not the Turkish "i"
 * vowel harmony depends on.
 */
export function formatCityLocative(city: string): string {
  const lower = city.toLocaleLowerCase("tr-TR");
  let lastVowel = "";
  for (let i = lower.length - 1; i >= 0; i--) {
    if (BACK_VOWELS.includes(lower[i]) || FRONT_VOWELS.includes(lower[i])) {
      lastVowel = lower[i];
      break;
    }
  }
  const suffix = FRONT_VOWELS.includes(lastVowel) ? "de" : "da";
  const hardened = UNVOICED_CONSONANTS.includes(lower[lower.length - 1])
    ? suffix.replace("d", "t")
    : suffix;
  return `${city}'${hardened}`;
}
