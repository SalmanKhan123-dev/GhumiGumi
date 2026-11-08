// @ts-nocheck

import { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';

import TravelMap from '@/components/travel-map';

type TripPDFProps = {
  destination: string;
  days: string | number;
  travelers: string | number;
  budget: string;
  itinerary: string;
  travelData?: any;
  savedPlaces?: any[];
};

function cleanText(text: string) {
  return text
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/^\s*[-•]\s*/, '')
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .trim();
}

function isDayHeading(line: string) {
  return /^Day\s+\d+/i.test(cleanText(line));
}

function getDayNumber(line: string) {
  const match = cleanText(line).match(/^Day\s+(\d+)/i);

  return match ? match[1] : '';
}

function getDayTitle(line: string) {
  return cleanText(line)
    .replace(/^Day\s+\d+\s*[-:]?\s*/i, '')
    .trim();
}

function isTimeLine(line: string) {
  return /^\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}/.test(
    cleanText(line),
  );
}

function parseTimeLine(line: string) {
  const clean = cleanText(line);

  const parts = clean
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return null;
  }

  const time = parts[0];

  const title = parts[1] || 'Activity';

  const notes = parts.slice(2).join(' • ');

  const lower = `${title} ${notes}`.toLowerCase();

  let icon = '📍';
  let type = 'place';

  if (
    lower.includes('lunch') ||
    lower.includes('dinner') ||
    lower.includes('breakfast') ||
    lower.includes('food') ||
    lower.includes('restaurant') ||
    lower.includes('cafe') ||
    lower.includes('café')
  ) {
    icon = '🍽️';
    type = 'food';
  } else if (
    lower.includes('museum') ||
    lower.includes('gallery') ||
    lower.includes('fort') ||
    lower.includes('palace') ||
    lower.includes('monument') ||
    lower.includes('temple') ||
    lower.includes('memorial')
  ) {
    icon = '🏛️';
    type = 'museum';
  } else if (
    lower.includes('market') ||
    lower.includes('shopping') ||
    lower.includes('bazaar')
  ) {
    icon = '🛍️';
    type = 'market';
  } else if (
    lower.includes('walk') ||
    lower.includes('trek') ||
    lower.includes('hike') ||
    lower.includes('stroll')
  ) {
    icon = '🥾';
    type = 'walk';
  } else if (
    lower.includes('transport') ||
    lower.includes('taxi') ||
    lower.includes('cab') ||
    lower.includes('metro') ||
    lower.includes('bus') ||
    lower.includes('train') ||
    lower.includes('airport')
  ) {
    icon = '🚗';
    type = 'transport';
  }

  return {
    time,
    title,
    notes,
    icon,
    type,
  };
}

function getActivityClass(type: string) {
  if (type === 'food') {
    return 'pdf-food';
  }

  if (type === 'museum') {
    return 'pdf-museum';
  }

  if (type === 'market') {
    return 'pdf-market';
  }

  if (type === 'walk') {
    return 'pdf-walk';
  }

  if (type === 'transport') {
    return 'pdf-transport';
  }

  return 'pdf-place';
}

function parseWeatherLine(line: string) {
  const values = line
    .split('|')
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.length < 3) {
    return null;
  }

  if (
    /date/i.test(values[0]) ||
    /weather code/i.test(values[1] || '')
  ) {
    return null;
  }

  const date = values[0];

  if (!/\d/.test(date)) {
    return null;
  }

  const weatherCode = values[1] || '';

  const maxTemp = values[2] || '';

  const minTemp = values[3] || '';

  const precipitation = values[4] || '';

  const wind = values[5] || '';

  let icon = '🌤️';

  const weather = weatherCode.toLowerCase();

  if (
    weather.includes('rain') ||
    weather.includes('shower') ||
    weather.includes('drizzle') ||
    weatherCode === '51'
  ) {
    icon = '🌧️';
  } else if (
    weather.includes('clear') ||
    weather.includes('sun') ||
    weatherCode === '0' ||
    weatherCode === '2'
  ) {
    icon = '☀️';
  } else if (weather.includes('cloud')) {
    icon = '🌤️';
  } else if (weather.includes('snow')) {
    icon = '❄️';
  } else if (
    weather.includes('storm') ||
    weather.includes('thunder')
  ) {
    icon = '⛈️';
  }

  return {
    date,
    weatherCode,
    maxTemp,
    minTemp,
    precipitation,
    wind,
    icon,
  };
}

