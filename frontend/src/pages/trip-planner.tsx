// @ts-nocheck

import { useState } from 'react';
import { Link } from 'react-router-dom';

import axiosInstance from '@/helpers/axios-instance';
import ThemeToggle from '@/components/theme-toggle-button';
import AppIcon from '@/assets/svg/app-icon.svg';

/* =========================================================
   TYPES
   ========================================================= */

type Activity = {
  time?: string;
  title?: string;
  description?: string;

  // New richer AI fields
  duration?: string;
  transport?: string;
  transportTime?: string;
  famousFor?: string;
  foodToTry?: string;
  highlights?: string[];
  whyGo?: string[];
  localTip?: string;
  cost?: string;
  category?: string;
};

type DayPlan = {
  day?: number | string;
  title?: string;
  theme?: string;
  activities?: Activity[];
};

type ItineraryData = {
  destination?: string;
  summary?: string;
  totalCost?: string;
  days?: DayPlan[];
};

/* =========================================================
   JSON PARSER
   ========================================================= */

function safeJsonParse(value: string): ItineraryData | null {
  try {
    if (!value || typeof value !== 'string') {
      return null;
    }

    let cleaned = value.trim();

    cleaned = cleaned
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      return null;
    }

    cleaned = cleaned.substring(firstBrace, lastBrace + 1);

    const parsed = JSON.parse(cleaned);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('JSON parsing failed:', error);
    return null;
  }
}

/* =========================================================
   FALLBACK NORMALIZER
   ========================================================= */

function normalizeItinerary(
  raw: string,
  destination: string,
  days: string
): ItineraryData {
  const parsed = safeJsonParse(raw);

  if (parsed?.days && Array.isArray(parsed.days)) {
    return {
      destination: parsed.destination || destination,
      summary:
        parsed.summary ||
        `Your personalized ${days}-day adventure through ${destination}.`,
      totalCost: parsed.totalCost || '',
      days: parsed.days,
    };
  }

  /*
   * Older/plain-text AI response fallback.
   */

  const lines = raw
    .split('\n')
    .map((line) =>
      line
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .trim()
    )
    .filter(Boolean);

  const generatedDays: DayPlan[] = [];

  let currentDay: DayPlan | null = null;
  let currentActivities: Activity[] = [];

  const saveCurrentDay = () => {
    if (currentDay) {
      currentDay.activities = currentActivities;
      generatedDays.push(currentDay);
    }
  };

  lines.forEach((line) => {
    const dayMatch = line.match(/^day\s*(\d+)/i);

    if (dayMatch) {
      saveCurrentDay();

      currentDay = {
        day: Number(dayMatch[1]),
        title:
          line
            .replace(/^day\s*\d+\s*[:\-]?\s*/i, '')
            .trim() || 'Adventure Day',
        theme: 'Explore • Experience • Enjoy',
        activities: [],
      };

      currentActivities = [];

      return;
    }

    if (!currentDay) {
      return;
    }

    const timeMatch = line.match(
      /^(morning|breakfast|mid-morning|afternoon|lunch|evening|dinner|night|late night)\s*[:\-]?\s*(.*)$/i
    );

    if (timeMatch) {
      currentActivities.push({
        time: timeMatch[1],
        title: timeMatch[2] || 'Explore',
        description: '',
        whyGo: [
          'A memorable experience worth adding to your trip.',
          'Perfect for discovering the local character.',
          'A great moment to enjoy the destination.',
        ],
        localTip:
          'Keep some extra time for spontaneous discoveries.',
        cost: 'Budget friendly',
      });

      return;
    }

    if (currentActivities.length === 0) {
      currentActivities.push({
        time: 'Experience',
        title: line.substring(0, 80),
        description: line,
        whyGo: [
          'A memorable stop for your trip.',
          'Great for experiencing the local character.',
          'Worth adding to your travel story.',
        ],
        localTip:
          'Take your time and enjoy the surroundings.',
        cost: 'Varies',
      });

      return;
    }

    const activity =
      currentActivities[currentActivities.length - 1];

    if (!activity.description) {
      activity.description = line;
    } else {
      activity.description += ` ${line}`;
    }
  });

  saveCurrentDay();

  if (generatedDays.length === 0) {
    generatedDays.push({
      day: 1,
      title: `${destination} Highlights`,
      theme: 'Explore • Experience • Enjoy',
      activities: [
        {
          time: 'Morning',
          title: 'Start Your Adventure',
          description:
            raw ||
            `Begin exploring the best of ${destination}.`,
          whyGo: [
            'Start the day with something memorable.',
            'Discover the local atmosphere.',
            'Perfect for getting into travel mode.',
          ],
          localTip:
            'Start early to make the most of your day.',
          cost: 'Varies',
        },
      ],
    });
  }

  return {
    destination,
    summary:
      `Your personalized ${days}-day adventure through ${destination}.`,
    totalCost: '',
    days: generatedDays,
  };
}

