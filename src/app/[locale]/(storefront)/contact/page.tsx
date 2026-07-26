import { getTranslations } from "next-intl/server";
import { connectDB } from "@/lib/db";
import { getPublicSettings } from "@/lib/services/settings.service";
import { SOCIAL_DEFAULTS } from "@/lib/social-links";
import {
  EnvelopeSimpleIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
  MapPinIcon,
  PhoneIcon,
  TiktokLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const t = await getTranslations("contact");
  await connectDB();
  const settings = await getPublicSettings();
  const { phone, email, address } = settings.storeContact ?? {};

  const channels = [
    phone && {
      label: t("phone"),
      value: phone,
      href: `tel:${phone.replace(/[^+\d]/g, "")}`,
      Icon: PhoneIcon,
    },
    email && {
      label: t("email"),
      value: email,
      href: `mailto:${email}`,
      Icon: EnvelopeSimpleIcon,
    },
    address && { label: t("address"), value: address, href: undefined, Icon: MapPinIcon },
  ].filter(Boolean) as {
    label: string;
    value: string;
    href?: string;
    Icon: typeof PhoneIcon;
  }[];

  const socials = [
    ["Facebook", settings.socialLinks?.facebook || SOCIAL_DEFAULTS.facebook, FacebookLogoIcon],
    ["Instagram", settings.socialLinks?.instagram || SOCIAL_DEFAULTS.instagram, InstagramLogoIcon],
    ["TikTok", settings.socialLinks?.tiktok || SOCIAL_DEFAULTS.tiktok, TiktokLogoIcon],
    ["YouTube", settings.socialLinks?.youtube || SOCIAL_DEFAULTS.youtube, YoutubeLogoIcon],
  ] as const;

  return (
    <main className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
      <div className="max-w-3xl">
        <h1 className="text-heading-xl text-ink-900 mb-2">{t("title")}</h1>
        <p className="text-body-md text-mute mb-10">{t("getInTouchBlurb")}</p>

        {/* Direct channels */}
        {channels.length > 0 && (
          <div className="mb-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {channels.map(({ label, value, href, Icon }) => (
              <div key={label} className="bg-soft-cloud flex flex-col gap-4 rounded-none p-6">
                <span className="bg-ink-900 flex size-12 shrink-0 items-center justify-center rounded-full text-white">
                  <Icon size={24} aria-hidden />
                </span>
                <div>
                  <p className="text-caption-sm text-mute mb-1">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="text-body-sm-strong text-ink-900 hover:text-charcoal break-words underline-offset-2 hover:underline"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-body-sm-strong text-ink-900 break-words">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Social media */}
        <section className="mb-10">
          <h2 className="text-heading-lg text-ink-900 mb-2">{t("onSocialMedia")}</h2>
          <p className="text-body-sm text-mute mb-4">{t("socialBlurb")}</p>
          <div className="flex gap-3">
            {socials.map(([label, href, Icon]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="bg-soft-cloud text-ink-900 hover:bg-ink-900 flex size-12 items-center justify-center rounded-full transition-colors hover:text-white"
              >
                <Icon size={22} weight="fill" />
              </a>
            ))}
          </div>
        </section>

        {/* Response time */}
        <section className="border-hairline rounded-none border p-6">
          <h2 className="text-heading-md text-ink-900 mb-2">{t("responseTime")}</h2>
          <p className="text-body-sm text-charcoal">{t("responseTimeBlurb")}</p>
        </section>
      </div>
    </main>
  );
}
