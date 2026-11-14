/**
 * Elevate an admin user to "superadmin", optionally creating it or resetting its password.
 * Usage:
 *   pnpm tsx scripts/set-superadmin.ts you@example.com             # elevate existing user
 *   pnpm tsx scripts/set-superadmin.ts you@example.com --password  # prompt for a new password;
 *                                                                  # creates the user if missing
 * (defaults to SEED_ADMIN_EMAIL from .env.local if no email is passed)
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import readline from "node:readline";
import User from "../src/models/User";

// Reads a line from the terminal without echoing it, so the password stays out of
// scrollback and shell history.
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const output = rl as unknown as { _writeToOutput: (s: string) => void };
    process.stdout.write(question);
    output._writeToOutput = () => {};
    rl.question("", (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function run() {
  const { MONGODB_URI, SEED_ADMIN_EMAIL } = process.env;
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI in .env.local");

  const args = process.argv.slice(2);
  const withPassword = args.includes("--password");
  const emailArg = args.find((a) => !a.startsWith("--"));

  const email = (emailArg || SEED_ADMIN_EMAIL || "").toLowerCase();
  if (!email) throw new Error("Pass an email, or set SEED_ADMIN_EMAIL in .env.local");

  let passwordHash: string | undefined;
  if (withPassword) {
    const password = await promptHidden(`New password for ${email}: `);
    const confirm = await promptHidden("Confirm password: ");
    if (password !== confirm) throw new Error("Passwords do not match.");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    passwordHash = await bcrypt.hash(password, 12);
  }

  await mongoose.connect(MONGODB_URI);

  if (passwordHash) {
    const result = await User.updateOne(
      { email },
      { $set: { role: "superadmin", passwordHash } },
      { upsert: true },
    );
    console.log(
      result.upsertedCount > 0
        ? `Created superadmin ${email}.`
        : `Reset password and set superadmin role for ${email}.`,
    );
  } else {
    const result = await User.updateOne({ email }, { $set: { role: "superadmin" } });
    if (result.matchedCount === 0) {
      console.error(
        `No admin user found with email ${email}. Re-run with --password to create it.`,
      );
    } else {
      console.log(`Elevated ${email} to superadmin.`);
    }
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