function parseBudgetLine(line: string) {
  const clean = cleanText(line);

  const match = clean.match(
    /^([^|:]+?)(?:\||:|-)\s*(₹?\s*[\d,]+(?:\.\d+)?)/i,
  );

  if (!match) {
    return null;
  }

  const label = match[1].trim();

  const amount = match[2].trim();

  const lower = label.toLowerCase();

  let icon = '💰';

  if (
    lower.includes('accommodation') ||
    lower.includes('hotel')
  ) {
    icon = '🏨';
  } else if (
    lower.includes('food') ||
    lower.includes('meal')
  ) {
    icon = '🍽️';
  } else if (
    lower.includes('transport') ||
    lower.includes('travel')
  ) {
    icon = '🚕';
  } else if (
    lower.includes('activit') ||
    lower.includes('entry')
  ) {
    icon = '🎯';
  } else if (
    lower.includes('emergency') ||
    lower.includes('buffer')
  ) {
    icon = '🛡️';
  } else if (lower.includes('total')) {
    icon = '💳';
  }

  return {
    label,
    amount,
    icon,
  };
}

function findSection(
  itinerary: string,
  pattern: RegExp,
) {
  const lines = itinerary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const result: string[] = [];

  let active = false;

  lines.forEach((line) => {
    const clean = cleanText(line);

    if (pattern.test(clean)) {
      active = true;
      return;
    }

    if (
      active &&
      /^(Trip Overview|Destination Information|Weather Overview|Estimated Budget|Day-by-Day Itinerary|Real Attractions|Food Recommendations|Travel Tips|Weather-Based Suggestions|Things to Avoid|Final Recommendation)/i.test(
        clean,
      )
    ) {
      active = false;
    }

    if (active) {
      result.push(line);
    }
  });

  return result;
}

function getDayGroups(itinerary: string) {
  const lines = itinerary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const daysList: {
    number: string;
    title: string;
    lines: string[];
  }[] = [];

  let currentDay: {
    number: string;
    title: string;
    lines: string[];
  } | null = null;

  lines.forEach((line) => {
    if (isDayHeading(line)) {
      currentDay = {
        number: getDayNumber(line),
        title: getDayTitle(line),
        lines: [],
      };

      daysList.push(currentDay);

      return;
    }

    if (currentDay) {
      currentDay.lines.push(line);
    }
  });

  return daysList;
}

function getDestinationInfo(itinerary: string) {
  const lines = findSection(
    itinerary,
    /^Destination Information/i,
  );

  return lines
    .filter((line) => !/^[-|]+$/.test(line))
    .map(cleanText)
    .filter(Boolean);
}

function getOverviewInfo(itinerary: string) {
  const lines = findSection(
    itinerary,
    /^Trip Overview/i,
  );

  return lines
    .map(cleanText)
    .filter(Boolean);
}

function getWeatherInfo(itinerary: string) {
  return findSection(
    itinerary,
    /^Weather Overview/i,
  )
    .map(cleanText)
    .filter(Boolean);
}

function getBudgetInfo(itinerary: string) {
  return findSection(
    itinerary,
    /^Estimated Budget/i,
  )
    .map(cleanText)
    .filter(Boolean);
}

