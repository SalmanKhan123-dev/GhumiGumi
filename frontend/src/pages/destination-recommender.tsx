import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/helpers/axios-instance';
import ThemeToggle from '@/components/theme-toggle-button';
import AppIcon from '@/assets/svg/app-icon.svg';

function DestinationRecommender() {
  const [budget, setBudget] = useState('');
  const [weather, setWeather] = useState('');
  const [tripType, setTripType] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!budget || !weather || !tripType) {
      setError('Please answer all 3 questions.');
      return;
    }
    setError('');
    setLoading(true);
    setRecommendations('');
    try {
      const res = await axiosInstance.post('/api/ai/destination-recommender', {
        budget,
        weather,
        tripType,
      });
      setRecommendations(res.data.recommendations);
    } catch {
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const options = {
    budget: [
      { value: 'under $500', label: '💰 Under $500' },
      { value: '$500 - $1500', label: '💳 $500 – $1500' },
      { value: '$1500 - $3000', label: '✈️ $1500 – $3000' },
      { value: 'above $3000', label: '💎 Above $3000' },
    ],
    weather: [
      { value: 'hot and sunny', label: '☀️ Hot & Sunny' },
      { value: 'cool and mild', label: '🌤️ Cool & Mild' },
      { value: 'cold and snowy', label: '❄️ Cold & Snowy' },
      { value: 'tropical and humid', label: '🌴 Tropical' },
    ],
    tripType: [
      { value: 'adventure and hiking', label: '🏔️ Adventure & Hiking' },
      { value: 'beach and relaxation', label: '🏖️ Beach & Relaxation' },
      { value: 'cultural and historical', label: '🏛️ Cultural & Historical' },
      { value: 'food and nightlife', label: '🍜 Food & Nightlife' },
      { value: 'family friendly', label: '👨‍👩‍👧 Family Friendly' },
      { value: 'romantic getaway', label: '💑 Romantic Getaway' },
    ],
  };

  const OptionButton = ({
    value, label, selected, onClick,
  }: { value: string; label: string; selected: boolean; onClick: () => void }) => (
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

  return (
    <div className="min-h-screen cursor-default bg-light dark:bg-dark">
      {/* Header */}
      <div className="relative h-36 bg-[url('./assets/wanderlustbg.webp')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-between px-8 sm:px-16">
          <div className="flex items-center gap-3">
            <Link to="/"><img src={AppIcon} className="h-10 w-10" /></Link>
            <Link to="/" className="text-2xl font-semibold text-white no-underline">GhumiGumi</Link>
            <span className="hidden text-gray-300 sm:block">/ Destination Finder</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-2 text-center">
          <h1 className="text-2xl font-bold text-light-primary dark:text-dark-primary">🌍 Destination Finder</h1>
          <p className="mt-2 text-sm text-light-secondary dark:text-dark-secondary">
            Answer 3 quick questions and AI will recommend your perfect destinations
          </p>
        </div>

        {/* Questions Card */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-dark-card">

          {/* Q1 */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-semibold text-light-primary dark:text-dark-primary">
              1. What's your budget per person?
            </p>
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

          {/* Q2 */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-semibold text-light-primary dark:text-dark-primary">
              2. What weather do you prefer?
            </p>
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

          {/* Q3 */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-semibold text-light-primary dark:text-dark-primary">
              3. What kind of trip?
            </p>
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

          {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-neutral-800 p-3 text-base font-semibold text-white disabled:bg-neutral-600 dark:bg-light dark:text-dark dark:hover:bg-dark-secondary/80"
          >
            {loading ? '🌍 Finding destinations...' : '🌍 Find My Destinations'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 flex flex-col items-center gap-3 text-light-tertiary dark:text-dark-tertiary">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-neutral-800 dark:border-gray-700 dark:border-t-white"></div>
            <p className="text-sm">Finding your perfect destinations...</p>
          </div>
        )}

        {/* Results */}
        {recommendations && !loading && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-dark-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-light-primary dark:text-dark-primary">
                🌍 Your Top 5 Destinations
              </h2>
              <button
                onClick={() => navigator.clipboard.writeText(recommendations)}
                className="rounded-lg border border-zinc-300 px-3 py-1 text-xs text-light-secondary hover:bg-zinc-50 dark:border-dark-button dark:text-dark-secondary dark:hover:bg-dark-button"
              >
                Copy
              </button>
            </div>

            <div className="space-y-4">
              {recommendations.split('\n').map((line, i) => {
                const clean = line.replace(/\*\*/g, '').replace(/\*/g, '').trim();
                if (!clean) return null;
                // Destination header lines like "1. Bali, Indonesia"
                if (clean.match(/^\d\.\s/)) {
                  return (
                    <div key={i} className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 dark:bg-dark-field">
                      <p className="font-bold text-light-primary dark:text-dark-primary">{clean}</p>
                    </div>
                  );
                }
                return (
                  <p key={i} className="px-1 text-sm leading-relaxed text-light-description dark:text-dark-description">
                    {clean}
                  </p>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl bg-zinc-50 px-4 py-3 dark:bg-dark-field">
              <p className="text-xs text-light-tertiary dark:text-dark-tertiary">
                💡 Want a full itinerary for any of these?{' '}
                <Link to="/trip-planner" className="font-semibold text-light-primary underline dark:text-dark-primary">
                  Use the AI Trip Planner →
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DestinationRecommender;
