import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let replSet: MongoMemoryReplSet | null = null;

/**
 * Multi-document transactions (order confirmation, cancellation, remittance
 * reconciliation) only work against a replica set, so tests run on
 * MongoMemoryReplSet rather than the cheaper single-node MongoMemoryServer.
 */
export async function connectTestDB() {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
}

export async function disconnectTestDB() {
  await mongoose.disconnect();
  if (replSet) {
    await replSet.stop();
    replSet = null;
  }
}

/** Wipe all collections between tests so each case starts from a clean slate. */
export async function clearTestDB() {
  const { db } = mongoose.connection;
  if (!db) return;
  const collections = await db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}
