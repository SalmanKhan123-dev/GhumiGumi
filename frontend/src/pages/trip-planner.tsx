import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/helpers/axios-instance';
import ThemeToggle from '@/components/theme-toggle-button';
import AppIcon from '@/assets/svg/app-icon.svg';

function TripPlanner() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [budget, setBudget] = useState('moderate');
  const [travelers, setTravelers] = useState('2 people');
  const [itinerary, setItinerary] = useState('');
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
    try {
      const res = await axiosInstance.post('/api/ai/trip-planner', { destination, days, budget, travelers });
      setItinerary(res.data.itinerary);
    } catch {
      setError('Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cursor-default bg-light dark:bg-dark">
      {/* Header - matches project style */}
      <div className="relative bg-[url('./assets/wanderlustbg.webp')] bg-cover bg-center h-36">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-between px-8 sm:px-16">
          <div className="flex items-center gap-3 text-white">
            <Link to="/"><img src={AppIcon} className="h-10 w-10" /></Link>
            <Link to="/" className="text-2xl font-semibold text-white no-underline">GhumiGumi</Link>
            <span className="hidden text-gray-300 sm:block">/ AI Trip Planner</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-2 text-center">
          <h1 className="text-2xl font-bold text-light-primary dark:text-dark-primary">🗺️ AI Trip Planner</h1>
          <p className="mt-2 text-sm text-light-secondary dark:text-dark-secondary">Enter your destination and get a full day-by-day itinerary instantly</p>
        </div>

        {/* Form Card - matches zinc-100 / dark-field pattern from signin */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-dark-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-light-secondary dark:text-dark-secondary">Destination *</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Paris, Lahore, Bali, Hunza Valley"
                className="w-full rounded-lg bg-zinc-100 p-3 text-sm placeholder:text-sm dark:bg-dark-field dark:text-dark-textInField"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-light-secondary dark:text-dark-secondary">Number of Days *</label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="e.g. 5"
                min="1" max="30"
                className="w-full rounded-lg bg-zinc-100 p-3 text-sm placeholder:text-sm dark:bg-dark-field dark:text-dark-textInField"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-light-secondary dark:text-dark-secondary">Budget</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-lg bg-zinc-100 p-3 text-sm dark:bg-dark-field dark:text-dark-textInField"
              >
                <option value="budget">💰 Budget (cheap)</option>
                <option value="moderate">💳 Moderate</option>
                <option value="luxury">💎 Luxury</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-light-secondary dark:text-dark-secondary">Travelers</label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full rounded-lg bg-zinc-100 p-3 text-sm dark:bg-dark-field dark:text-dark-textInField"
              >
                <option value="solo traveler">🧍 Solo Traveler</option>
                <option value="2 people">👫 Couple</option>
                <option value="family with kids">👨‍👩‍👧 Family with Kids</option>
                <option value="group of friends">👥 Group of Friends</option>
              </select>
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center rounded-lg bg-neutral-800 p-3 text-base font-semibold text-white disabled:bg-neutral-600 dark:bg-light dark:text-dark dark:hover:bg-dark-secondary/80"
          >
            {loading ? '✨ Planning your trip...' : '✨ Generate Itinerary'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 flex flex-col items-center gap-3 text-light-tertiary dark:text-dark-tertiary">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-neutral-800 dark:border-gray-700 dark:border-t-white"></div>
            <p className="text-sm">Planning your perfect trip...</p>
          </div>
        )}

        {/* Result */}
        {itinerary && !loading && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-dark-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-light-primary dark:text-dark-primary">
                Your {days}-Day {destination} Itinerary
              </h2>
              <button
                onClick={() => navigator.clipboard.writeText(itinerary)}
                className="rounded-lg border border-zinc-300 px-3 py-1 text-xs text-light-secondary hover:bg-zinc-50 dark:border-dark-button dark:text-dark-secondary dark:hover:bg-dark-button"
              >
                Copy
              </button>
            </div>
            <div className="space-y-1">
              {itinerary.split('\n').map((line, i) => {
                const clean = line.replace(/\*\*/g, '').replace(/\*/g, '').trim();
                if (!clean) return <div key={i} className="h-2" />;
                if (clean.match(/^Day \d+/i)) {
                  return (
                    <div key={i} className="mt-4 rounded-lg bg-zinc-100 px-4 py-2 dark:bg-dark-field">
                      <p className="font-bold text-light-primary dark:text-dark-primary">{clean}</p>
                    </div>
                  );
                }
                return <p key={i} className="px-1 text-sm leading-relaxed text-light-description dark:text-dark-description">{clean}</p>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TripPlanner;
