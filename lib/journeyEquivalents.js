const BOSTON = { name: 'Boston', lat: 42.3601, lon: -71.0589 };

// Broad, "impressive" destination set across many distance bands.
// Coordinates are city-center approximations; distances are computed via straight-line haversine.
const DESTINATIONS = [
  // New England / Northeast
  { name: 'Providence', lat: 41.824, lon: -71.4128 },
  { name: 'Portland, ME', lat: 43.6591, lon: -70.2568 },
  { name: 'Hartford', lat: 41.7658, lon: -72.6734 },
  { name: 'New Haven', lat: 41.3083, lon: -72.9279 },
  { name: 'Albany', lat: 42.6526, lon: -73.7562 },
  { name: 'Burlington, VT', lat: 44.4759, lon: -73.2121 },
  { name: 'Portsmouth, NH', lat: 43.0718, lon: -70.7626 },
  { name: 'Bangor, ME', lat: 44.8012, lon: -68.7778 },
  { name: 'New York City', lat: 40.7128, lon: -74.006 },
  { name: 'Philadelphia', lat: 39.9526, lon: -75.1652 },
  { name: 'Baltimore', lat: 39.2904, lon: -76.6122 },
  { name: 'Washington, DC', lat: 38.9072, lon: -77.0369 },
  { name: 'Pittsburgh', lat: 40.4406, lon: -79.9959 },
  { name: 'Buffalo', lat: 42.8864, lon: -78.8784 },
  { name: 'Cleveland', lat: 41.4993, lon: -81.6944 },
  { name: 'Detroit', lat: 42.3314, lon: -83.0458 },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832 },
  { name: 'Ottawa', lat: 45.4215, lon: -75.6972 },
  { name: 'Montréal', lat: 45.5017, lon: -73.5673 },
  { name: 'Québec City', lat: 46.8139, lon: -71.208 },
  { name: 'Halifax', lat: 44.6488, lon: -63.5752 },
  { name: 'St. John’s', lat: 47.5615, lon: -52.7126 },

  // Midwest / South / West (US + Canada)
  { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { name: 'Indianapolis', lat: 39.7684, lon: -86.1581 },
  { name: 'Columbus', lat: 39.9612, lon: -82.9988 },
  { name: 'Cincinnati', lat: 39.1031, lon: -84.512 },
  { name: 'Nashville', lat: 36.1627, lon: -86.7816 },
  { name: 'Atlanta', lat: 33.749, lon: -84.388 },
  { name: 'Charlotte', lat: 35.2271, lon: -80.8431 },
  { name: 'Raleigh', lat: 35.7796, lon: -78.6382 },
  { name: 'Richmond', lat: 37.5407, lon: -77.436 },
  { name: 'Miami', lat: 25.7617, lon: -80.1918 },
  { name: 'Tampa', lat: 27.9506, lon: -82.4572 },
  { name: 'New Orleans', lat: 29.9511, lon: -90.0715 },
  { name: 'Houston', lat: 29.7604, lon: -95.3698 },
  { name: 'Austin', lat: 30.2672, lon: -97.7431 },
  { name: 'Dallas', lat: 32.7767, lon: -96.797 },
  { name: 'Denver', lat: 39.7392, lon: -104.9903 },
  { name: 'Phoenix', lat: 33.4484, lon: -112.074 },
  { name: 'Las Vegas', lat: 36.1699, lon: -115.1398 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321 },
  { name: 'Vancouver', lat: 49.2827, lon: -123.1207 },
  { name: 'Calgary', lat: 51.0447, lon: -114.0719 },
  { name: 'Edmonton', lat: 53.5461, lon: -113.4938 },
  { name: 'Winnipeg', lat: 49.8951, lon: -97.1384 },
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332 },
  { name: 'Honolulu', lat: 21.3069, lon: -157.8583 },
  { name: 'Anchorage', lat: 61.2181, lon: -149.9003 },

  // Europe
  { name: 'Reykjavík', lat: 64.1466, lon: -21.9426 },
  { name: 'Dublin', lat: 53.3498, lon: -6.2603 },
  { name: 'Edinburgh', lat: 55.9533, lon: -3.1883 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
  { name: 'Brussels', lat: 50.8503, lon: 4.3517 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Lyon', lat: 45.764, lon: 4.8357 },
  { name: 'Barcelona', lat: 41.3851, lon: 2.1734 },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Lisbon', lat: 38.7223, lon: -9.1393 },
  { name: 'Zurich', lat: 47.3769, lon: 8.5417 },
  { name: 'Geneva', lat: 46.2044, lon: 6.1432 },
  { name: 'Milan', lat: 45.4642, lon: 9.19 },
  { name: 'Rome', lat: 41.9028, lon: 12.4964 },
  { name: 'Vienna', lat: 48.2082, lon: 16.3738 },
  { name: 'Prague', lat: 50.0755, lon: 14.4378 },
  { name: 'Berlin', lat: 52.52, lon: 13.405 },
  { name: 'Munich', lat: 48.1351, lon: 11.582 },
  { name: 'Copenhagen', lat: 55.6761, lon: 12.5683 },
  { name: 'Stockholm', lat: 59.3293, lon: 18.0686 },
  { name: 'Oslo', lat: 59.9139, lon: 10.7522 },
  { name: 'Helsinki', lat: 60.1699, lon: 24.9384 },
  { name: 'Warsaw', lat: 52.2297, lon: 21.0122 },
  { name: 'Budapest', lat: 47.4979, lon: 19.0402 },
  { name: 'Athens', lat: 37.9838, lon: 23.7275 },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784 },

  // Middle East / Africa
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Riyadh', lat: 24.7136, lon: 46.6753 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { name: 'Casablanca', lat: 33.5731, lon: -7.5898 },
  { name: 'Lagos', lat: 6.5244, lon: 3.3792 },
  { name: 'Nairobi', lat: -1.2921, lon: 36.8219 },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241 },
  { name: 'Johannesburg', lat: -26.2041, lon: 28.0473 },

  // Asia / Oceania
  { name: 'Delhi', lat: 28.6139, lon: 77.209 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
  { name: 'Shanghai', lat: 31.2304, lon: 121.4737 },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'Seoul', lat: 37.5665, lon: 126.978 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Osaka', lat: 34.6937, lon: 135.5023 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Melbourne', lat: -37.8136, lon: 144.9631 },
  { name: 'Auckland', lat: -36.8485, lon: 174.7633 },

  // South America
  { name: 'Bogotá', lat: 4.711, lon: -74.0721 },
  { name: 'Lima', lat: -12.0464, lon: -77.0428 },
  { name: 'Santiago', lat: -33.4489, lon: -70.6693 },
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { name: 'São Paulo', lat: -23.5558, lon: -46.6396 },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
];

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(a, b) {
  const R = 6371; // km
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

const ROUTES_FROM_BOSTON = DESTINATIONS
  .map(city => ({
    name: city.name,
    distanceKm: haversineKm(BOSTON, city),
  }))
  .filter(route => Number.isFinite(route.distanceKm) && route.distanceKm > 1)
  .sort((a, b) => a.distanceKm - b.distanceKm);

export function getBostonJourneyEquivalence(distanceKm) {
  const km = Number(distanceKm);
  if (!Number.isFinite(km) || km <= 0 || ROUTES_FROM_BOSTON.length === 0) return null;

  // Choose the nearest route whose length is >= km (so percent <= 100).
  let lo = 0;
  let hi = ROUTES_FROM_BOSTON.length - 1;
  let bestIdx = ROUTES_FROM_BOSTON.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (ROUTES_FROM_BOSTON[mid].distanceKm >= km) {
      bestIdx = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }

  const route = ROUTES_FROM_BOSTON[bestIdx];
  const percent = Math.max(1, Math.min(100, Math.round((km / route.distanceKm) * 100)));

  return {
    destination: route.name,
    percent,
    routeDistanceKm: route.distanceKm,
  };
}

