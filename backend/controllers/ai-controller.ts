import { Request, Response } from 'express';

/* =========================================================
   GROQ AI HELPER
========================================================= */

const callGroq = async (prompt: string): Promise<string> => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 3500,
        temperature: 0.75,
      }),
    },
  );

  if (!response.ok) {
    const err = await response.json();

    console.error('Groq error:', err);

    throw new Error(
      err?.error?.message || 'Groq API request failed',
    );
  }

  const data = (await response.json()) as {
    choices?: {
      message?: {
        content?: string;
      };
    }[];
  };

  return data.choices?.[0]?.message?.content || '';
};


/* =========================================================
   1. AI TRIP PLANNER
========================================================= */

export const tripPlannerHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      destination,
      days,
      budget,
      travelers,
    } = req.body;

    if (!destination || !days) {
      return res.status(400).json({
        error: 'Destination and days are required',
      });
    }

    const numberOfDays = Math.min(
      Math.max(Number(days), 1),
      7,
    );

    const prompt = `
You are GhumiGumi, a smart and exciting travel planner.

Create a realistic ${numberOfDays}-day itinerary for:

Destination: ${destination}
Budget: ${budget || 'moderate'}
Travelers: ${travelers || '2 people'}

Return ONLY valid JSON.

Use EXACTLY this structure:

{
  "title": "Catchy trip title",
  "summary": "Short exciting summary",
  "days": [
    {
      "day": 1,
      "theme": "Interesting day theme",
      "activities": [
        {
          "time": "Morning",
          "title": "Place or activity",
          "description": "Short useful description",
          "why": "Why this is worth doing",
          "cost": "₹100",
          "tip": "Useful local tip"
        },
        {
          "time": "Lunch",
          "title": "Local food or restaurant area",
          "description": "What to eat and what it is known for",
          "why": "Why try it",
          "cost": "₹200",
          "tip": "Useful food tip"
        },
        {
          "time": "Afternoon",
          "title": "Place or activity",
          "description": "Short useful description",
          "why": "Why visit",
          "cost": "₹150",
          "tip": "Useful local tip"
        },
        {
          "time": "Evening",
          "title": "Place or activity",
          "description": "Short useful description",
          "why": "Why it is special",
          "cost": "₹100",
          "tip": "Useful evening tip"
        }
      ]
    }
  ],
  "totalCost": "₹2500",
  "proTips": [
    "Local travel tip",
    "Safety tip",
    "Money-saving tip"
  ]
}

RULES:

- Exactly ${numberOfDays} days.
- Exactly 4 activities per day.
- Use real places in ${destination}.
- Include famous attractions.
- Include authentic local food.
- Include at least one memorable experience.
- Make the order feel like a REAL journey.
- Nearby places should preferably be grouped together.
- Consider realistic travel time.
- Lunch must include a local food experience.
- Include what the destination is famous for.
- Include useful transport suggestions inside descriptions or tips.
- Avoid repeating attractions.
- Keep descriptions short.
- Keep tips short.
- Make the writing exciting but practical.
- Do not use Markdown.
- Do not use tables.
- Return JSON only.
`;

    const itinerary = await callGroq(prompt);

    const cleanedItinerary = itinerary
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsedItinerary;

    try {
      parsedItinerary = JSON.parse(cleanedItinerary);
    } catch (parseError) {
      console.error(
        'AI returned invalid JSON:',
        cleanedItinerary,
      );

      return res.status(500).json({
        error: 'AI returned an invalid itinerary format',
      });
    }

    return res.status(200).json({
      itinerary: parsedItinerary,
    });

  } catch (err: any) {
    console.error('Trip planner error:', err);

    return res.status(500).json({
      error:
        err?.message ||
        'Failed to generate itinerary',
    });
  }
};


/* =========================================================
   2. AI BLOG GENERATOR
========================================================= */

