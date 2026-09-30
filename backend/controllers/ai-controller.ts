import { Request, Response } from 'express';

import {
  getTravelIntelligence,
} from '../services/travel-tools.js';

const GROQ_API_URL =
  'https://api.groq.com/openai/v1/chat/completions';

const GROQ_MODEL =
  'openai/gpt-oss-20b';

type GroqMessage = {
  role: string;
  content?: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
};

const travelTools = [
  {
    type: 'function',
    function: {
      name: 'get_travel_intelligence',
      description:
        'Gather real travel information for a destination, including geographic location, current and forecast weather, real attractions, and an estimated trip budget.',
      parameters: {
        type: 'object',
        properties: {
          destination: {
            type: 'string',
            description: 'Travel destination',
          },
          days: {
            type: 'number',
            description: 'Number of travel days',
          },
          travelers: {
            type: 'number',
            description: 'Number of travelers',
          },
          budgetTier: {
            type: 'string',
            enum: ['budget', 'moderate', 'luxury'],
            description: 'Travel budget style',
          },
        },
        required: [
          'destination',
          'days',
          'travelers',
          'budgetTier',
        ],
      },
    },
  },
];

const calculateBudget = ({
  days,
  travelers,
  budgetTier,
}: {
  days: number;
  travelers: number;
  budgetTier: 'budget' | 'moderate' | 'luxury';
}) => {
  const multiplier = {
    budget: 1,
    moderate: 1.7,
    luxury: 3,
  }[budgetTier];

  const accommodation =
    Math.round(1200 * multiplier * days * travelers);

  const food =
    Math.round(700 * multiplier * days * travelers);

  const localTransport =
    Math.round(350 * multiplier * days * travelers);

  const activities =
    Math.round(500 * multiplier * days * travelers);

  const subtotal =
    accommodation +
    food +
    localTransport +
    activities;

  const emergencyBuffer =
    Math.round(subtotal * 0.1);

  const total =
    subtotal + emergencyBuffer;

  return {
    currency: 'INR',
    accommodation,
    food,
    localTransport,
    activities,
    emergencyBuffer,
    total,
    perPerson:
      Math.round(total / travelers),
  };
};

const callGroq = async (
  messages: GroqMessage[],
  includeTools = false,
) => {
  const apiKey =
    process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not configured',
    );
  }

  const body: Record<string, unknown> = {
    model: GROQ_MODEL,
    messages,
    temperature: 0.3,
    max_tokens: 1800,
  };

  if (includeTools) {
    body.tools = travelTools;
    body.tool_choice = 'required';
  }

  const response = await fetch(
    GROQ_API_URL,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',

        Authorization:
          `Bearer ${apiKey}`,
      },

      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      'Groq API error:',
      errorText,
    );

    throw new Error(
      'Groq API request failed',
    );
  }

  return response.json();
};

const executeTravelIntelligence = async (
  argumentsString: string,
) => {
  const args =
    JSON.parse(argumentsString);

  const destination =
    String(args.destination).trim();

  const days =
    Number(args.days);

  const travelers =
    Number(args.travelers);

  const budgetTier =
    args.budgetTier as
      | 'budget'
      | 'moderate'
      | 'luxury';

  const travelData =
    await getTravelIntelligence(
      destination,
      days,
    );

  const budget =
    calculateBudget({
      days,
      travelers,
      budgetTier,
    });

  return {
    location:
      travelData.location,

    weather:
      travelData.weather,

    places:
      travelData.places,

    budget,
  };
};

const runTravelAgent = async ({
  destination,
  days,
  budget,
  travelers,
}: {
  destination: string;
  days: number;
  budget: string;
  travelers: number;
}) => {
  const agentSteps: string[] = [
    'Understanding your trip requirements',
  ];

  const messages: GroqMessage[] = [
    {
      role: 'system',

      content: `
You are GhumiGumi AI Travel Agent.

You must use the get_travel_intelligence tool to gather real travel data before creating the itinerary.

The tool provides:
- destination coordinates
- current and forecast weather
- real nearby attractions
- estimated budget

Do not invent live travel data.

After receiving the tool result, create a practical itinerary.

Consider weather when scheduling outdoor activities.

Clearly label costs as estimates.

Do not claim hotel or flight availability.

Create:
1. Trip Overview
2. Destination Information
3. Weather Overview
4. Estimated Budget
5. Day-by-Day Itinerary
6. Real Attractions
7. Food Recommendations
8. Travel Tips
9. Weather-Based Suggestions
10. Final Recommendation
`,
    },

    {
      role: 'user',

      content: `
Plan a ${days}-day trip to ${destination}
for ${travelers} traveler(s).

Budget style: ${budget}

Use the travel intelligence tool first.
`,
    },
  ];

  const firstResponse =
    await callGroq(
      messages,
      true,
    );

  const firstMessage =
    firstResponse.choices?.[0]?.message;

  const toolCalls =
    firstMessage?.tool_calls || [];

  let travelData: any = null;

  if (toolCalls.length > 0) {
    const toolCall =
      toolCalls[0];

    agentSteps.push(
      'Gathering live travel information',
    );

    travelData =
      await executeTravelIntelligence(
        toolCall.function.arguments,
      );

    agentSteps.push(
      'Checking destination weather',
    );

    agentSteps.push(
      'Finding real attractions',
    );

    agentSteps.push(
      'Calculating estimated budget',
    );
  } else {
    agentSteps.push(
      'Gathering live travel information',
    );

    travelData =
      await executeTravelIntelligence(
        JSON.stringify({
          destination,
          days,
          travelers,
          budgetTier: budget,
        }),
      );
  }

  const finalMessages: GroqMessage[] = [
    {
      role: 'system',

      content: `
You are GhumiGumi AI Travel Agent.

Create the final travel itinerary using the live travel data provided below.

IMPORTANT:
- Do not call tools.
- Do not invent weather.
- Do not invent coordinates.
- Use the real attractions from the provided data.
- Treat all prices as estimates.
- Do not claim hotel or flight availability.
- Consider weather when arranging outdoor activities.
- Keep each day realistic.
- Group nearby attractions when possible.

Format the response clearly with:

Trip Overview

Destination Information

Weather Overview

Estimated Budget

Day-by-Day Itinerary

Real Attractions

Food Recommendations

Travel Tips

Weather-Based Suggestions

Final Recommendation
`,
    },

    {
      role: 'user',

      content: `
Create the final itinerary.

Destination: ${destination}
Days: ${days}
Travelers: ${travelers}
Budget Style: ${budget}

LIVE TRAVEL DATA:
${JSON.stringify(
  travelData,
  null,
  2,
)}
`,
    },
  ];

  agentSteps.push(
    'Generating personalized itinerary',
  );

  const finalResponse =
    await callGroq(
      finalMessages,
      false,
    );

  const finalMessage =
    finalResponse.choices?.[0]?.message;

  return {
    itinerary:
      finalMessage?.content ||
      'Unable to generate itinerary.',

    agentSteps,
    travelData,
  };
};

