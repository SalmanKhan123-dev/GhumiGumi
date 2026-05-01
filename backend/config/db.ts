import mongoose, { AnyArray } from 'mongoose';
import { MONGODB_URI } from './utils.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Post from '../models/post.js';
import User from '../models/user.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function connectDB() {
  try {
    try {
      await mongoose.connect(MONGODB_URI as string, {
        dbName: 'GhumiGumi',
      });
      console.log(`Database connected: ${MONGODB_URI}`);
    } catch (primaryErr) {
      console.log(`Original DB connection failed. Starting fallback memory server...`);
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri, {
        dbName: 'GhumiGumi',
      });
      console.log(`Fallback in-memory Database connected: ${mongoUri}`);

      const postCount = await Post.countDocuments();
      if (postCount === 0) {
        console.log('Seeding initial data into memory database...');
        try {
          const sampleDataPath = path.join(__dirname, '../data/sample_posts.json');
          const samplePostsRaw = fs.readFileSync(sampleDataPath, 'utf8');
          const samplePosts = JSON.parse(samplePostsRaw);
          
          let dummyUser = await User.findOne({ email: 'admin@travel.com' });
          if (!dummyUser) {
            dummyUser = await User.create({
              fullName: 'Admin Traveler',
              userName: 'admintraveler',
              email: 'admin@travel.com',
              password: 'Password@123',
            });
          }

          const postsToInsert = samplePosts.map((p: any) => {
            const newPost = { ...p, authorId: dummyUser?._id };
            delete newPost._id; // Let mongoose generate clean IDs
            if (newPost.timeOfPost && newPost.timeOfPost.$date) {
              newPost.timeOfPost = new Date(newPost.timeOfPost.$date);
            }
            return newPost;
          });

          await Post.insertMany(postsToInsert);
          console.log(`Successfully seeded ${postsToInsert.length} posts!`);
        } catch (seedErr) {
          console.error('Error seeding data:', seedErr);
        }
      }
    }
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }

  const dbConnection = mongoose.connection;

  dbConnection.on('error', (err) => {
    console.error(`connection error: ${err}`);
  });
  return;
}
