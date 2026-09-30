import { Router } from 'express';

import {
  travelAgentHandler,
  tripPlannerHandler,
  blogGeneratorHandler,
  destinationRecommenderHandler,
} from '../controllers/ai-controller.js';

const router = Router();

// ─────────────────────────────────────────────
// AI TRAVEL AGENT
// ─────────────────────────────────────────────

router.post(
  '/travel-agent',
  travelAgentHandler,
);

// ─────────────────────────────────────────────
// EXISTING AI FEATURES
// ─────────────────────────────────────────────

router.post(
  '/trip-planner',
  tripPlannerHandler,
);

router.post(
  '/blog-generator',
  blogGeneratorHandler,
);

router.post(
  '/destination-recommender',
  destinationRecommenderHandler,
);

export default router;