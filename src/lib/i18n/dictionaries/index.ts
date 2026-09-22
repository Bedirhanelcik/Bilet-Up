import type { LocaleCode } from "../locales";
import { en } from "./en";
import { tr } from "./tr";
import { de } from "./de";
import { ar } from "./ar";
import { fr } from "./fr";
import { es } from "./es";
import { pt } from "./pt";
import { it } from "./it";

export type { Dictionary } from "./en";

export const DICTIONARIES: Record<LocaleCode, typeof en> = { tr, en, de, ar, fr, es, pt, it };
