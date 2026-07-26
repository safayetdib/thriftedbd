/**
 * Elevate an existing admin user to "superadmin".
 * Usage: pnpm tsx scripts/set-superadmin.ts you@example.com
 * (defaults to SEED_ADMIN_EMAIL from .env.local if no email is passed)
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import User from "../src/models/User";

async function run() {
  const { MONGODB_URI, SEED_ADMIN_EMAIL } = process.env;
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI in .env.local");

  const email = (process.argv[2] || SEED_ADMIN_EMAIL || "").toLowerCase();
  if (!email) throw new Error("Pass an email, or set SEED_ADMIN_EMAIL in .env.local");

  await mongoose.connect(MONGODB_URI);

  const result = await User.updateOne({ email }, { $set: { role: "superadmin" } });
  if (result.matchedCount === 0) {
    console.error(`No admin user found with email ${email}.`);
  } else {
    console.log(`Elevated ${email} to superadmin.`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