/* =========================================================
   TIME ICON
   ========================================================= */

function getTimeIcon(time = '') {
  const value = time.toLowerCase();

  if (
    value.includes('morning') ||
    value.includes('breakfast')
  ) {
    return '🌅';
  }

  if (value.includes('lunch')) {
    return '🍽️';
  }

  if (value.includes('afternoon')) {
    return '☀️';
  }

  if (
    value.includes('evening') ||
    value.includes('dinner')
  ) {
    return '🌆';
  }

  if (value.includes('night')) {
    return '🌙';
  }

  return '✨';
}

/* =========================================================
   TRANSPORT CONNECTOR
   ========================================================= */

function TransportConnector({
  from,
  to,
  transport,
  duration,
}: {
  from?: string;
  to?: string;
  transport?: string;
  duration?: string;
}) {
  const mode = transport || 'Local transport';
  const time = duration || '15–30 min';

  return (
    <div className="relative flex items-center py-5 sm:py-6">
      {/* left line */}
      <div className="hidden h-px flex-1 bg-dark-button sm:block" />

      <div
        className="
          mx-auto
          flex
          w-full
          max-w-md
          items-center
          justify-center
          gap-4
          rounded-2xl
          border
          border-dark-button
          bg-[#17243a]
          px-5
          py-4
          shadow-lg
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#20304a]
            text-xl
          "
        >
          🚌
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
            NEXT STOP
          </p>

          <p className="mt-1 text-sm font-bold text-dark-primary">
            {from || 'Current stop'}
            <span className="mx-2 text-purple-300">→</span>
            {to || 'Next stop'}
          </p>

          <p className="mt-1 text-xs text-dark-secondary">
            {mode} · {time}
          </p>
        </div>

        <span className="text-purple-300">→</span>
      </div>

      {/* right line */}
      <div className="hidden h-px flex-1 bg-dark-button sm:block" />
    </div>
  );
}

/* =========================================================
   ACTIVITY CARD
   ========================================================= */

function ActivityCard({
  activity,
  index,
}: {
  activity: Activity;
  index: number;
}) {
  const whyGo =
    Array.isArray(activity.whyGo) &&
    activity.whyGo.length > 0
      ? activity.whyGo.slice(0, 3)
      : [
          'A memorable experience worth adding to your trip.',
          'Perfect for discovering the local character.',
          'A great moment to enjoy the destination.',
        ];

  const highlights =
    Array.isArray(activity.highlights) &&
    activity.highlights.length > 0
      ? activity.highlights.slice(0, 4)
      : [];

  const timeIcon = getTimeIcon(activity.time);

  return (
    <article
      className="
        overflow-hidden
        rounded-3xl
        border
        border-dark-button/70
        bg-dark-card
        shadow-xl
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-2xl
      "
    >
      {/* =================================================
          CARD TOP
          ================================================= */}

      <div
        className="
          border-b
          border-dark-button
          bg-gradient-to-r
          from-[#1d2b44]
          to-[#202d45]
          px-6
          py-5
        "
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#20304a]
                text-2xl
              "
            >
              {timeIcon}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                {activity.time || 'Experience'}
              </p>

              {activity.category && (
                <p className="mt-1 text-xs font-medium text-dark-secondary">
                  {activity.category}
                </p>
              )}
            </div>
          </div>

          {activity.cost && (
            <div
              className="
                shrink-0
                rounded-full
                bg-[#0c1424]
                px-4
                py-2
                text-sm
                font-bold
                text-white
              "
            >
              💰 {activity.cost}
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          CARD CONTENT
          ================================================= */}

      <div className="p-6">
        <h3
          className="
            text-2xl
            font-black
            leading-tight
            text-dark-primary
            sm:text-3xl
          "
        >
          {activity.title || 'Explore this place'}
        </h3>

        {activity.description && (
          <p
            className="
              mt-4
              text-base
              leading-7
              text-dark-description
            "
          >
            {activity.description}
          </p>
        )}

        {/* =================================================
            QUICK INFO
            ================================================= */}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {activity.duration && (
            <div
              className="
                rounded-2xl
                border
                border-dark-button
                bg-[#17243a]
                p-4
              "
            >
              <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
                ⏱️ Time
              </p>

              <p className="mt-1 text-sm font-semibold text-dark-primary">
                {activity.duration}
              </p>
            </div>
          )}

          {activity.famousFor && (
            <div
              className="
                rounded-2xl
                border
                border-dark-button
                bg-[#17243a]
                p-4
              "
            >
              <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
                ⭐ Famous for
              </p>

              <p className="mt-1 text-sm font-semibold text-dark-primary">
                {activity.famousFor}
              </p>
            </div>
          )}
        </div>

        {/* =================================================
            DON'T MISS
            ================================================= */}

        {highlights.length > 0 && (
          <div
            className="
              mt-5
              rounded-2xl
              border
              border-dark-button
              bg-[#20304a]
              p-5
            "
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">📍</span>

              <h4 className="font-black text-dark-primary">
                DON'T MISS
              </h4>
            </div>

            <ul className="space-y-3">
              {highlights.map((item, itemIndex) => (
                <li
                  key={`${item}-${itemIndex}`}
                  className="
                    flex
                    items-start
                    gap-3
                    text-sm
                    leading-6
                    text-dark-description
                  "
                >
                  <span className="mt-1 text-purple-300">
                    ✦
                  </span>

                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* =================================================
            FOOD
            ================================================= */}

        {activity.foodToTry && (
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-dark-button
              bg-[#1a2940]
              p-5
            "
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🍴</span>

              <div>
                <p className="font-black text-dark-primary">
                  WHAT TO EAT
                </p>

                <p className="mt-1 text-sm leading-6 text-dark-description">
                  {activity.foodToTry}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            WHY GO
            ================================================= */}

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-dark-button
            bg-[#20304a]
            p-5
          "
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">✨</span>

            <h4 className="font-black text-dark-primary">
              WHY GO?
            </h4>
          </div>

          <ul className="space-y-4">
            {whyGo.map((point, pointIndex) => (
              <li
                key={`${point}-${pointIndex}`}
                className="
                  flex
                  items-start
                  gap-3
                  text-sm
                  leading-6
                  text-dark-description
                "
              >
                <span className="mt-1 shrink-0 text-purple-300">
                  ✦
                </span>

                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* =================================================
            LOCAL TIP
            ================================================= */}

        {activity.localTip && (
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-[#38434a]
              bg-[#293238]
              p-4
            "
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>

              <div>
                <p className="font-bold text-yellow-300">
                  Local tip
                </p>

                <p className="mt-1 text-sm leading-6 text-dark-description">
                  {activity.localTip}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   DAY SECTION
   ========================================================= */

function DaySection({
  day,
  dayIndex,
}: {
  day: DayPlan;
  dayIndex: number;
}) {
  const activities = Array.isArray(day.activities)
    ? day.activities
    : [];

  return (
    <section className="mt-14">
      {/* =================================================
          DAY HEADER
          ================================================= */}

      <div className="mb-8 flex items-center gap-5">
        <div
          className="
            flex
            h-16
            w-16
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-purple-500
            to-pink-500
            text-2xl
            font-black
            text-white
            shadow-lg
          "
        >
          {day.day || dayIndex + 1}
        </div>

        <div>
          <p
            className="
              text-sm
              font-bold
              uppercase
              tracking-[0.25em]
              text-purple-300
            "
          >
            DAY {day.day || dayIndex + 1}
          </p>

          <h2
            className="
              mt-1
              text-3xl
              font-black
              text-dark-primary
              sm:text-4xl
            "
          >
            {day.title || 'Your Adventure'}
          </h2>

          {day.theme && (
            <p className="mt-1 text-sm text-dark-secondary">
              {day.theme}
            </p>
          )}
        </div>
      </div>

      {/* =================================================
          TIMELINE
          ================================================= */}

      {activities.length > 0 ? (
        <div>
          {activities.map((activity, index) => {
            const nextActivity = activities[index + 1];

            return (
              <div key={`${day.day}-${index}`}>
                <ActivityCard
                  activity={activity}
                  index={index}
                />

                {nextActivity && (
                  <TransportConnector
                    from={activity.title}
                    to={nextActivity.title}
                    transport={
                      nextActivity.transport ||
                      activity.transport ||
                      'Metro / Bus / Auto'
                    }
                    duration={
                      nextActivity.transportTime ||
                      activity.transportTime ||
                      '15–30 min'
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="
            rounded-2xl
            border
            border-dark-button
            bg-dark-card
            p-6
            text-dark-description
          "
        >
          No activities were returned for this day.
        </div>
      )}
    </section>
  );
}

/* =========================================================
   MAIN TRIP PLANNER
   ========================================================= */

function TripPlanner() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [budget, setBudget] = useState('moderate');
  const [travelers, setTravelers] =
    useState('2 people');

  const [itinerary, setItinerary] =
    useState<ItineraryData | null>(null);

  const [rawItinerary, setRawItinerary] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  /* =================================================
     GENERATE
     ================================================= */

  const handleGenerate = async () => {
    if (!destination.trim() || !days) {
      setError(
        'Please fill in destination and number of days.'
      );

      return;
    }

    setError('');
    setLoading(true);
    setItinerary(null);
    setRawItinerary('');

    try {
      const res =
        await axiosInstance.post(
          '/api/ai/trip-planner',
          {
            destination: destination.trim(),
            days,
            budget,
            travelers,
          }
        );

      const returnedItinerary =
        res?.data?.itinerary;

      if (!returnedItinerary) {
        throw new Error(
          'The AI returned an empty itinerary.'
        );
      }

      const raw =
        typeof returnedItinerary === 'string'
          ? returnedItinerary
          : JSON.stringify(returnedItinerary);

      setRawItinerary(raw);

      const normalized =
        normalizeItinerary(
          raw,
          destination.trim(),
          days
        );

      setItinerary(normalized);

      setTimeout(() => {
        document
          .getElementById('trip-results')
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      }, 100);
    } catch (err) {
      console.error(
        'Trip planner frontend error:',
        err
      );

      const backendMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Unable to create your itinerary right now. Please try again.';

      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  /* =================================================
     COPY
     ================================================= */

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        rawItinerary
      );

      setError('');

      alert('Itinerary copied!');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  /* =================================================
     UI
     ================================================= */

  return (
    <div
      className="
        min-h-screen
        cursor-default
        bg-dark
      "
    >
      {/* =================================================
          HEADER
          ================================================= */}

      <div
        className="
          relative
          h-36
          bg-[url('./assets/wanderlustbg.webp')]
          bg-cover
          bg-center
        "
      >
        <div className="absolute inset-0 bg-black/60" />

        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-between
            px-8
            sm:px-16
          "
        >
          <div className="flex items-center gap-3 text-white">
            <Link to="/">
              <img
                src={AppIcon}
                alt="GhumiGumi"
                className="h-10 w-10"
              />
            </Link>

            <Link
              to="/"
              className="
                text-2xl
                font-semibold
                text-white
                no-underline
              "
            >
              GhumiGumi
            </Link>

            <span className="hidden text-gray-300 sm:block">
              / AI Trip Planner
            </span>
          </div>

          <ThemeToggle />
        </div>
      </div>

      {/* =================================================
          MAIN
          ================================================= */}

      <main
        className="
          mx-auto
          max-w-6xl
          px-4
          py-10
          sm:px-6
        "
      >
        {/* =================================================
            TITLE
            ================================================= */}

        <div className="mb-10 text-center">
          <h1
            className="
              text-4xl
              font-black
              text-dark-primary
              sm:text-5xl
            "
          >
            🗺️ AI Trip Planner
          </h1>

          <p
            className="
              mx-auto
              mt-3
              max-w-2xl
              text-base
              leading-7
              text-dark-secondary
              sm:text-lg
            "
          >
            Tell us where you're going, and
            GhumiGumi will turn your trip into a
            beautiful day-by-day adventure.
          </p>
        </div>

        {/* =================================================
            FORM
            ================================================= */}

        <div
          className="
            mx-auto
            max-w-5xl
            rounded-3xl
            bg-dark-card
            p-6
            shadow-2xl
            sm:p-8
          "
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {/* DESTINATION */}

            <div className="sm:col-span-2">
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-bold
                  text-dark-primary
                "
              >
                📍 Where are you going?
              </label>

              <input
                type="text"
                value={destination}
                onChange={(event) =>
                  setDestination(
                    event.target.value
                  )
                }
                placeholder="e.g. New Delhi, Goa, Paris, Bali"
                className="
                  w-full
                  rounded-xl
                  bg-dark-field
                  p-4
                  text-base
                  text-dark-textInField
                  outline-none
                  placeholder:text-dark-secondary
                  focus:ring-2
                  focus:ring-purple-400
                "
              />
            </div>

            {/* DAYS */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-bold
                  text-dark-primary
                "
              >
                🗓️ Number of Days
              </label>

              <input
                type="number"
                value={days}
                onChange={(event) =>
                  setDays(event.target.value)
                }
                placeholder="e.g. 4"
                min="1"
                max="14"
                className="
                  w-full
                  rounded-xl
                  bg-dark-field
                  p-4
                  text-base
                  text-dark-textInField
                  outline-none
                  focus:ring-2
                  focus:ring-purple-400
                "
              />
            </div>

            {/* BUDGET */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-bold
                  text-dark-primary
                "
              >
                💰 Travel Style
              </label>

              <select
                value={budget}
                onChange={(event) =>
                  setBudget(event.target.value)
                }
                className="
                  w-full
                  rounded-xl
                  bg-dark-field
                  p-4
                  text-base
                  text-dark-textInField
                  outline-none
                  focus:ring-2
                  focus:ring-purple-400
                "
              >
                <option value="budget">
                  💰 Budget
                </option>

                <option value="moderate">
                  💳 Moderate
                </option>

                <option value="luxury">
                  💎 Luxury
                </option>
              </select>
            </div>

            {/* TRAVELERS */}

            <div className="sm:col-span-2">
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-bold
                  text-dark-primary
                "
              >
                🧳 Who's travelling?
              </label>

              <select
                value={travelers}
                onChange={(event) =>
                  setTravelers(
                    event.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  bg-dark-field
                  p-4
                  text-base
                  text-dark-textInField
                  outline-none
                  focus:ring-2
                  focus:ring-purple-400
                "
              >
                <option value="solo traveler">
                  🧍 Solo Traveler
                </option>

                <option value="2 people">
                  👫 Couple
                </option>

                <option value="family with kids">
                  👨‍👩‍👧 Family with Kids
                </option>

                <option value="group of friends">
                  👥 Group of Friends
                </option>
              </select>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div
              className="
                mt-5
                rounded-xl
                bg-red-500/10
                px-5
                py-4
                text-sm
                text-red-400
              "
            >
              ⚠️ {error}
            </div>
          )}

          {/* BUTTON */}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
              rounded-xl
              bg-light
              p-4
              text-base
              font-bold
              text-dark
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading
              ? '✨ Creating your adventure...'
              : '✨ Generate My Adventure'}
          </button>
        </div>

        {/* =================================================
            LOADING
            ================================================= */}

        {loading && (
          <div
            className="
              mt-12
              flex
              flex-col
              items-center
              justify-center
            "
          >
            <div
              className="
                h-12
                w-12
                animate-spin
                rounded-full
                border-4
                border-gray-700
                border-t-white
              "
            />

            <p
              className="
                mt-5
                text-base
                font-semibold
                text-dark-primary
              "
            >
              ✨ Building your perfect adventure...
            </p>

            <p className="mt-1 text-sm text-dark-secondary">
              Planning places, food, transport and
              experiences.
            </p>
          </div>
        )}

        {/* =================================================
            RESULTS
            ================================================= */}

        {itinerary && !loading && (
          <div
            id="trip-results"
            className="mt-14"
          >
            <div
              className="
                rounded-3xl
                bg-dark-card
                p-6
                shadow-2xl
                sm:p-8
              "
            >
              {/* RESULT HEADER */}

              <div
                className="
                  flex
                  flex-col
                  justify-between
                  gap-5
                  border-b
                  border-dark-button
                  pb-7
                  sm:flex-row
                  sm:items-center
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                      uppercase
                      tracking-[0.25em]
                      text-purple-300
                    "
                  >
                    YOUR AI-GENERATED ADVENTURE
                  </p>

                  <h2
                    className="
                      mt-2
                      text-3xl
                      font-black
                      text-dark-primary
                      sm:text-4xl
                    "
                  >
                    {itinerary.destination ||
                      destination}
                  </h2>

                  {itinerary.summary && (
                    <p
                      className="
                        mt-3
                        max-w-3xl
                        text-base
                        leading-7
                        text-dark-secondary
                      "
                    >
                      {itinerary.summary}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleCopy}
                  className="
                    rounded-xl
                    border
                    border-dark-button
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-dark-primary
                    transition
                    hover:bg-dark-button
                  "
                >
                  📋 Copy
                </button>
              </div>

              {/* TOTAL COST */}

              {itinerary.totalCost && (
                <div
                  className="
                    mt-6
                    inline-flex
                    rounded-full
                    border
                    border-dark-button
                    bg-[#20304a]
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-dark-primary
                  "
                >
                  💰 Estimated trip cost:{' '}
                  {itinerary.totalCost}
                </div>
              )}

              {/* =================================================
                  TRIP FLOW INTRO
                  ================================================= */}

              <div
                className="
                  mt-7
                  rounded-2xl
                  border
                  border-purple-400/20
                  bg-[#17243a]
                  p-5
                "
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🧭</span>

                  <div>
                    <p className="font-black text-dark-primary">
                      YOUR TRIP FLOW
                    </p>

                    <p className="mt-1 text-sm leading-6 text-dark-secondary">
                      Start with the morning, follow the
                      suggested route, stop for local food,
                      explore the afternoon and finish the
                      day somewhere worth remembering.
                    </p>
                  </div>
                </div>
              </div>

              {/* DAYS */}

              {Array.isArray(itinerary.days) &&
                itinerary.days.map(
                  (day, index) => (
                    <DaySection
                      key={`${day.day}-${index}`}
                      day={day}
                      dayIndex={index}
                    />
                  )
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TripPlanner;