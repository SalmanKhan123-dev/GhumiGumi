import { Request, Response } from 'express';

const callGroq = async (prompt: string): Promise<string> => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
     model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    console.error('Groq error:', err);
    throw new Error('Groq API failed');
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  return data.choices?.[0]?.message?.content ?? '';
};

// ─── 1. TRIP PLANNER ────────────────────────────────────────────────────────
export const tripPlannerHandler = async (req: Request, res: Response) => {
  try {
    const { destination, days, budget, travelers } = req.body;
    if (!destination || !days) {
      return res.status(400).json({ error: 'Destination and days are required' });
    }

    const prompt = `Create a detailed day-by-day travel itinerary for:
Destination: ${destination}
Duration: ${days} days
Budget: ${budget || 'moderate'}
Travelers: ${travelers || '2 people'}

Provide a day-by-day plan with morning, afternoon, and evening activities.
Include recommended places, local food to try, practical tips, and estimated costs.
Format clearly with Day 1, Day 2, etc.`;

    const itinerary = await callGroq(prompt);
    return res.status(200).json({ itinerary });
  } catch (err) {
    console.error('Trip planner error:', err);
    return res.status(500).json({ error: 'Failed to generate itinerary' });
  }
};

// ─── 2. BLOG CONTENT GENERATOR ──────────────────────────────────────────────
export const blogGeneratorHandler = async (req: Request, res: Response) => {
  try {
    const { topic, destination, style } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `You are a travel blogger. Write a complete travel blog post:
Topic: ${topic}
Destination: ${destination || topic}
Style: ${style || 'engaging and descriptive'}

Include:
1. Three catchy title suggestions (label as TITLES)
2. Engaging introduction (label as INTRODUCTION)
3. Detailed body paragraphs (label as BODY)
4. Travel tips section (label as TIPS)
5. Memorable conclusion (label as CONCLUSION)

Write at least 400 words total.`;

    const content = await callGroq(prompt);
    return res.status(200).json({ content });
  } catch (err) {
    console.error('Blog generator error:', err);
    return res.status(500).json({ error: 'Failed to generate blog content' });
  }
};

// ─── 3. DESTINATION RECOMMENDER ─────────────────────────────────────────────
export const destinationRecommenderHandler = async (req: Request, res: Response) => {
  try {
    const { budget, weather, tripType } = req.body;
    if (!budget || !weather || !tripType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const prompt = `You are a travel expert. Recommend 5 best travel destinations for:
Budget: ${budget}
Preferred Weather: ${weather}
Trip Type: ${tripType}

For each destination provide:
- Destination name and country
- Why it matches their preferences
- Best time to visit
- Must-see attractions (3-4 things)
- Estimated budget per person
- One unique tip

Number them 1 to 5 clearly.`;

    const recommendations = await callGroq(prompt);
    return res.status(200).json({ recommendations });
  } catch (err) {
    console.error('Destination recommender error:', err);
    return res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};