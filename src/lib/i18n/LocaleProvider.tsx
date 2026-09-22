"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, dirFor, intlTagFor, isLocaleCode, STORAGE_KEY, type LocaleCode } from "./locales";
import { DICTIONARIES, type Dictionary } from "./dictionaries";

/** Resolves a dotted path ("discover.title") against the active dictionary and interpolates
 * `{token}` placeholders from `params`. Falls back to the raw key if a path doesn't resolve —
 * that should only happen for a typo'd key, since every locale is type-checked against the same
 * `Dictionary` shape via `satisfies` at build time. */
function resolve(dict: Dictionary, path: string, params?: Record<string, string | number>): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, dict);
  if (typeof value !== "string") return path;
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, token) => String(params[token] ?? `{${token}}`));
}

export type TranslateFn = (path: string, params?: Record<string, string | number>) => string;

interface LocaleContextValue {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  dir: "ltr" | "rtl";
  intlTag: string;
  t: TranslateFn;
  /** The raw active dictionary — for the rare non-string shape (e.g. `testimonials`, an array of
   * objects) that `t()` can't return, since `t()` is string-only by design. */
  dict: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// A minimal external store for the persisted locale, read via `useSyncExternalStore` — the
// React-endorsed way to read a value that differs between server and client (here: localStorage,
// which the server can't see) without the hydration mismatch a naive `useState(lazyInitializer)`
// causes, and without the "setState directly in an effect" antipattern a `useEffect` correcting
// post-mount state would need. `getServerSnapshot` always returns DEFAULT_LOCALE so the server
// and the client's first render agree; `subscribe`/`setStoredLocale` notify every mounted listener
// synchronously, which matters because — even though this app only ever mounts one LocaleProvider
// — a listener must still exist for `useSyncExternalStore` to know to re-render after `setLocale`.
const listeners = new Set<() => void>();

function readStoredLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLocaleCode(stored) ? stored : DEFAULT_LOCALE;
}

function setStoredLocale(next: LocaleCode) {
  window.localStorage.setItem(STORAGE_KEY, next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getServerSnapshot(): LocaleCode {
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readStoredLocale, getServerSnapshot);

  const setLocale = useCallback((next: LocaleCode) => setStoredLocale(next), []);

  // A side effect syncing React state to the DOM (`<html lang/dir>`) — legitimately belongs in an
  // effect, unlike the state-derivation above. useLayoutEffect (not useEffect) so this runs
  // synchronously right after commit, before the browser paints, so a returning visitor's saved
  // non-default locale doesn't flash the server-rendered Turkish/LTR frame first. (A `next/script`
  // `beforeInteractive` blocking script was tried first, to avoid even that single first-paint
  // correction, but both that and a plain inline `<script>` trigger React 19's "Encountered a
  // script tag while rendering React component" console error in this Next 16 + React 19 + App
  // Router combination — a real, known incompatibility, not a false alarm to suppress.
  // `<html suppressHydrationWarning>` (already set, originally for next-themes' dark class) covers
  // the resulting lang/dir mismatch the same way it covers theme.
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dirFor(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    const dict = DICTIONARIES[locale];
    return {
      locale,
      setLocale,
      dir: dirFor(locale),
      intlTag: intlTagFor(locale),
      t: (path, params) => resolve(dict, path, params),
      dict,
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

/** Shorthand for the common case of just needing the translator function. */
export function useTranslation() {
  const { t, locale, dir } = useLocale();
  return { t, locale, dir };
}
