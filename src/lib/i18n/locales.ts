export const LOCALES = [
  { code: "tr", nativeName: "Türkçe", intl: "tr-TR", dir: "ltr" },
  { code: "en", nativeName: "English", intl: "en-US", dir: "ltr" },
  { code: "de", nativeName: "Deutsch", intl: "de-DE", dir: "ltr" },
  { code: "ar", nativeName: "العربية", intl: "ar-AE", dir: "rtl" },
  { code: "fr", nativeName: "Français", intl: "fr-FR", dir: "ltr" },
  { code: "es", nativeName: "Español", intl: "es-ES", dir: "ltr" },
  { code: "pt", nativeName: "Português", intl: "pt-PT", dir: "ltr" },
  { code: "it", nativeName: "Italiano", intl: "it-IT", dir: "ltr" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "tr";

export const STORAGE_KEY = "biletup-locale";

export function isLocaleCode(value: string | null | undefined): value is LocaleCode {
  return !!value && LOCALES.some((l) => l.code === value);
}

export function localeMeta(code: LocaleCode) {
  return LOCALES.find((l) => l.code === code)!;
}

export function dirFor(code: LocaleCode): "ltr" | "rtl" {
  return localeMeta(code).dir;
}

export function intlTagFor(code: LocaleCode): string {
  return localeMeta(code).intl;
}