export const blogGeneratorHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      topic,
      destination,
      style,
    } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: 'Topic is required',
      });
    }

    const prompt = `
You are the lead travel writer for GhumiGumi.

Write a polished travel article about:

Topic: ${topic}
Destination: ${destination || topic}
Style: ${style || 'warm, vivid, conversational and adventurous'}

IMPORTANT:

Do NOT write a generic AI essay.

The article should feel like a modern travel magazine article written
by an excellent human travel writer.

Make the reader feel like they are actually planning this trip.

Start with a strong visual hook.

Use natural language.

Talk about:
- atmosphere
- places
- food
- experiences
- local culture
- practical travel details

Avoid phrases such as:
"Traveling to X is an amazing experience."
"X is a beautiful destination."
"Whether you are..."
"Nestled in..."
"Rich tapestry..."
unless genuinely necessary.

Do not pretend that you personally visited the destination.

Do not invent conversations with local people.

Do not invent fake facts.

STRUCTURE THE ARTICLE LIKE THIS:

# Main Catchy Title

Write one strong title.

Then write a short 2-3 paragraph opening that immediately creates
a sense of place.

## Quick Takeaway

Give 3 useful highlights:

- Best for
- Don't miss
- Must-try food

## Why Go?

Give exactly 3 reasons.

Each reason should have:

### Short Reason Heading

2-3 engaging sentences.

## Places Worth Your Time

Choose 5 real places.

For each:

### Place Name

Explain:
- what makes it special
- what to do there
- approximately how much time to spend

## The Food Trail

Recommend 5 authentic foods or food experiences.

For each:

### Food Name

Explain:
- what it tastes like
- why it is famous
- where or when to try it

## Experiences To Add

Give 4 memorable things to do.

Include different experiences such as:
- sightseeing
- local market
- sunset/sunrise
- culture
- neighborhood exploration
- adventure
- nightlife where appropriate

## Practical Travel Tips

Give exactly 6 useful tips.

Cover:
- transport
- timing
- money
- safety
- weather/clothing
- local etiquette

## Perfect For

Explain who would enjoy this destination.

## Final Note

Finish with a short memorable closing that sounds like advice
from a well-traveled friend.

FORMATTING:

Use Markdown headings.

Use bullet points where appropriate.

Do NOT use tables.

Do NOT add a references section.

Do NOT say "Here is your blog".

Do NOT mention AI.

Target approximately 700-900 words.

The result should feel:

VISUAL
HUMAN
USEFUL
EXCITING
TRAVEL-READY

Return ONLY the finished article.
`;

    const content = await callGroq(prompt);

    return res.status(200).json({
      content,
    });

  } catch (err: any) {
    console.error(
      'Blog generator error:',
      err,
    );

    return res.status(500).json({
      error:
        err?.message ||
        'Failed to generate blog content',
    });
  }
};


/* =========================================================
   3. AI DESTINATION RECOMMENDER
========================================================= */

export const destinationRecommenderHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      budget,
      weather,
      tripType,
    } = req.body;

    if (!budget || !weather || !tripType) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    const prompt = `
You are GhumiGumi's destination recommendation expert.

A traveler selected:

Budget: ${budget}
Weather: ${weather}
Trip Type: ${tripType}

Recommend EXACTLY 5 real destinations that strongly match
these preferences.

Return ONLY valid JSON.

Use EXACTLY this structure:

{
  "destinations": [
    {
      "rank": 1,
      "destination": "Bali",
      "country": "Indonesia",

      "tagline": "A tropical escape where beaches, temples and adventure meet.",

      "whyGo": [
        "Beautiful beaches and relaxing island atmosphere",
        "Excellent mix of culture, nature and adventure",
        "Great choice for a memorable tropical getaway"
      ],

      "bestTime": "April to October",

      "highlights": [
        "Uluwatu Temple",
        "Tegallalang Rice Terraces",
        "Seminyak Beach"
      ],

      "foodToTry": [
        "Nasi Goreng",
        "Mie Goreng",
        "Satay"
      ],

      "estimatedBudget": "$900 - $1,300",

      "travelVibe": "Beach • Adventure • Culture",

      "experience": "Catch sunset at Uluwatu and finish the evening with a local seafood dinner.",

      "localTip": "Start sightseeing early to avoid crowds and afternoon heat."
    }
  ]
}

RULES:

- Return exactly 5 destinations.
- Use ONLY real destinations.
- Each destination must genuinely match:
  budget + weather + trip type.
- Make the five destinations different from each other.
- Do not simply list the world's most famous destinations.
- Prioritize destinations that actually fit the traveler.
- Do not invent attractions.
- Do not invent local foods.
- tagline must be short and exciting.
- whyGo MUST contain exactly 3 points.
- Each whyGo point must be short and meaningful.
- highlights MUST contain exactly 3 real places or experiences.
- foodToTry MUST contain exactly 3 authentic local foods.
- estimatedBudget should be a realistic approximate total trip budget
  for ONE PERSON.
- Use USD for consistency.
- travelVibe must contain exactly 3 short phrases separated by " • ".
- experience must describe ONE memorable thing to do.
- localTip must be practical and destination-specific.
- Keep everything concise.
- Avoid repetitive wording.
- Do not use Markdown.
- Do not use tables.
- Do not use bullet symbols.
- Do not wrap JSON in markdown code fences.
- Return JSON only.
`;

    const rawRecommendations =
      await callGroq(prompt);

    const cleanedRecommendations =
      rawRecommendations
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

    let parsedRecommendations;

    try {
      parsedRecommendations =
        JSON.parse(cleanedRecommendations);
    } catch (parseError) {
      console.error(
        'Destination AI returned invalid JSON:',
        cleanedRecommendations,
      );

      return res.status(500).json({
        error:
          'AI returned an invalid destination format',
      });
    }

    return res.status(200).json({
      recommendations:
        parsedRecommendations.destinations || [],
    });

  } catch (err: any) {
    console.error(
      'Destination recommender error:',
      err,
    );

    return res.status(500).json({
      error:
        err?.message ||
        'Failed to generate recommendations',
    });
  }
};