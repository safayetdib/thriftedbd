import mongoose from "mongoose";

/**
 * Next.js hot-reloads modules in dev, which would otherwise open a new
 * connection on every file save. Cache the connection (and the in-flight
 * connect promise) on the global object so it survives reloads.
 */
declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached = global.mongooseConnection ?? { conn: null, promise: null };
global.mongooseConnection = cached;

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Checked lazily (not at module load) so this file can be safely
    // imported during Next.js build-time page-data collection, which
    // evaluates route modules without a request and without env vars set.
    if (!process.env.MONGODB_URI) {
      throw new Error("Missing MONGODB_URI environment variable");
    }

    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
