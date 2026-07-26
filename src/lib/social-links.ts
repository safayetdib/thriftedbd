/**
 * Official thriftedBD social profiles - the fallback when the admin hasn't
 * set a URL in Settings → socialLinks, so social buttons never render empty.
 * Shared by the footer (client) and the contact page (server).
 */
export const SOCIAL_DEFAULTS = {
  facebook: "https://www.facebook.com/share/1DjN9w7UEj/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/thriftedbdstore",
  tiktok: "https://www.tiktok.com/@thriftedbd?_r=1&_t=ZS-97VJK01eQgT",
  youtube: "https://www.youtube.com/@ThriftedBD",
} as const;

export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
};
