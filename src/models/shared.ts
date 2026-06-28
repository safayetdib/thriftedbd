import { Schema } from "mongoose";

/**
 * Bilingual text per docs/i18n-guidelines.md — `bn` is optional and falls
 * back to `en` on render. Never required to save/publish a record.
 */
export interface I18nText {
  en: string;
  bn?: string;
}

export const i18nTextSchema = new Schema<I18nText>(
  {
    en: { type: String, required: true },
    bn: { type: String },
  },
  { _id: false },
);

/** Same shape, but `en` itself is optional too (e.g. free-text notes). */
export interface I18nTextOptional {
  en?: string;
  bn?: string;
}

export const i18nTextOptionalSchema = new Schema<I18nTextOptional>(
  {
    en: { type: String },
    bn: { type: String },
  },
  { _id: false },
);
