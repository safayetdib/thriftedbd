import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";

const valueProps = [
  {
    icon: ShieldCheck,
    title: "Quality checked",
    description: "Every piece is inspected before it's listed — no surprises at your door.",
  },
  {
    icon: Truck,
    title: "COD + bKash/Nagad",
    description: "Pay the way you already do, with cash on delivery available nationwide.",
  },
  {
    icon: RotateCcw,
    title: "Nationwide delivery & easy returns",
    description: "We ship across Bangladesh and make returns simple if something's off.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-ink-900 relative flex min-h-[420px] flex-col justify-center px-4 py-20 md:min-h-[560px] md:px-8">
        <div className="max-w-container mx-auto w-full">
          <p className="text-eyebrow text-amber-400">Imported preloved fashion</p>
          <h1
            className="text-ink-50 mt-4 max-w-xl font-sans font-extrabold"
            style={{ fontSize: "clamp(2.25rem, 6vw, 3.5rem)", lineHeight: 1.05 }}
          >
            Quality secondhand, sourced from Korea, Japan, Taiwan &amp; China.
          </h1>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="primary" size="lg">
              Shop now
            </Button>
            <Button variant="outline" size="lg" className="border-ink-300 text-ink-50">
              Explore new in
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-24">
        <div className="grid gap-8 md:grid-cols-3">
          {valueProps.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-start gap-4">
              <span className="rounded-pill flex size-12 items-center justify-center bg-green-50">
                <Icon className="size-6 text-green-600" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h4 className="text-ink-900 text-lg font-semibold">{title}</h4>
              <p className="text-ink-500 text-sm">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
