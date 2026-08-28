// @ts-nocheck

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import axiosInstance from '@/helpers/axios-instance';
import ThemeToggle from '@/components/theme-toggle-button';
import AppIcon from '@/assets/svg/app-icon.svg';

function DestinationRecommender() {
  const [budget, setBudget] = useState('');
  const [weather, setWeather] = useState('');
  const [tripType, setTripType] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!budget || !weather || !tripType) {
      setError('Please answer all 3 questions.');
      return;
    }

    setError('');
    setLoading(true);
    setRecommendations([]);

    try {
      const res = await axiosInstance.post(
        '/api/ai/destination-recommender',
        {
          budget,
          weather,
          tripType,
        },
      );

      setRecommendations(
        res.data.recommendations || [],
      );
    } catch (err) {
      console.error(err);
      setError(
        'Failed to get recommendations. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const options = {
    budget: [
      {
        value: 'under $500',
        label: '💰 Under $500',
      },
      {
        value: '$500 - $1500',
        label: '💳 $500 – $1500',
      },
      {
        value: '$1500 - $3000',
        label: '✈️ $1500 – $3000',
      },
      {
        value: 'above $3000',
        label: '💎 Above $3000',
      },
    ],

    weather: [
      {
        value: 'hot and sunny',
        label: '☀️ Hot & Sunny',
      },
      {
        value: 'cool and mild',
        label: '🌤️ Cool & Mild',
      },
      {
        value: 'cold and snowy',
        label: '❄️ Cold & Snowy',
      },
      {
        value: 'tropical and humid',
        label: '🌴 Tropical',
      },
    ],

    tripType: [
      {
        value: 'adventure and hiking',
        label: '🏔️ Adventure & Hiking',
      },
      {
        value: 'beach and relaxation',
        label: '🏖️ Beach & Relaxation',
      },
      {
        value: 'cultural and historical',
        label: '🏛️ Cultural & Historical',
      },
      {
        value: 'food and nightlife',
        label: '🍜 Food & Nightlife',
      },
      {
        value: 'family friendly',
        label: '👨‍👩‍👧 Family Friendly',
      },
      {
        value: 'romantic getaway',
        label: '💑 Romantic Getaway',
      },
    ],
  };

  const OptionButton = ({
    value,
    label,
    selected,
    onClick,
  }) => (
    <button
      onClick={onClick}
      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
        selected
          ? 'border-neutral-800 bg-neutral-800 text-white dark:border-white dark:bg-white dark:text-neutral-900'
          : 'border-zinc-300 bg-zinc-100 text-light-secondary hover:bg-zinc-200 dark:border-dark-button dark:bg-dark-field dark:text-dark-secondary dark:hover:bg-dark-button'
      }`}
    >
      {label}
    </button>
  );

  const goToTripPlanner = (destination) => {
    navigate(
      `/trip-planner?destination=${encodeURIComponent(
        destination,
      )}`,
    );
  };

  return (
    <div className="min-h-screen cursor-default bg-light dark:bg-dark">

      {/* HEADER */}

      <div className="relative h-36 bg-[url('./assets/wanderlustbg.webp')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black opacity-50" />

        <div className="absolute inset-0 flex items-center justify-between px-8 sm:px-16">

          <div className="flex items-center gap-3">

            <Link to="/">
              <img
                src={AppIcon}
                className="h-10 w-10"
                alt="GhumiGumi"
              />
            </Link>

            <Link
              to="/"
              className="text-2xl font-semibold text-white no-underline"
            >
              GhumiGumi
            </Link>

            <span className="hidden text-gray-300 sm:block">
              / Destination Finder
            </span>

          </div>

          <ThemeToggle />

        </div>
      </div>

      {/* MAIN */}

      <div className="mx-auto max-w-5xl px-4 py-10">

        {/* TITLE */}

        <div className="mb-2 text-center">

          <div className="mb-3 inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-light-secondary shadow-sm dark:border-dark-button dark:bg-dark-card dark:text-dark-secondary">
            ✨ AI-powered travel discovery
          </div>

          <h1 className="text-3xl font-bold text-light-primary dark:text-dark-primary sm:text-4xl">
            🌍 Find Your Next Adventure
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-light-secondary dark:text-dark-secondary">
            Tell us what you want from your trip and
            GhumiGumi will discover destinations that
            actually fit your travel style.
          </p>

        </div>

        {/* QUESTIONS */}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-dark-card sm:p-8">

          {/* BUDGET */}

          <div className="mb-7">

            <div className="mb-3 flex items-center gap-2">

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold dark:bg-dark-field">
                1
              </span>

              <p className="text-sm font-semibold text-light-primary dark:text-dark-primary">
                What's your budget per person?
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              {options.budget.map((o) => (
                <OptionButton
                  key={o.value}
                  value={o.value}
                  label={o.label}
                  selected={budget === o.value}
                  onClick={() => setBudget(o.value)}
                />
              ))}

            </div>

          </div>

          {/* WEATHER */}

          <div className="mb-7">

            <div className="mb-3 flex items-center gap-2">

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold dark:bg-dark-field">
                2
              </span>

              <p className="text-sm font-semibold text-light-primary dark:text-dark-primary">
                What weather do you prefer?
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              {options.weather.map((o) => (
                <OptionButton
                  key={o.value}
                  value={o.value}
                  label={o.label}
                  selected={weather === o.value}
                  onClick={() => setWeather(o.value)}
                />
              ))}

            </div>

          </div>

          {/* TRIP TYPE */}

          <div className="mb-7">

            <div className="mb-3 flex items-center gap-2">

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold dark:bg-dark-field">
                3
              </span>

              <p className="text-sm font-semibold text-light-primary dark:text-dark-primary">
                What kind of trip are you dreaming of?
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              {options.tripType.map((o) => (
                <OptionButton
                  key={o.value}
                  value={o.value}
                  label={o.label}
                  selected={tripType === o.value}
                  onClick={() => setTripType(o.value)}
                />
              ))}

            </div>

          </div>

          {error && (
            <p className="mb-3 text-xs text-red-500">
              {error}
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-neutral-800 p-3.5 text-base font-semibold text-white transition hover:bg-neutral-700 disabled:bg-neutral-600 dark:bg-light dark:text-dark dark:hover:bg-dark-secondary/80"
          >
            {loading
              ? '🌍 Discovering your destinations...'
              : '🌍 Find My Destinations'}
          </button>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="mt-10 flex flex-col items-center gap-4">

            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-neutral-800 dark:border-gray-700 dark:border-t-white" />

            <div className="text-center">

              <p className="text-sm font-medium text-light-primary dark:text-dark-primary">
                Finding places you'll love...
              </p>

              <p className="mt-1 text-xs text-light-tertiary dark:text-dark-tertiary">
                Matching destinations to your travel personality
              </p>

            </div>

          </div>
        )}

        {/* RESULTS */}

        {recommendations.length > 0 &&
          !loading && (

            <div className="mt-10">

              {/* RESULT HEADER */}

              <div className="mb-6">

                <p className="text-xs font-semibold uppercase tracking-wider text-light-tertiary dark:text-dark-tertiary">
                  Your AI travel matches
                </p>

                <h2 className="mt-1 text-2xl font-bold text-light-primary dark:text-dark-primary">
                  ✨ Places worth packing for
                </h2>

                <p className="mt-1 text-sm text-light-secondary dark:text-dark-secondary">
                  Five destinations selected around your preferences.
                </p>

              </div>

              {/* DESTINATION CARDS */}

              <div className="space-y-6">

                {recommendations.map(
                  (destination, index) => (

                    <div
                      key={`${destination.destination}-${index}`}
                      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-dark-button dark:bg-dark-card"
                    >

                      {/* CARD TOP */}

                      <div className="border-b border-zinc-100 p-6 dark:border-dark-button sm:p-7">

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                          <div>

                            <div className="mb-2 flex items-center gap-2">

                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-light-primary dark:bg-dark-field dark:text-dark-primary">
                                {destination.rank ||
                                  index + 1}
                              </span>

                              <span className="text-xs font-medium uppercase tracking-wider text-light-tertiary dark:text-dark-tertiary">
                                AI Match #{destination.rank ||
                                  index + 1}
                              </span>

                            </div>

                            <h3 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                              {destination.destination}
                            </h3>

                            <p className="mt-1 text-sm text-light-secondary dark:text-dark-secondary">
                              {destination.country}
                            </p>

                          </div>

                          <div className="rounded-xl bg-zinc-100 px-4 py-3 dark:bg-dark-field">

                            <p className="text-[10px] font-semibold uppercase tracking-wider text-light-tertiary dark:text-dark-tertiary">
                              Estimated trip
                            </p>

                            <p className="mt-1 text-sm font-bold text-light-primary dark:text-dark-primary">
                              {destination.estimatedBudget}
                            </p>

                          </div>

                        </div>

                        {/* VIBE */}

                        <div className="mt-5 flex flex-wrap gap-2">

                          {(destination.travelVibe || '')
                            .split('•')
                            .map(
                              (vibe, i) => (
                                <span
                                  key={i}
                                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-light-secondary dark:border-dark-button dark:bg-dark-field dark:text-dark-secondary"
                                >
                                  {vibe.trim()}
                                </span>
                              ),
                            )}

                        </div>

                      </div>

                      {/* CARD CONTENT */}

                      <div className="grid gap-0 sm:grid-cols-2">

                        {/* WHY GO */}

                        <div className="border-b border-zinc-100 p-6 dark:border-dark-button sm:border-r">

                          <div className="mb-4 flex items-center gap-2">

                            <span className="text-lg">
                              ✨
                            </span>

                            <h4 className="text-sm font-bold text-light-primary dark:text-dark-primary">
                              Why you should go
                            </h4>

                          </div>

                          <div className="space-y-3">

                            {(destination.whyGo || []).map(
                              (point, i) => (

                                <div
                                  key={i}
                                  className="flex gap-3"
                                >

                                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold dark:bg-dark-field">
                                    {i + 1}
                                  </span>

                                  <p className="text-sm leading-relaxed text-light-description dark:text-dark-description">
                                    {point}
                                  </p>

                                </div>

                              ),
                            )}

                          </div>

                        </div>

                        {/* BEST TIME */}

                        <div className="border-b border-zinc-100 p-6 dark:border-dark-button">

                          <div className="mb-4 flex items-center gap-2">

                            <span className="text-lg">
                              🗓️
                            </span>

                            <h4 className="text-sm font-bold text-light-primary dark:text-dark-primary">
                              Best time to visit
                            </h4>

                          </div>

                          <p className="text-sm leading-relaxed text-light-description dark:text-dark-description">
                            {destination.bestTime}
                          </p>

                          <div className="mt-4 rounded-xl bg-zinc-50 p-3 dark:bg-dark-field">

                            <p className="text-xs text-light-secondary dark:text-dark-secondary">
                              Plan your visit around this season for the best experience.
                            </p>

                          </div>

                        </div>

                        {/* HIGHLIGHTS */}

                        <div className="border-b border-zinc-100 p-6 dark:border-dark-button sm:border-r">

                          <div className="mb-4 flex items-center gap-2">

                            <span className="text-lg">
                              📍
                            </span>

                            <h4 className="text-sm font-bold text-light-primary dark:text-dark-primary">
                              Don't miss these
                            </h4>

                          </div>

                          <div className="space-y-2">

                            {(destination.highlights || []).map(
                              (place, i) => (

                                <div
                                  key={i}
                                  className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-dark-field"
                                >

                                  <span className="text-xs font-bold text-light-tertiary dark:text-dark-tertiary">
                                    0{i + 1}
                                  </span>

                                  <span className="text-sm text-light-description dark:text-dark-description">
                                    {place}
                                  </span>

                                </div>

                              ),
                            )}

                          </div>

                        </div>

                        {/* FOOD */}

                        <div className="border-b border-zinc-100 p-6 dark:border-dark-button">

                          <div className="mb-4 flex items-center gap-2">

                            <span className="text-lg">
                              🍜
                            </span>

                            <h4 className="text-sm font-bold text-light-primary dark:text-dark-primary">
                              Eat like a local
                            </h4>

                          </div>

                          <div className="flex flex-wrap gap-2">

                            {(destination.foodToTry || []).map(
                              (food, i) => (

                                <span
                                  key={i}
                                  className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-light-secondary dark:border-dark-button dark:text-dark-secondary"
                                >
                                  {food}
                                </span>

                              ),
                            )}

                          </div>

                        </div>

                      </div>

                      {/* TIP + CTA */}

                      <div className="flex flex-col gap-4 bg-zinc-50 p-6 dark:bg-dark-field sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex gap-3">

                          <span className="text-lg">
                            💡
                          </span>

                          <div>

                            <p className="text-xs font-bold text-light-primary dark:text-dark-primary">
                              Local tip
                            </p>

                            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-light-secondary dark:text-dark-secondary">
                              {destination.localTip}
                            </p>

                          </div>

                        </div>

                        <button
                          onClick={() =>
                            goToTripPlanner(
                              destination.destination,
                            )
                          }
                          className="shrink-0 rounded-lg bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-light dark:text-dark dark:hover:bg-dark-secondary/80"
                        >
                          Plan this trip →
                        </button>

                      </div>

                    </div>

                  ),
                )}

              </div>

              {/* FOOTER CTA */}

              <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-dark-button dark:bg-dark-card">

                <p className="text-sm font-semibold text-light-primary dark:text-dark-primary">
                  Found somewhere you love? 🌍
                </p>

                <p className="mt-1 text-xs text-light-secondary dark:text-dark-secondary">
                  Turn any destination into a complete day-by-day itinerary.
                </p>

                <Link
                  to="/trip-planner"
                  className="mt-4 inline-block text-sm font-semibold text-light-primary underline dark:text-dark-primary"
                >
                  Open AI Trip Planner →
                </Link>

              </div>

            </div>
          )}

      </div>
    </div>
  );
}

export default DestinationRecommender;