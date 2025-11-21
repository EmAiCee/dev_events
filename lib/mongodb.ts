import mongoose, { Connection } from 'mongoose';

/**
 * Type-safe shape of the cached connection object stored on `globalThis`.
 */
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

/**
 * Augment the global scope definition so TypeScript knows about our cache.
 *
 * We attach the cache to `globalThis` to keep the same connection instance
 * across Next.js hot reloads in development. This avoids creating
 * a new database connection on every request / reload.
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

// Initialize the global cache if it does not exist yet.
const globalCache: MongooseCache = global._mongoose ?? {
  conn: null,
  promise: null,
};

if (!global._mongoose) {
  global._mongoose = globalCache;
}

/**
 * Get the MongoDB connection URI from environment variables.
 *
 * This function throws early if the URI is missing so that
 * configuration errors fail fast on application startup.
 */
function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  return uri;
}

/**
 * Establishes (or reuses) a Mongoose connection.
 *
 * - Reuses an existing connection from the global cache when available.
 * - Otherwise, creates a new connection and stores it in the cache.
 *
 * This function is safe to call from both server components and API routes
 * in a Next.js application.
 */
export async function connectToDatabase(): Promise<Connection> {
  // If a connection is already established, reuse it.
  if (globalCache.conn) {
    return globalCache.conn;
  }

  // If a connection is in progress, wait for it to resolve.
  if (!globalCache.promise) {
    const uri = getMongoUri();

    // `mongoose.connect` returns a `Mongoose` instance; we immediately
    // derive the underlying `Connection` from it for consistency.
    globalCache.promise = mongoose.connect(uri).then((mongooseInstance) => {
      return mongooseInstance.connection;
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}

/**
 * Optional helper to disconnect from the database.
 *
 * In serverless environments you typically do not call this manually,
 * but it can be useful for scripts, tests, or graceful shutdown logic.
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (!globalCache.conn) {
    return;
  }

  await mongoose.disconnect();
  globalCache.conn = null;
  globalCache.promise = null;
}

export default connectToDatabase;
