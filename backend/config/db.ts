import mongoose from 'mongoose';
import { MONGODB_URI } from './utils.js';

export default async function connectDB() {
  try {
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in environment variables');
      return;
    }
    await mongoose.connect(MONGODB_URI as string, {
      dbName: 'GhumiGumi',
    });
    console.log(`✅ Database connected successfully`);
  } catch (err: any) {
    console.error('❌ Database connection failed:', err.message);
    // Don't exit — let server keep running
  }

  mongoose.connection.on('error', (err) => {
    console.error(`connection error: ${err}`);
  });

  return;
}