/**
 * One-off: replace the singleton Settings' hero slides with the in-repo banner
 * photos (public/banners) + copy. Non-destructive — only $sets homepage.heroSlides,
 * leaving every other setting untouched. Run once with: pnpm tsx scripts/set-hero-banners.ts
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import Settings from "../src/models/Settings";

const HERO_SLIDES = [
  {
    imageUrl: "/banners/banner_guy_girl.jpeg",
    imageKey: "",
    headline: "Preloved, not less loved",
    subheadline:
      "Quality-checked imported thrift from Korea, Japan, Taiwan & China — delivered cash-on-delivery across Bangladesh.",
    ctaText: "Shop new in",
    ctaLink: "/products",
    order: 0,
    enabled: true,
  },
  {
    imageUrl: "/banners/banner_bags.jpeg",
    imageKey: "",
    headline: "Bags with a past",
    subheadline: "Totes, crossbodies and backpacks — one-of-a-kind thrifted finds, ready to carry.",
    ctaText: "Shop bags",
    ctaLink: "/products",
    order: 1,
    enabled: true,
  },
  {
    imageUrl: "/banners/banner_girl_tops.jpeg",
    imageKey: "",
    headline: "Tops that tell a story",
    subheadline:
      "Blouses, tees and knits for her — unique preloved pieces, freshly dropped every week.",
    ctaText: "Shop women's tops",
    ctaLink: "/products",
    order: 2,
    enabled: true,
  },
  {
    imageUrl: "/banners/banner_gents_tops.jpeg",
    imageKey: "",
    headline: "Sharp. Secondhand. Sorted.",
    subheadline: "Shirts and tees for him — imported thrift, quality-checked and priced to move.",
    ctaText: "Shop men's tops",
    ctaLink: "/products",
    order: 3,
    enabled: true,
  },
  {
    imageUrl: "/banners/banner_palazzo.jpeg",
    imageKey: "",
    headline: "Flow into palazzo season",
    subheadline: "Breezy wide-leg palazzos — thrifted, one-of-a-kind and made for Dhaka days.",
    ctaText: "Shop palazzos",
    ctaLink: "/products",
    order: 4,
    enabled: true,
  },
];

async function run() {
  const { MONGODB_URI } = process.env;
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI in .env.local");

  await mongoose.connect(MONGODB_URI);

  const settings = await Settings.findOne();
  if (!settings) {
    await Settings.create({ homepage: { heroSlides: HERO_SLIDES } });
    console.log("No settings doc existed — created one with banner hero slides.");
  } else {
    await Settings.updateOne(
      { _id: settings._id },
      { $set: { "homepage.heroSlides": HERO_SLIDES } },
    );
    console.log(`Updated hero slides on settings ${settings._id} → ${HERO_SLIDES.length} banners.`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
