const mongoose = require('mongoose');

// On Vercel, this module can be re-invoked on every cold start. Without
// caching, each invocation opens a brand new connection to MongoDB, and
// under any real traffic that exhausts Atlas's connection limit fast.
// Caching on `global` survives across invocations within the same
// warm serverless instance.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongooseInstance) => {
      console.log(`MongoDB connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error('MongoDB connection failed:', err.message);
    // Locally, fail loudly and stop the process like before.
    // On Vercel, throw instead — process.exit() would kill the whole
    // serverless runtime rather than just this request.
    if (!process.env.VERCEL) process.exit(1);
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;