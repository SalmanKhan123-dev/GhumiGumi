// @ts-nocheck

import { useState } from 'react';
import { Link } from 'react-router-dom';

import axiosInstance from '@/helpers/axios-instance';
import ThemeToggle from '@/components/theme-toggle-button';
import AppIcon from '@/assets/svg/app-icon.svg';
import TravelMap from '@/components/travel-map';

function TripPlanner() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [budget, setBudget] = useState('moderate');
  const [travelers, setTravelers] = useState('2');

  const [itinerary, setItinerary] = useState('');
  const [agentSteps, setAgentSteps] = useState<string[]>([]);
  const [travelData, setTravelData] = useState<any>(null);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!destination.trim() || !days) {
      setError('Please fill in destination and number of days.');
      return;
    }

    setError('');
    setLoading(true);
    setItinerary('');
    setAgentSteps([]);

    try {
      const res = await axiosInstance.post('/api/ai/travel-agent', {
        destination,
        days: Number(days),
        budget,
        travelers: Number(travelers),
        savedPlaces,
      });

      setItinerary(res.data.itinerary || '');
      setAgentSteps(res.data.agentSteps || []);
      setTravelData(res.data.travelData || null);
    } catch (error) {
      console.error(error);

      setError('Failed to generate your travel plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(itinerary);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="min-h-screen cursor-default bg-light dark:bg-dark">
      {/* HEADER */}

      <div className="relative h-36 bg-[url('./assets/wanderlustbg.webp')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="absolute inset-0 flex items-center justify-between px-8 sm:px-16">
          <div className="flex items-center gap-3 text-white">
            <Link to="/">
              <img src={AppIcon} className="h-10 w-10" alt="GhumiGumi" />
            </Link>

            <Link to="/" className="text-2xl font-semibold text-white no-underline">
              GhumiGumi
            </Link>

            <span className="hidden text-gray-300 sm:block">/ AI Travel Agent</span>
          </div>

          <ThemeToggle />
        </div>
      </div>

      {/* MAIN */}

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* TITLE */}

        <div className="mb-2 text-center">
          <h1 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
            🤖 AI Travel Agent
          </h1>

          <p className="mt-2 text-sm text-light-secondary dark:text-dark-secondary">
            Tell GhumiGumi about your trip and let the AI build a personalized travel plan
          </p>
        </div>

        {/* INPUT CARD */}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-dark-card">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* DESTINATION */}

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-light-secondary dark:text-dark-secondary">
                Destination *
              </label>

              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Manali, Goa, Paris, Bali"
                className="w-full rounded-lg bg-zinc-100 p-3 text-sm placeholder:text-sm dark:bg-dark-field dark:text-dark-textInField"
              />
            </div>

            {/* DAYS */}

            <div>
              <label className="mb-1 block text-sm font-medium text-light-secondary dark:text-dark-secondary">
                Number of Days *
              </label>

              <input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="e.g. 5"
                min="1"
                max="30"
                className="w-full rounded-lg bg-zinc-100 p-3 text-sm placeholder:text-sm dark:bg-dark-field dark:text-dark-textInField"
              />
            </div>

            {/* BUDGET */}

            <div>
              <label className="mb-1 block text-sm font-medium text-light-secondary dark:text-dark-secondary">
                Travel Style
              </label>

              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-lg bg-zinc-100 p-3 text-sm dark:bg-dark-field dark:text-dark-textInField"
              >
                <option value="budget">💰 Budget</option>

                <option value="moderate">💳 Moderate</option>

                <option value="luxury">💎 Luxury</option>
              </select>
            </div>

            {/* TRAVELERS */}

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-light-secondary dark:text-dark-secondary">
                Number of Travelers
              </label>

              <select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full rounded-lg bg-zinc-100 p-3 text-sm dark:bg-dark-field dark:text-dark-textInField"
              >
                <option value="1">🧍 1 Traveler</option>

                <option value="2">👫 2 Travelers</option>

                <option value="3">👥 3 Travelers</option>

                <option value="4">👥 4 Travelers</option>

                <option value="5">👥 5 Travelers</option>

                <option value="6">👥 6 Travelers</option>

                <option value="10">👥 10 Travelers</option>
              </select>
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

          {/* BUTTON */}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center rounded-lg bg-neutral-800 p-3 text-base font-semibold text-white disabled:bg-neutral-600 dark:bg-light dark:text-dark dark:hover:bg-dark-secondary/80"
          >
            {loading ? '🤖 AI Agent is planning...' : '✨ Plan My Trip'}
          </button>
        </div>

        {/* AGENT ACTIVITY */}

        {agentSteps.length > 0 && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-dark-card">
            <div className="mb-4">
              <h2 className="font-bold text-light-primary dark:text-dark-primary">
                🤖 Agent Activity
              </h2>

              <p className="mt-1 text-xs text-light-secondary dark:text-dark-secondary">
                GhumiGumi AI is working through your request
              </p>
            </div>

            <div className="space-y-3">
              {agentSteps.map((step, index) => (
                <div
                  key={`${step}-${index}`}
                  className="flex items-center gap-3 rounded-lg bg-zinc-100 px-4 py-3 dark:bg-dark-field"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-xs text-white dark:bg-light dark:text-dark">
                    ✓
                  </div>

                  <p className="text-sm text-light-description dark:text-dark-description">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="mt-8 flex flex-col items-center gap-3 text-light-tertiary dark:text-dark-tertiary">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-neutral-800 dark:border-gray-700 dark:border-t-white"></div>

            <p className="text-sm">Your AI travel agent is working...</p>

            <p className="text-xs">Analyzing your trip requirements and budget</p>
          </div>
        )}

        {/* RESULT */}

        {itinerary && !loading && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-dark-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-light-primary dark:text-dark-primary">
                  Your {days}-Day {destination} Trip
                </h2>

                <p className="mt-1 text-xs text-light-secondary dark:text-dark-secondary">
                  Generated by GhumiGumi AI Travel Agent
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="rounded-lg border border-zinc-300 px-3 py-1 text-xs text-light-secondary hover:bg-zinc-50 dark:border-dark-button dark:text-dark-secondary dark:hover:bg-dark-button"
              >
                Copy
              </button>
            </div>

            {travelData && (
              <div className="mb-6 overflow-hidden rounded-xl">
                <TravelMap
                  location={travelData.location}
                  places={travelData.places}
                  destination={destination}
                  onSavedPlacesChange={setSavedPlaces}
                />
              </div>
            )}

            {savedPlaces.length > 0 && (
              <div className="mt-6 rounded-2xl border border-purple-400/20 bg-purple-500/5 p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-light-primary dark:text-dark-primary">
                    ⭐ Saved Attractions
                  </h3>
                  <p className="mt-1 text-xs text-light-secondary dark:text-dark-secondary">
                    These places are selected for your personalized trip.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {savedPlaces.map((place, index) => (
                    <div
                      key={`${place.name || place.display_name || 'place'}-${index}`}
                      className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-light-primary dark:text-purple-200"
                    >
                      ⭐ {place.name || place.display_name || 'Saved place'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              {itinerary.split('\n').map((line, index) => {
                const clean = line.replace(/\*\*/g, '').replace(/\*/g, '').trim();

                if (!clean) {
                  return <div key={index} className="h-2" />;
                }

                if (
                  clean.match(
                    /^(Day|Trip Overview|Estimated Budget|Food Recommendations|Travel Tips|Things to Avoid|Final Recommendation)/i
                  )
                ) {
                  return (
                    <div
                      key={index}
                      className="mt-5 rounded-lg bg-zinc-100 px-4 py-2 dark:bg-dark-field"
                    >
                      <p className="font-bold text-light-primary dark:text-dark-primary">{clean}</p>
                    </div>
                  );
                }

                return (
                  <p
                    key={index}
                    className="px-1 text-sm leading-relaxed text-light-description dark:text-dark-description"
                  >
                    {clean}
                  </p>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TripPlanner;
