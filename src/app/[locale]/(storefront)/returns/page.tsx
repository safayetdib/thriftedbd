import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata = { title: "Returns & Refunds" };

export default async function ReturnsPage() {
  const t = await getTranslations("returns");
  return (
    <main className="max-w-container mx-auto px-4 py-12 md:px-8 md:py-16">
      <div className="max-w-2xl">
        <h1 className="text-heading-xl text-ink-900 mb-6">{t("title")}</h1>

        <div className="prose prose-sm text-body-md text-charcoal max-w-none space-y-4">
          <p>{t("intro")}</p>

          <section>
            <h2 className="text-heading-lg text-ink-900 mt-6 mb-2">{t("policyTitle")}</h2>
            <p>{t("policyBody")}</p>
          </section>

          <section>
            <h2 className="text-heading-lg text-ink-900 mt-6 mb-2">{t("conditionTitle")}</h2>
            <ul className="ml-2 list-inside list-disc space-y-1">
              <li>{t("condition1")}</li>
              <li>{t("condition2")}</li>
              <li>{t("condition3")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading-lg text-ink-900 mt-6 mb-2">{t("howTitle")}</h2>
            <ol className="ml-2 list-inside list-decimal space-y-1">
              <li>{t("how1")}</li>
              <li>{t("how2")}</li>
              <li>{t("how3")}</li>
              <li>{t("how4")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-heading-lg text-ink-900 mt-6 mb-2">{t("refundTitle")}</h2>
            <p>{t("refundBody")}</p>
          </section>

          <p className="mt-6">
            {t.rich("more", {
              link: (chunks) => (
                <Link href="/contact" className="text-link-md text-ink-900">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </div>
    </main>
  );
}
