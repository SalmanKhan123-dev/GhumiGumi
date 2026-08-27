import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}

// Post Schema
const postSchema = new mongoose.Schema({
  authorName: String,
  title: String,
  imageLink: String,
  categories: [String],
  description: String,
  isFeaturedPost: Boolean,
  timeOfPost: Date,
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string, { dbName: 'GhumiGumi' });
    console.log('✅ Connected to MongoDB!');

    // Read sample posts
    const rawData = readFileSync(join(__dirname, 'sample_posts.json'), 'utf-8');
    const samplePosts = JSON.parse(rawData);

    // Clean up the data (remove MongoDB specific fields)
    const posts = samplePosts.map((post: any) => ({
      authorName: post.authorName,
      title: post.title,
      imageLink: post.imageLink,
      categories: post.categories,
      description: post.description,
      isFeaturedPost: post.isFeaturedPost,
      timeOfPost: post.timeOfPost?.$date || new Date(),
    }));

    // Check if posts already exist
    const existingCount = await Post.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} posts.`);
      console.log('🗑️  Deleting existing posts and re-seeding...');
      await Post.deleteMany({});
    }

    // Insert posts
    await Post.insertMany(posts);
    console.log(`✅ Successfully seeded ${posts.length} posts!`);

    await mongoose.disconnect();
    console.log('✅ Done! Your database is ready.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
