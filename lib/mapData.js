/**
 * Geographic coordinates and category grouping for the interactive pin map.
 */

export const COORDINATES = {
  'Boston, MA': [42.36, -71.06],
  'Richmond, VA': [37.54, -77.44],
  'Groton, CT': [41.35, -72.08],
  'Fort Meade, MD': [39.11, -76.74],
  'New York, NY': [40.71, -74.01],
  'Miami, FL': [25.76, -80.19],
  'Maryland': [39.05, -76.64],
  'Montreal': [45.50, -73.57],
  'Budapest, Hungary': [47.47, 19.06],
  'Ellicott City, MD': [39.27, -76.80],
};

export const WORLD_INSET_LOCATIONS = ['Budapest, Hungary', 'Montreal'];

/**
 * Returns [longitude, latitude] for react-simple-maps (expects [lon, lat])
 */
export function toMapCoords(locationName) {
  const coords = COORDINATES[locationName];
  if (!coords) return null;
  return [coords[1], coords[0]];
}

export function isWorldInset(locationName) {
  return WORLD_INSET_LOCATIONS.includes(locationName);
}

export const WORK_PINS = [
  { org: 'Capital One', role: 'Incoming SWE Intern', location: 'Richmond, VA', period: 'Summer 2026', emoji: '🏦', img: '/logos/normalized/capitalone-logo.png' },
  { org: 'NExT Consulting', role: 'SWE Co-op', location: 'Boston, MA', period: 'Fall 2025', img: '/logos/normalized/next-logo.png' },
  { org: 'General Dynamics Electric Boat', role: 'SDE Co-op', location: 'Groton, CT', period: '2024', img: '/logos/normalized/gdeb-logo.png' },
  { org: 'DISA', role: 'Admin Assistant', location: 'Fort Meade, MD', period: '2023', img: '/logos/normalized/disa-logo.png' },
  { org: 'Freelance SWE', role: 'Comic Book Grading App', location: 'New York, NY', period: 'Jan 2026–Present', emoji: '💼' },
];

export const EDUCATION_PINS = [
  { org: 'Northeastern University', role: 'B.S. CS & Math', location: 'Boston, MA', period: 'Sep 2022 – May 2027', emoji: '🎓', img: '/logos/normalized/nu-logo.png' },
  { org: 'Corvinus University', role: 'Study Abroad', location: 'Budapest, Hungary', period: 'Jun – Aug 2025', emoji: '🇭🇺', img: '/logos/normalized/corvinus-logo.png' },
  { org: 'Centennial High School', role: 'High School Diploma', location: 'Ellicott City, MD', period: '2018 – 2022', emoji: '🦅' },
];

export const ACTIVITY_PINS = [
  { org: 'Bridge to Calculus', role: 'Tutor', location: 'Boston, MA', period: '2023–Present', emoji: '📐' },
  { org: 'CS Tutor', role: 'Khoury College', location: 'Boston, MA', period: '2024–Present', emoji: '💻' },
  { org: 'Math Club / Putnam Club', role: 'Member', location: 'Boston, MA', period: '2023–Present', emoji: '🔢' },
  {
    org: 'Poker',
    role: 'Player',
    locations: ['Maryland', 'Miami, FL', 'Montreal', 'Boston, MA'],
    period: '2022–Present',
    emoji: '🃏',
  },
];

export const CATEGORIES = [
  { id: 'work', label: 'work', pins: WORK_PINS },
  { id: 'education', label: 'education', pins: EDUCATION_PINS },
  { id: 'activities', label: 'activities', pins: ACTIVITY_PINS },
];
