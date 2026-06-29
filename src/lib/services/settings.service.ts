import Settings from "@/models/Settings";
import type { UpdateSettingsInput } from "@/lib/validations/settings.schema";

export async function getSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
}

/** Storefront-safe subset — never exposes `riskThresholds`, an internal anti-fraud lever. */
export async function getPublicSettings() {
  const settings = await getSettings();
  return {
    deliveryFee: settings.deliveryFee,
    storeContact: settings.storeContact,
    socialLinks: settings.socialLinks,
    announcement: settings.announcement,
  };
}

/** Flattens nested partial input into dot-notation `$set` so e.g. updating
 * `deliveryFee.insideDhaka` alone doesn't wipe `outsideDhaka`. */
export async function updateSettings(input: UpdateSettingsInput) {
  const set: Record<string, unknown> = { updatedAt: new Date() };
  for (const [group, fields] of Object.entries(input)) {
    if (!fields) continue;
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) set[`${group}.${key}`] = value;
    }
  }

  const settings = await getSettings();
  return Settings.findByIdAndUpdate(settings._id, { $set: set }, { new: true });
}
