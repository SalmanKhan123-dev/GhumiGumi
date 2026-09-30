import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type TravelPlace = {
  name?: string;
  display_name?: string;
  lat?: number | string;
  lon?: number | string;
  type?: string;
  category?: string;
};

type TravelLocation = {
  latitude?: number | string;
  longitude?: number | string;
  lat?: number | string;
  lon?: number | string;
  name?: string;
};

type ValidPlace = TravelPlace & {
  latitude: number;
  longitude: number;
};

function MapCenter({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 12, {
      animate: true,
    });
  }, [latitude, longitude, map]);

  return null;
}

function FlyToPlace({
  place,
}: {
  place: ValidPlace | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!place) return;

    map.flyTo(
      [place.latitude, place.longitude],
      14,
      {
        duration: 0.8,
      },
    );
  }, [place, map]);

  return null;
}

const destinationIcon = new L.Icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const placeIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="
      width:32px;
      height:32px;
      border-radius:50%;
      background:linear-gradient(135deg,#a855f7,#7c3aed);
      border:3px solid white;
      box-shadow:0 4px 14px rgba(0,0,0,.4);
      display:flex;
      align-items:center;
      justify-content:center;
      color:white;
      font-size:14px;
      font-weight:800;
    ">★</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const getPlaceName = (place: ValidPlace) =>
  place.name || place.display_name || 'Attraction';

const getPlaceCategory = (place: ValidPlace) =>
  place.category || place.type || 'Attraction';

const getMapsUrl = (place: ValidPlace) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.latitude},${place.longitude}`,
  )}`;

export default function TravelMap({
  location,
  places = [],
  destination,
  onSavedPlacesChange,
}: {
  location?: TravelLocation | null;
  places?: TravelPlace[];
  destination?: string;
  onSavedPlacesChange?: (places: TravelPlace[]) => void;
}) {
  const [selectedPlace, setSelectedPlace] =
    useState<ValidPlace | null>(null);

  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);

  const latitude = Number(
    location?.latitude ?? location?.lat,
  );

  const longitude = Number(
    location?.longitude ?? location?.lon,
  );

  const validPlaces = useMemo(
    () =>
      places
        .map((place) => ({
          ...place,
          latitude: Number(place.lat),
          longitude: Number(place.lon),
        }))
        .filter(
          (place) =>
            Number.isFinite(place.latitude) &&
            Number.isFinite(place.longitude),
        )
        .slice(0, 30),
    [places],
  );

  const toggleSavedPlace = (place: ValidPlace) => {
    const name = getPlaceName(place);

    setSavedPlaces((current) => {
      const next = current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name];

      const selectedPlaces = validPlaces.filter((item) =>
        next.includes(getPlaceName(item)),
      );

      onSavedPlacesChange?.(selectedPlaces);

      return next;
    });
  };

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-dark-button bg-dark-card shadow-2xl">
      {/* HEADER */}
      <div className="border-b border-dark-button bg-[#17243a] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
              LIVE TRAVEL MAP
            </p>

            <h3 className="mt-1 text-2xl font-black text-dark-primary">
              {destination ||
                location?.name ||
                'Your destination'}
            </h3>

            <p className="mt-1 text-xs text-dark-secondary">
              Explore real attractions around your destination
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-full border border-dark-button bg-[#20304a] px-4 py-2 text-xs font-semibold text-dark-secondary">
              📍 {validPlaces.length} real places
            </div>

            {savedPlaces.length > 0 && (
              <div className="rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-200">
                ⭐ {savedPlaces.length} saved
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAP */}
      <div className="h-[420px] w-full sm:h-[520px]">
        <MapContainer
          center={[latitude, longitude]}
          zoom={12}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapCenter
            latitude={latitude}
            longitude={longitude}
          />

          <FlyToPlace place={selectedPlace} />

          {/* DESTINATION */}
          <Marker
            position={[latitude, longitude]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="min-w-[180px]">
                <strong>
                  {destination ||
                    location?.name ||
                    'Destination'}
                </strong>

                <br />

                <span>AI trip destination</span>
              </div>
            </Popup>
          </Marker>

          {/* REAL PLACES */}
          {validPlaces.map((place, index) => (
            <Marker
              key={`${getPlaceName(place)}-${index}`}
              position={[
                place.latitude,
                place.longitude,
              ]}
              icon={placeIcon}
              eventHandlers={{
                click: () => setSelectedPlace(place),
              }}
            >
              <Popup>
                <div className="min-w-[210px]">
                  <strong className="text-sm">
                    {getPlaceName(place)}
                  </strong>

                  <div className="mt-1 text-xs capitalize text-gray-600">
                    {getPlaceCategory(place)}
                  </div>

                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        toggleSavedPlace(place)
                      }
                      className="rounded-md bg-purple-600 px-2 py-1 text-xs font-semibold text-white"
                    >
                      {savedPlaces.includes(
                        getPlaceName(place),
                      )
                        ? '✓ Saved'
                        : '⭐ Save'}
                    </button>

                    <a
                      href={getMapsUrl(place)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 no-underline"
                    >
                      🗺️ Maps
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* PLACES LIST */}
      {validPlaces.length > 0 && (
        <div className="border-t border-dark-button bg-[#17243a] p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-dark-primary">
                🧭 Explore Nearby
              </h4>

              <p className="mt-1 text-xs text-dark-secondary">
                Click a place to move the map and explore it.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {validPlaces.slice(0, 12).map((place, index) => {
              const name = getPlaceName(place);
              const category =
                getPlaceCategory(place);

              const isSaved =
                savedPlaces.includes(name);

              return (
                <div
                  key={`card-${name}-${index}`}
                  className={`rounded-xl border p-4 transition ${
                    selectedPlace === place
                      ? 'border-purple-400 bg-purple-500/10'
                      : 'border-dark-button bg-[#20304a]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPlace(place)
                    }
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
                        ★
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-dark-primary">
                          {name}
                        </p>

                        <p className="mt-1 text-xs capitalize text-dark-secondary">
                          {category}
                        </p>
                      </div>
                    </div>
                  </button>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        toggleSavedPlace(place)
                      }
                      className="flex-1 rounded-lg border border-dark-button px-2 py-1.5 text-xs font-semibold text-dark-secondary hover:bg-dark-button"
                    >
                      {isSaved
                        ? '✓ Saved'
                        : '⭐ Save'}
                    </button>

                    <a
                      href={getMapsUrl(place)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 rounded-lg bg-purple-600 px-2 py-1.5 text-center text-xs font-semibold text-white no-underline hover:bg-purple-500"
                    >
                      🗺️ Open
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {validPlaces.length > 12 && (
            <p className="mt-4 text-center text-xs text-dark-secondary">
              Showing 12 of {validPlaces.length} nearby places.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
