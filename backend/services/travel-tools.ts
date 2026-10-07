const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

type TravelLocation = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
};

type TravelPlace = {
  name: string;
  lat: number;
  lon: number;
  category: string;
  type?: string;
};

const fetchJson = async (url: string, timeoutMs = 15000, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'GhumiGumi/1.0 travel application',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`External API returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const geocode = async (query: string, countryCode?: string) => {
  const params = new URLSearchParams({
    name: query,
    count: '20',
    language: 'en',
    format: 'json',
  });

  if (countryCode) {
    params.set('countryCode', countryCode);
  }

  const data = await fetchJson(`${GEOCODING_URL}?${params.toString()}`);

  return Array.isArray(data?.results) ? data.results : [];
};

export const findLocation = async (destination: string): Promise<TravelLocation> => {
  const input = destination.trim();

  if (!input) {
    throw new Error('Destination is required');
  }

  const normalized = input.toLowerCase().replace(/\s+/g, ' ').trim();

  /*
   * Manali is a known ambiguous name in India:
   * - Manali, Himachal Pradesh (travel destination)
   * - Manali, Chennai, Tamil Nadu
   *
   * For a travel request, explicitly search the Himalayan
   * destination so the map cannot silently jump to Chennai.
   */
  const specialQueries: Record<string, string> = {
    manali: 'Manali, Himachal Pradesh, India',
    'manali india': 'Manali, Himachal Pradesh, India',
    'manali, india': 'Manali, Himachal Pradesh, India',
  };

  if (specialQueries[normalized]) {
    try {
      const results = await geocode(specialQueries[normalized], 'IN');

      const himachal = results.find(
        (item: any) =>
          String(item.name || '').toLowerCase() === 'manali' &&
          String(item.admin1 || '')
            .toLowerCase()
            .includes('himachal')
      );

      const selected = himachal || results[0];

      if (selected) {
        return {
          name: selected.name,
          latitude: Number(selected.latitude),
          longitude: Number(selected.longitude),
          country: selected.country,
          admin1: selected.admin1,
          timezone: selected.timezone,
        };
      }
    } catch (error) {
      console.error('Manali-specific geocoding failed:', error);
    }
  }

  let results = await geocode(input);

  // Prefer exact country match for Indian destinations.
  if (!results.length) {
    results = await geocode(input, 'IN');
  }

  if (!results.length) {
    throw new Error(`Could not locate destination: ${input}`);
  }

  const exact = results.find((item: any) => String(item.name || '').toLowerCase() === normalized);

  const exactIndia = results.find(
    (item: any) =>
      String(item.name || '').toLowerCase() === normalized &&
      String(item.country_code || '').toLowerCase() === 'in'
  );

  const selected = exactIndia || exact || results[0];

  return {
    name: selected.name,
    latitude: Number(selected.latitude),
    longitude: Number(selected.longitude),
    country: selected.country,
    admin1: selected.admin1,
    timezone: selected.timezone,
  };
};

export const getWeather = async (latitude: number, longitude: number) => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'auto',
    forecast_days: '7',
  });

  const data = await fetchJson(`${WEATHER_URL}?${params.toString()}`);

  return {
    current: data.current || null,
    daily: data.daily || null,
    timezone: data.timezone || null,
  };
};

const getCoordinates = (element: any) => {
  if (element.type === 'node') {
    return {
      lat: Number(element.lat),
      lon: Number(element.lon),
    };
  }

  if (element.center) {
    return {
      lat: Number(element.center.lat),
      lon: Number(element.center.lon),
    };
  }

  return null;
};

const runOverpassQuery = async (endpoint: string, query: string) => {
  return fetchJson(endpoint, 20000, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(query)}`,
  });
};

export const findPlaces = async (latitude: number, longitude: number): Promise<TravelPlace[]> => {
  /*
   * Keep the query intentionally small. Public Overpass servers
   * can return 504 when a large multi-category query is requested.
   */
  const query = `
[out:json][timeout:35];
(
  nwr(around:6000,${latitude},${longitude})[tourism=attraction];
  nwr(around:6000,${latitude},${longitude})[tourism=museum];
  nwr(around:6000,${latitude},${longitude})[tourism=viewpoint];
);
out center tags;
`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await runOverpassQuery(endpoint, query);

      const elements = Array.isArray(data?.elements) ? data.elements : [];

      const places: TravelPlace[] = elements
        .map((element: any) => {
          const coordinates = getCoordinates(element);
          const tags = element.tags || {};
          const name = tags.name || tags['name:en'];

          if (
            !coordinates ||
            !Number.isFinite(coordinates.lat) ||
            !Number.isFinite(coordinates.lon) ||
            !name
          ) {
            return null;
          }

          return {
            name: String(name),
            lat: coordinates.lat,
            lon: coordinates.lon,
            category: String(tags.tourism || tags.leisure || tags.natural || 'place'),
            type: String(element.type || ''),
          };
        })
        .filter(Boolean) as TravelPlace[];

      const unique = new Map<string, TravelPlace>();

      for (const place of places) {
        const key =
          `${place.name.toLowerCase()}|` + `${place.lat.toFixed(5)}|${place.lon.toFixed(5)}`;

        if (!unique.has(key)) {
          unique.set(key, place);
        }
      }

      const result = Array.from(unique.values()).slice(0, 30);

      console.log(`Places API succeeded at ${endpoint}: ${result.length} places`);

      return result;
    } catch (error) {
      console.error(`Places API failed at ${endpoint}:`, error);
    }
  }

  console.error('All Overpass endpoints failed.');
  return [];
};

export const getTravelIntelligence = async (destination: string, days: number) => {
  const location = await findLocation(destination);

  const [weatherResult, placesResult] = await Promise.allSettled([
    getWeather(location.latitude, location.longitude),
    findPlaces(location.latitude, location.longitude),
  ]);

  const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;

  const places = placesResult.status === 'fulfilled' ? placesResult.value : [];

  if (weatherResult.status === 'rejected') {
    console.error('Weather API failed:', weatherResult.reason);
  }

  if (placesResult.status === 'rejected') {
    console.error('Places API failed:', placesResult.reason);
  }

  console.log(
    `Travel intelligence: ${location.name}, ` +
      `${location.latitude}, ${location.longitude}, ` +
      `${places.length} places`
  );

  return {
    destination: location.name || destination,
    days,
    location,
    weather,
    places,
  };
};
