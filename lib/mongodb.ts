import mongoose, { Connection, ConnectOptions } from "mongoose";

// Define a global type for the cached connection
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  // Adding the cache to the NodeJS global interface to persist across hot reloads in development
  var mongooseCache: MongooseCache;
}

// Check if the global object already has a mongooseCache, if not, initialize it
if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

const uri = MONGODB_URI;

/**
 * Connect to the MongoDB database using Mongoose.
 * This function ensures that the connection is cached to prevent multiple connections during development.
 */
export async function connectToDatabase(): Promise<Connection> {
  if (global.mongooseCache.conn) {
    // If a connection is already established, return it
    return global.mongooseCache.conn;
  }

  if (!global.mongooseCache.promise) {
    // If no connection promise exists, create one
    const options: ConnectOptions = {
      bufferCommands: false, // Disable buffering to avoid memory issues
    };

    global.mongooseCache.promise = mongoose
      .connect(uri, options)
      .then((mongooseInstance) => {
        return mongooseInstance.connection;
      });
  }

  try {
    global.mongooseCache.conn = await global.mongooseCache.promise;
    return global.mongooseCache.conn;
  } catch (error) {
    global.mongooseCache.promise = null; // Reset the promise in case of failure
    throw error;
  }
}
