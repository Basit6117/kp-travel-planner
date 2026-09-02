import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Connect to MongoDB using Mongoose. Reuses existing connection in serverless environments.
 */
export async function connectMongo() {
  if (mongoose.connection.readyState >= 1) {
    // Already connected
    return;
  }
  await mongoose.connect(MONGODB_URI, {
    // useNewUrlParser and useUnifiedTopology are true by default in Mongoose 6+
  });
  console.log('✅ Connected to MongoDB');
}

export default mongoose;