export default function TripPDF({
  destination,
  days,
  travelers,
  budget,
  itinerary,
  travelData,
  savedPlaces = [],
}: TripPDFProps) {
  const pdfRef = useRef<HTMLDivElement>(null);

  const [creatingPDF, setCreatingPDF] =
    useState(false);

  const dayGroups = getDayGroups(itinerary);

  const overviewLines =
    getOverviewInfo(itinerary);

  const destinationLines =
    getDestinationInfo(itinerary);

  const weatherLines =
    getWeatherInfo(itinerary);

  const budgetLines =
    getBudgetInfo(itinerary);

  const weatherCards = weatherLines
    .map(parseWeatherLine)
    .filter(Boolean);

  const budgetCards = budgetLines
    .map(parseBudgetLine)
    .filter(Boolean);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        itinerary,
      );
    } catch (error) {
      console.error(
        'Failed to copy itinerary:',
        error,
      );
    }
  };

  const handleCreatePDF = async () => {
    if (!pdfRef.current) {
      return;
    }

    setCreatingPDF(true);

    try {
      const element = pdfRef.current;

      const safeName =
        destination
          .replace(/[^a-z0-9]+/gi, '-')
          .replace(/^-|-$/g, '')
          .toLowerCase() || 'trip';

      const options = {
        margin: [8, 8, 8, 8],

        filename: `ghumigumi-${safeName}-itinerary.pdf`,

        image: {
          type: 'jpeg',
          quality: 0.96,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#0b1220',
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
        },

        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
        },

        pagebreak: {
          mode: [
            'css',
            'legacy',
          ],
          avoid: [
            '.pdf-day-card',
            '.pdf-section',
            '.pdf-weather-card',
            '.pdf-budget-card',
            '.pdf-place-card',
          ],
        },
      };

      await html2pdf()
        .set(options)
        .from(element)
        .save();
    } catch (error) {
      console.error(
        'PDF generation failed:',
        error,
      );
    } finally {
      setCreatingPDF(false);
    }
  };

  return (
    <div className="w-full">
      {/* PDF ACTION BAR */}

      <div className="mb-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          📋 Copy
        </button>

        <button
          type="button"
          onClick={handleCreatePDF}
          disabled={creatingPDF}
          className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creatingPDF
            ? '⏳ Creating PDF...'
            : '📄 Download PDF'}
        </button>
      </div>

      {/* PDF DOCUMENT */}

      <div
        ref={pdfRef}
        className="pdf-document"
      >
        {/* HEADER */}

        <section className="pdf-header">
          <div className="pdf-title-row">
            <div>
              <div className="pdf-title-line">
                <h1>{destination}</h1>

                <span className="pdf-ai-badge">
                  ✦ AI Planned
                </span>
              </div>

              <p className="pdf-subtitle">
                Your personalized{' '}
                {days}-day journey created by
                GhumiGumi AI
              </p>

              <div className="pdf-pills">
                <span>
                  📅 {days} Days
                </span>

                <span>
                  👥 {travelers}{' '}
                  {Number(travelers) === 1
                    ? 'Traveler'
                    : 'Travelers'}
                </span>

                <span>
                  💳{' '}
                  {String(budget)
                    .charAt(0)
                    .toUpperCase() +
                    String(budget).slice(1)}
                </span>

                <span>
                  📍{' '}
                  {travelData?.places?.length ||
                    0}{' '}
                  Places
                </span>
              </div>
            </div>

            <div className="pdf-header-actions">
              <button
                type="button"
                onClick={handleCopy}
              >
                📋 Copy
              </button>

              <button
                type="button"
                onClick={handleCreatePDF}
              >
                {creatingPDF
                  ? '⏳ Creating PDF...'
                  : '📄 Download PDF'}
              </button>
            </div>
          </div>
        </section>

        {/* LIVE MAP */}

        {travelData && (
          <section className="pdf-map-section pdf-section">
            <div className="pdf-section-heading">
              <div>
                <span className="pdf-overline">
                  LIVE TRAVEL MAP
                </span>

                <h2>
                  {destination}
                </h2>

                <p>
                  Explore real attractions around
                  your destination
                </p>
              </div>

              <span className="pdf-place-count">
                📍{' '}
                {travelData?.places?.length ||
                  0}{' '}
                real places
              </span>
            </div>

            <div className="pdf-map">
              <TravelMap
                location={
                  travelData.location
                }
                places={
                  travelData.places || []
                }
                destination={destination}
                onSavedPlacesChange={() => {}}
              />
            </div>

            {/* NEARBY */}

            <div className="pdf-nearby">
              <div className="pdf-nearby-heading">
                <div>
                  <h3>
                    🌍 Explore Nearby
                  </h3>

                  <p>
                    Click a place to move the map
                    and explore it.
                  </p>
                </div>
              </div>

              <div className="pdf-place-grid">
                {(travelData.places || [])
                  .slice(0, 12)
                  .map(
                    (
                      place: any,
                      index: number,
                    ) => (
                      <div
                        key={`${place.name}-${index}`}
                        className="pdf-place-card"
                      >
                        <div className="pdf-place-icon">
                          ★
                        </div>

                        <div className="pdf-place-content">
                          <h4>
                            {place.name ||
                              'Nearby Place'}
                          </h4>

                          <p>
                            {place.category ||
                              'Attraction'}
                          </p>

                          <div className="pdf-place-buttons">
                            <button
                              type="button"
                            >
                              ⭐ Save
                            </button>

                            {place.latitude !=
                              null &&
                              place.longitude !=
                                null && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  🗺️ Open
                                </a>
                              )}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
              </div>

              {travelData.places?.length >
                12 && (
                <p className="pdf-showing">
                  Showing 12 of{' '}
                  {travelData.places.length}{' '}
                  nearby places.
                </p>
              )}
            </div>
          </section>
        )}

        {/* SAVED PLACES */}

        {savedPlaces.length > 0 && (
          <section className="pdf-section">
            <div className="pdf-section-title">
              ❤️
              <span>
                Saved Attractions
              </span>
            </div>

            <div className="pdf-saved-grid">
              {savedPlaces.map(
                (
                  place: any,
                  index: number,
                ) => (
                  <div
                    key={`${place.name}-${index}`}
                    className="pdf-saved-card"
                  >
                    <span>📍</span>

                    <div>
                      <strong>
                        {place.name ||
                          'Saved Place'}
                      </strong>

                      <small>
                        {place.category ||
                          'Attraction'}
                      </small>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        {/* TRIP OVERVIEW */}

        <section className="pdf-section">
          <div className="pdf-section-title">
            🧭
            <span>
              Trip Overview
            </span>
          </div>

          <div className="pdf-text-content">
            {overviewLines.length > 0 ? (
              overviewLines.map(
                (line, index) => (
                  <p key={index}>
                    {line}
                  </p>
                ),
              )
            ) : (
              <>
                <p>
                  Destination:{' '}
                  {destination}, India
                </p>

                <p>
                  Duration: {days}{' '}
                  {Number(days) === 1
                    ? 'day'
                    : 'days'}
                </p>

                <p>
                  Travelers: {travelers}
                </p>

                <p>
                  Budget style:{' '}
                  {String(budget)
                    .charAt(0)
                    .toUpperCase() +
                    String(budget).slice(1)}
                </p>
              </>
            )}
          </div>
        </section>

        {/* DESTINATION INFORMATION */}

        {destinationLines.length > 0 && (
          <section className="pdf-section">
            <div className="pdf-section-title">
              📍
              <span>
                Destination Information
              </span>
            </div>

            <div className="pdf-text-content">
              {destinationLines.map(
                (line, index) => (
                  <p key={index}>
                    {line}
                  </p>
                ),
              )}
            </div>
          </section>
        )}

        {/* WEATHER */}

        {weatherCards.length > 0 && (
          <section className="pdf-section">
            <div className="pdf-section-title">
              🌦️
              <span>
                Weather Overview
              </span>
            </div>

            <div className="pdf-text-content">
              {weatherLines
                .filter(
                  (line) =>
                    !parseWeatherLine(line),
                )
                .map(
                  (line, index) => (
                    <p key={index}>
                      {line}
                    </p>
                  ),
                )}
            </div>

            <div className="pdf-weather-box">
              <div className="pdf-weather-heading">
                <h3>
                  🌦️ Weather Forecast
                </h3>

                <p>
                  Plan your activities around the
                  expected conditions
                </p>
              </div>

              <div className="pdf-weather-grid">
                {weatherCards.map(
                  (
                    weather: any,
                    index: number,
                  ) => (
                    <div
                      key={index}
                      className="pdf-weather-card"
                    >
                      <div className="pdf-weather-top">
                        <strong>
                          {weather.date}
                        </strong>

                        <span>
                          {weather.icon}
                        </span>
                      </div>

                      <h4>
                        {weather.weatherCode ||
                          'Weather'}
                        {weather.maxTemp
                          ? ` / ${weather.maxTemp}`
                          : ''}
                      </h4>

                      <small>
                        {weather.weatherCode}
                      </small>

                      <div className="pdf-weather-stats">
                        <span>
                          💧{' '}
                          {weather.precipitation ||
                            '—'}
                        </span>

                        <span>
                          💨{' '}
                          {weather.wind ||
                            '—'}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {/* BUDGET */}

        {budgetCards.length > 0 && (
          <section className="pdf-section">
            <div className="pdf-section-title">
              💰
              <span>
                Estimated Budget
              </span>
            </div>

            <div className="pdf-budget-note">
              All figures are estimates; actual
              costs may vary.
            </div>

            <div className="pdf-budget-box">
              <div className="pdf-budget-heading">
                <span>💰</span>

                <div>
                  <h3>
                    Estimated Budget
                  </h3>

                  <p>
                    AI-generated trip cost
                    estimate
                  </p>
                </div>
              </div>

              <div className="pdf-budget-grid">
                {budgetCards.map(
                  (
                    item: any,
                    index: number,
                  ) => (
                    <div
                      key={index}
                      className={`pdf-budget-card ${
                        /total/i.test(
                          item.label,
                        )
                          ? 'pdf-total-card'
                          : ''
                      }`}
                    >
                      <div>
                        <span className="pdf-budget-icon">
                          {item.icon}
                        </span>

                        <p>
                          {item.label}
                        </p>
                      </div>

                      <strong>
                        {item.amount}
                      </strong>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {/* DAY BY DAY */}

        <section className="pdf-section">
          <div className="pdf-section-title">
            🗓️
            <span>
              Day-by-Day Itinerary
            </span>
          </div>

          {dayGroups.map(
            (
              day,
              dayIndex,
            ) => {
              const timeActivities =
                day.lines
                  .filter(isTimeLine)
                  .map(parseTimeLine)
                  .filter(Boolean);

              const notes = day.lines
                .filter(
                  (line) =>
                    !isTimeLine(line),
                )
                .map(cleanText)
                .filter(Boolean);

              return (
                <div
                  key={`${day.number}-${dayIndex}`}
                  className="pdf-day-card"
                >
                  {/* DAY HEADER */}

                  <div className="pdf-day-header">
                    <div className="pdf-day-number">
                      {day.number}
                    </div>

                    <div className="pdf-day-heading">
                      <span>
                        DAY {day.number}
                      </span>

                      <h3>
                        {day.title ||
                          `Day ${day.number}`}
                      </h3>
                    </div>

                    <span className="pdf-ai-itinerary">
                      ✦ AI Itinerary
                    </span>
                  </div>

                  {/* ACTIVITIES */}

                  <div className="pdf-activities">
                    {timeActivities.map(
                      (
                        activity: any,
                        index: number,
                      ) => (
                        <div
                          key={index}
                          className={`pdf-activity ${getActivityClass(
                            activity.type,
                          )}`}
                        >
                          <div className="pdf-time">
                            {activity.time
                              .split(
                                ' - ',
                              )
                              .map(
                                (
                                  time: string,
                                  timeIndex: number,
                                ) => (
                                  <span
                                    key={
                                      timeIndex
                                    }
                                  >
                                    {time}
                                  </span>
                                ),
                              )}
                          </div>

                          <div className="pdf-activity-icon">
                            {activity.icon}
                          </div>

                          <div className="pdf-activity-content">
                            <h4>
                              {
                                activity.title
                              }
                            </h4>

                            {activity.notes && (
                              <p>
                                {
                                  activity.notes
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {/* DAY NOTES */}

                  {notes.length > 0 && (
                    <div className="pdf-day-notes">
                      {notes.map(
                        (
                          note,
                          noteIndex,
                        ) => (
                          <p
                            key={
                              noteIndex
                            }
                          >
                            {note}
                          </p>
                        ),
                      )}
                    </div>
                  )}
                </div>
              );
            },
          )}
        </section>

        {/* FINAL */}

        <section className="pdf-final">
          <div className="pdf-final-icon">
            ✨
          </div>

          <h2>
            Your journey is ready
          </h2>

          <p>
            This itinerary combines your
            preferences with live travel
            information and real attractions
            around {destination}.
          </p>
        </section>
      </div>

      {/* COMPONENT STYLES */}

      <style>{`
        .pdf-document {
          width: 794px;
          margin: 0 auto;
          padding: 28px;
          background: #0b1220;
          color: #e5e7eb;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          box-sizing: border-box;
        }

        .pdf-document * {
          box-sizing: border-box;
        }

        .pdf-header {
          background:
            linear-gradient(
              145deg,
              #18243a,
              #111a2c
            );
          border: 1px solid #263654;
          border-radius: 24px;
          padding: 28px;
          margin-bottom: 18px;
        }

        .pdf-title-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
        }

        .pdf-title-line {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pdf-title-line h1 {
          margin: 0;
          color: #f8fafc;
          font-size: 28px;
          line-height: 1.1;
          font-weight: 800;
        }

        .pdf-ai-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: #33245e;
          color: #d8b4fe;
          font-size: 11px;
          font-weight: 700;
        }

        .pdf-subtitle {
          margin: 8px 0 14px;
          color: #aeb9cc;
          font-size: 13px;
          line-height: 1.5;
        }

        .pdf-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pdf-pills span {
          display: inline-flex;
          align-items: center;
          padding: 7px 11px;
          border-radius: 999px;
          background: #101a2d;
          border: 1px solid #263653;
          color: #d8deea;
          font-size: 10px;
          font-weight: 700;
        }

        .pdf-header-actions {
          display: flex;
          gap: 7px;
          flex-shrink: 0;
        }

        .pdf-header-actions button {
          border: 1px solid #2b3b58;
          border-radius: 8px;
          background: #172238;
          color: #cbd5e1;
          padding: 9px 12px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .pdf-header-actions button:last-child {
          background: #8b2cff;
          border-color: #8b2cff;
          color: white;
        }

        .pdf-section {
          margin-top: 18px;
        }

        .pdf-section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 58px;
          padding: 12px 18px;
          border: 1px solid #273754;
          border-radius: 18px;
          background:
            linear-gradient(
              90deg,
              #111a2d,
              #101827
            );
          color: #f8fafc;
          font-size: 15px;
          font-weight: 800;
        }

        .pdf-section-title:first-letter {
          font-size: 16px;
        }

        .pdf-text-content {
          padding: 18px 4px 2px;
        }

        .pdf-text-content p {
          margin: 0 0 16px;
          color: #aab5c8;
          font-size: 12px;
          line-height: 1.7;
        }

        .pdf-map-section {
          overflow: hidden;
          border: 1px solid #293957;
          border-radius: 24px;
          background: #142138;
        }

        .pdf-map-section
          .pdf-section-heading {
          min-height: 112px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px;
          background:
            linear-gradient(
              145deg,
              #182740,
              #142138
            );
        }

        .pdf-overline {
          display: block;
          margin-bottom: 6px;
          color: #c084fc;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .pdf-section-heading h2 {
          margin: 0;
          color: #f8fafc;
          font-size: 22px;
          font-weight: 800;
        }

        .pdf-section-heading p {
          margin: 5px 0 0;
          color: #93a1b6;
          font-size: 11px;
        }

        .pdf-place-count {
          padding: 8px 12px;
          border-radius: 999px;
          background: #1d2b45;
          border: 1px solid #304362;
          color: #cbd5e1;
          font-size: 10px;
          font-weight: 700;
        }

        .pdf-map {
          height: 420px;
          overflow: hidden;
          background: #dfe5e9;
        }

        .pdf-map > div {
          height: 100%;
        }

        .pdf-nearby {
          padding: 22px 24px 25px;
        }

        .pdf-nearby-heading h3 {
          margin: 0;
          color: #f8fafc;
          font-size: 15px;
          font-weight: 800;
        }

        .pdf-nearby-heading p {
          margin: 4px 0 15px;
          color: #8f9db2;
          font-size: 10px;
        }

        .pdf-place-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .pdf-place-card {
          min-height: 124px;
          padding: 13px;
          display: flex;
          gap: 9px;
          border: 1px solid #2c3d5c;
          border-radius: 13px;
          background: #1b2b46;
        }

        .pdf-place-icon {
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #3c2870;
          color: #d8b4fe;
          font-size: 13px;
        }

        .pdf-place-content {
          min-width: 0;
          flex: 1;
        }

        .pdf-place-content h4 {
          margin: 1px 0 4px;
          color: #f8fafc;
          font-size: 11px;
          line-height: 1.25;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pdf-place-content p {
          margin: 0 0 9px;
          color: #8f9db2;
          font-size: 9px;
        }

        .pdf-place-buttons {
          display: flex;
          gap: 6px;
        }

        .pdf-place-buttons button,
        .pdf-place-buttons a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 27px;
          padding: 0 9px;
          border-radius: 7px;
          border: 1px solid #30415e;
          background: #192840;
          color: #dce4ef;
          text-decoration: none;
          font-size: 8px;
          font-weight: 700;
        }

        .pdf-place-buttons a {
          background: #9b2cff;
          border-color: #9b2cff;
          color: white;
        }

        .pdf-showing {
          margin: 15px 0 0;
          text-align: center;
          color: #8996aa;
          font-size: 10px;
        }

        .pdf-saved-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 15px;
        }

        .pdf-saved-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 1px solid #2c3d5c;
          border-radius: 12px;
          background: #18263e;
        }

        .pdf-saved-card > span {
          font-size: 17px;
        }

        .pdf-saved-card strong {
          display: block;
          color: #f8fafc;
          font-size: 10px;
        }

        .pdf-saved-card small {
          display: block;
          margin-top: 3px;
          color: #8e9bb0;
          font-size: 8px;
        }

        .pdf-weather-box {
          margin-top: 15px;
          padding: 16px;
          border: 1px solid #293b5a;
          border-radius: 17px;
          background: #16253b;
        }

        .pdf-weather-heading h3 {
          margin: 0;
          color: #f8fafc;
          font-size: 14px;
          font-weight: 800;
        }

        .pdf-weather-heading p {
          margin: 3px 0 14px;
          color: #8998ad;
          font-size: 9px;
        }

        .pdf-weather-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 9px;
        }

        .pdf-weather-card {
          min-height: 145px;
          padding: 12px;
          border: 1px solid #30415d;
          border-radius: 12px;
          background: #1d2d47;
        }

        .pdf-weather-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pdf-weather-top strong {
          color: #dce4ef;
          font-size: 10px;
        }

        .pdf-weather-top span {
          font-size: 18px;
        }

        .pdf-weather-card h4 {
          margin: 18px 0 6px;
          color: #f8fafc;
          font-size: 14px;
          line-height: 1.35;
        }

        .pdf-weather-card > small {
          color: #8997ab;
          font-size: 8px;
        }

        .pdf-weather-stats {
          display: flex;
          gap: 10px;
          margin-top: 14px;
          color: #9eacc0;
          font-size: 8px;
        }

        .pdf-budget-note {
          padding: 16px 4px 0;
          color: #8795aa;
          font-size: 10px;
        }

        .pdf-budget-box {
          margin-top: 15px;
          padding: 18px;
          border: 1px solid #293b5a;
          border-radius: 17px;
          background: #16253b;
        }

        .pdf-budget-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .pdf-budget-heading > span {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #213250;
          font-size: 17px;
        }

        .pdf-budget-heading h3 {
          margin: 0;
          color: #f8fafc;
          font-size: 13px;
        }

        .pdf-budget-heading p {
          margin: 3px 0 0;
          color: #8998ad;
          font-size: 9px;
        }

        .pdf-budget-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 9px;
        }

        .pdf-budget-card {
          min-height: 86px;
          padding: 12px;
          border: 1px solid #30415d;
          border-radius: 12px;
          background: #1c2b43;
        }

        .pdf-budget-card > div {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .pdf-budget-icon {
          font-size: 13px;
        }

        .pdf-budget-card p {
          margin: 0;
          color: #aab6c8;
          font-size: 9px;
        }

        .pdf-budget-card strong {
          display: block;
          margin-top: 9px;
          color: #f8fafc;
          font-size: 17px;
        }

        .pdf-total-card {
          border-color: #6750a4;
          background: #26254d;
        }

        .pdf-day-card {
          margin-top: 15px;
          overflow: hidden;
          border: 1px solid #2b3d5c;
          border-radius: 17px;
          background: #16243a;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .pdf-day-header {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 72px;
          padding: 12px 18px;
          background: #0f182c;
          border-bottom: 1px solid #243551;
        }

        .pdf-day-number {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 42px;
          border-radius: 10px;
          background: #f8fafc;
          color: #111827;
          font-size: 13px;
          font-weight: 900;
        }

        .pdf-day-heading {
          min-width: 0;
          flex: 1;
        }

        .pdf-day-heading span {
          display: block;
          margin-bottom: 3px;
          color: #b76cff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .pdf-day-heading h3 {
          margin: 0;
          color: #f8fafc;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.25;
        }

        .pdf-ai-itinerary {
          padding: 7px 10px;
          border-radius: 999px;
          background: #2b1f4d;
          color: #d8b4fe;
          font-size: 8px;
          font-weight: 800;
        }

        .pdf-activities {
          padding: 17px 18px 4px;
        }

        .pdf-activity {
          display: grid;
          grid-template-columns: 78px 42px minmax(0, 1fr);
          align-items: center;
          gap: 10px;
          min-height: 68px;
          margin-bottom: 9px;
          padding: 10px 12px;
          border: 1px solid #2b3c5a;
          border-radius: 13px;
          background: #17263d;
        }

        .pdf-food {
          background: #292a38;
          border-color: #4b4653;
        }

        .pdf-museum {
          background: #20294a;
          border-color: #403c70;
        }

        .pdf-market {
          background: #202c3f;
        }

        .pdf-walk {
          background: #1b293b;
        }

        .pdf-transport {
          background: #1a2940;
        }

        .pdf-time {
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: #cbd5e1;
          font-size: 9px;
          line-height: 1.35;
          font-weight: 700;
        }

        .pdf-activity-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #17243a;
          font-size: 17px;
        }

        .pdf-activity-content h4 {
          margin: 0;
          color: #f8fafc;
          font-size: 13px;
          line-height: 1.3;
          font-weight: 800;
        }

        .pdf-activity-content p {
          margin: 4px 0 0;
          color: #9aa8bc;
          font-size: 9px;
          line-height: 1.45;
        }

        .pdf-day-notes {
          padding: 0 18px 17px;
        }

        .pdf-day-notes p {
          margin: 11px 0 0;
          color: #9ba8ba;
          font-size: 10px;
          line-height: 1.6;
        }

        .pdf-final {
          margin-top: 18px;
          padding: 28px;
          border: 1px solid #3c3b72;
          border-radius: 18px;
          background:
            linear-gradient(
              145deg,
              #23284e,
              #202440
            );
          text-align: center;
          page-break-inside: avoid;
        }

        .pdf-final-icon {
          width: 42px;
          height: 42px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #32275f;
          font-size: 18px;
        }

        .pdf-final h2 {
          margin: 0;
          color: #f8fafc;
          font-size: 17px;
          font-weight: 800;
        }

        .pdf-final p {
          max-width: 520px;
          margin: 7px auto 0;
          color: #aeb8ca;
          font-size: 10px;
          line-height: 1.6;
        }

        @media print {
          .pdf-document {
            margin: 0;
          }

          .pdf-header-actions {
            display: none;
          }

          .pdf-section,
          .pdf-day-card,
          .pdf-final {
            break-inside: avoid;
          }
        }

        @media (max-width: 700px) {
          .pdf-document {
            width: 100%;
            padding: 16px;
          }

          .pdf-title-row {
            flex-direction: column;
          }

          .pdf-header-actions {
            width: 100%;
          }

          .pdf-header-actions button {
            flex: 1;
          }

          .pdf-place-grid,
          .pdf-saved-grid {
            grid-template-columns: 1fr;
          }

          .pdf-weather-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .pdf-budget-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .pdf-activity {
            grid-template-columns:
              65px 36px minmax(0, 1fr);
          }
        }
      `}</style>
    </div>
  );
}