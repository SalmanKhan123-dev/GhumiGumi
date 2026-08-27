import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import { connectToRedis } from './services/redis.js';

console.log('🚀 Starting server...');

const port = process.env.PORT || 3000;

// Start server FIRST — Render needs port to be open immediately
const server = app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🔗 Backend URL: http://localhost:${port}`);
});

// Connect to databases AFTER server is listening
async function connectDatabases() {
  try {
    await connectToRedis();
    await connectDB();
  } catch (error) {
    console.error('❌ Database connection error:', error);
    // Don't exit — let server keep running
  }
}

connectDatabases();

export default server;