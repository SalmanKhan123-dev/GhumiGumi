import { Router } from 'express';
import {
  tripPlannerHandler,
  blogGeneratorHandler,
  destinationRecommenderHandler,
} from '../controllers/ai-controller.js';

const router = Router();

// 1. Trip Planner
router.post('/trip-planner', tripPlannerHandler);

// 2. Blog Content Generator
router.post('/blog-generator', blogGeneratorHandler);

// 3. Destination Recommender
router.post('/destination-recommender', destinationRecommenderHandler);

export default router;
