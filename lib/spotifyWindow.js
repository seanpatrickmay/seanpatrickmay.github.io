// Human label for Spotify's `time_range`.
//
// "top artists" with no window reads as all-time; it is actually a rolling
// four-week chart, which is the more interesting claim. The value travels in
// spotify.json so this label tracks whatever the script asked for.

const WINDOWS = {
  short_term: 'last 4 weeks',
  medium_term: 'last 6 months',
  long_term: 'all time',
};

export function getSpotifyWindowLabel(timeRange) {
  return WINDOWS[timeRange] ?? WINDOWS.short_term;
}