export const travelAgentHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      destination,
      days,
      budget = 'moderate',
      travelers = 2,
    } = req.body;

    if (!destination || !days) {
      return res.status(400).json({
        error:
          'Destination and days are required',
      });
    }

    const parsedDays =
      Number(days);

    const parsedTravelers =
      Number(travelers);

    if (
      !Number.isFinite(parsedDays) ||
      parsedDays < 1 ||
      parsedDays > 16
    ) {
      return res.status(400).json({
        error:
          'Days must be between 1 and 16',
      });
    }

    if (
      !Number.isFinite(parsedTravelers) ||
      parsedTravelers < 1 ||
      parsedTravelers > 20
    ) {
      return res.status(400).json({
        error:
          'Travelers must be between 1 and 20',
      });
    }

    const result =
      await runTravelAgent({
        destination:
          String(destination).trim(),

        days:
          parsedDays,

        budget:
          String(budget),

        travelers:
          parsedTravelers,
      });

    return res.status(200).json(
      result,
    );
  } catch (error) {
    console.error(
      'Travel agent error:',
      error,
    );

    return res.status(500).json({
      error:
        'Failed to generate travel plan',
    });
  }
};

export const tripPlannerHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      destination,
      days,
      budget = 'moderate',
      travelers = 2,
    } = req.body;

    if (!destination || !days) {
      return res.status(400).json({
        error: 'Destination and days are required',
      });
    }

    const parsedDays = Number(days);
    const parsedTravelers = Number(travelers);

    if (!Number.isFinite(parsedDays) || parsedDays < 1 || parsedDays > 16) {
      return res.status(400).json({
        error: 'Days must be between 1 and 16',
      });
    }

    if (
      !Number.isFinite(parsedTravelers) ||
      parsedTravelers < 1 ||
      parsedTravelers > 20
    ) {
      return res.status(400).json({
        error: 'Travelers must be between 1 and 20',
      });
    }

    const result = await runTravelAgent({
      destination: String(destination).trim(),
      days: parsedDays,
      budget: String(budget),
      travelers: parsedTravelers,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Trip planner error:', error);

    return res.status(500).json({
      error: 'Failed to generate itinerary',
    });
  }
};

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
You are a travel blogger.

Write a complete travel blog post.

Topic: ${topic}
Destination: ${destination || topic}
Style: ${style || 'engaging and descriptive'}

Include:

1. Three catchy title suggestions
2. Introduction
3. Detailed body
4. Travel tips
5. Conclusion

Write at least 400 words.
`;

    const response =
      await callGroq(
        [
          {
            role: 'user',
            content: prompt,
          },
        ],
        false,
      );

    return res.status(200).json({
      content:
        response.choices?.[0]?.message
          ?.content || '',
    });
  } catch (error) {
    console.error(
      'Blog generator error:',
      error,
    );

    return res.status(500).json({
      error:
        'Failed to generate blog content',
    });
  }
};

export const destinationRecommenderHandler =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const {
        budget,
        weather,
        tripType,
      } = req.body;

      if (
        !budget ||
        !weather ||
        !tripType
      ) {
        return res.status(400).json({
          error:
            'All fields are required',
        });
      }

      const prompt = `
You are a travel expert.

Recommend 5 travel destinations for:

Budget: ${budget}
Preferred Weather: ${weather}
Trip Type: ${tripType}

For each destination provide:
- Destination
- Why it matches
- Best time to visit
- Attractions
- Estimated budget
- One travel tip

Number them 1 to 5.
`;

      const response =
        await callGroq(
          [
            {
              role: 'user',
              content: prompt,
            },
          ],
          false,
        );

      return res.status(200).json({
        recommendations:
          response.choices?.[0]?.message
            ?.content || '',
      });
    } catch (error) {
      console.error(
        'Destination recommender error:',
        error,
      );

      return res.status(500).json({
        error:
          'Failed to generate recommendations',
      });
    }
  };
