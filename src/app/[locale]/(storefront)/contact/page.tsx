import { getTranslations } from "next-intl/server";
import { connectDB } from "@/lib/db";
import { getPublicSettings } from "@/lib/services/settings.service";

export const metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const t = await getTranslations("contact");
  await connectDB();
  const settings = await getPublicSettings();

  return (
    <main className="max-w-container mx-auto px-4 py-12 md:px-8 md:py-16">
      <div className="max-w-2xl">
        <h1 className="text-ink-900 mb-6 text-3xl font-extrabold">{t("title")}</h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-ink-900 mb-3 text-lg font-bold">{t("getInTouch")}</h2>
            <p className="text-ink-700">{t("getInTouchBlurb")}</p>
          </section>

          <section>
            <h3 className="text-ink-900 mb-3 font-semibold">{t("onSocialMedia")}</h3>
            <div className="flex gap-3">
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-700 hover:text-green-800"
                >
                  Facebook
                </a>
              )}
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-700 hover:text-green-800"
                >
                  Instagram
                </a>
              )}
              {settings.socialLinks?.tiktok && (
                <a
                  href={settings.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-700 hover:text-green-800"
                >
                  TikTok
                </a>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-ink-900 mb-3 font-semibold">{t("responseTime")}</h3>
            <p className="text-ink-700">{t("responseTimeBlurb")}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
