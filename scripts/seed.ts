import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";
import Settings from "../src/models/Settings";

async function seed() {
  const { MONGODB_URI, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in .env.local");
  }
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local before running the seed script.",
    );
  }

  await mongoose.connect(MONGODB_URI);

  const existingAdmin = await User.findOne({ email: SEED_ADMIN_EMAIL.toLowerCase() });
  if (existingAdmin) {
    console.log(`Admin user ${SEED_ADMIN_EMAIL} already exists, skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12);
    await User.create({ email: SEED_ADMIN_EMAIL.toLowerCase(), passwordHash, role: "admin" });
    console.log(`Created admin user ${SEED_ADMIN_EMAIL}.`);
  }

  const existingSettings = await Settings.findOne();
  if (existingSettings) {
    console.log("Settings singleton already exists, skipping.");
  } else {
    await Settings.create({
      deliveryFee: { insideDhaka: 70, outsideDhaka: 130 },
      storeContact: { phone: "", email: "", address: "" },
      socialLinks: {},
      riskThresholds: { largeOrderAmount: 5000 },
    });
    console.log("Created settings singleton.");
  }

  await mongoose.connection.close();
}

seed()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
