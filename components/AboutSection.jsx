import { useState, useEffect, useMemo } from 'react';
import Badge from '@/components/ui/Badge';
import ActivityToggle from '@/components/ui/ActivityToggle';
import BarSparkline from '@/components/ui/BarSparkline';
import SpotifyTopArtists from '@/components/SpotifyTopArtists';
import SpotifyTopTracks from '@/components/SpotifyTopTracks';
import RecentActivities from '@/components/RecentActivities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Section from '@/components/ui/Section';
import Stat from '@/components/ui/Stat';
import { Sparkles, Brain, Dumbbell, Music } from 'lucide-react';

const CALORIES_PER_CUP_OF_MILK = 124;

const CITY_ROUTES = [
  { from: 'Boston', to: 'Providence', distanceKm: 81 },
  { from: 'Boston', to: 'New York City', distanceKm: 306 },
  { from: 'Boston', to: 'Montreal', distanceKm: 495 },
  { from: 'Boston', to: 'Washington, DC', distanceKm: 725 },
  { from: 'Boston', to: 'Toronto', distanceKm: 880 },
  { from: 'Boston', to: 'Chicago', distanceKm: 1585 },
  { from: 'Boston', to: 'Miami', distanceKm: 2413 },
];

const WEEK_RANGE_FORMAT = { month: 'short', day: 'numeric' };
const WEEK_BOUNDARY_FORMAT = { month: 'long', day: 'numeric' };

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCups(value) {
  if (!value || value <= 0) return '0 cups of milk 🥛 (2%)';
  const cups = value >= 10 ? Math.round(value) : Number(value.toFixed(1));
  return `${cups} cups of milk 🥛 (2%)`;
}

function formatCalories(value) {
  if (!value || value <= 0) return '0 kcal';
  if (value >= 1000) return `${Math.round(value / 100) / 10}k kcal`;
  return `${Math.round(value)} kcal`;
}

function describeBikingRoute(distanceKm) {
  if (!distanceKm || distanceKm <= 0) {
    return {
      summary: 'Chart a city-to-city ride',
      detail: 'Log a ride to unlock a comparison route.',
    };
  }

  const sortedRoutes = CITY_ROUTES.slice().sort((a, b) => a.distanceKm - b.distanceKm);
  let closestRoute = sortedRoutes[0];
  let closestDiff = Math.abs(distanceKm - closestRoute.distanceKm);

  for (const route of sortedRoutes) {
    const diff = Math.abs(distanceKm - route.distanceKm);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestRoute = route;
    }
  }

  if (distanceKm < closestRoute.distanceKm) {
    const remaining = closestRoute.distanceKm - distanceKm;
    return {
      summary: `${closestRoute.from} → ${closestRoute.to}`,
      detail: `${distanceKm.toFixed(0)} km logged • ${remaining.toFixed(0)} km to go`,
    };
  }

  const laps = distanceKm / closestRoute.distanceKm;
  if (laps < 1.3) {
    return {
      summary: `${closestRoute.from} → ${closestRoute.to}`,
      detail: `${distanceKm.toFixed(0)} km ≈ ${closestRoute.distanceKm} km ride`,
    };
  }

  const precision = laps >= 10 ? 0 : 1;
  return {
    summary: `${laps.toFixed(precision)}× ${closestRoute.from} → ${closestRoute.to}`,
    detail: `${distanceKm.toFixed(0)} km total on a ${closestRoute.distanceKm} km route`,
  };
}

function formatWeekRange(week) {
  if (!week?.week_start || !week?.week_end) return '';
  try {
    const start = new Date(`${week.week_start}T00:00:00`);
    const end = new Date(`${week.week_end}T00:00:00`);
    const formatter = new Intl.DateTimeFormat('en-US', WEEK_RANGE_FORMAT);
    return `${formatter.format(start)} → ${formatter.format(end)}`;
  } catch (error) {
    return `${week.week_start} → ${week.week_end}`;
  }
}

function formatWeekBoundary(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(`${dateString}T00:00:00`);
    return new Intl.DateTimeFormat('en-US', WEEK_BOUNDARY_FORMAT).format(date);
  } catch (error) {
    return dateString;
  }
}

function deriveTrainingInsights(allStats) {
  if (!allStats) {
    return {
      calories: {},
      cups: {},
      routes: {
        combined: describeBikingRoute(0),
        biking: describeBikingRoute(0),
        running: describeBikingRoute(0),
      },
    };
  }

  const calories = {};
  const cups = {};
  const routes = {};

  const activityKeys = ['combined', 'biking', 'running', 'swimming'];
  activityKeys.forEach(key => {
    const monthly = allStats[key]?.monthly;
    const calorieTotal = toNumber(monthly?.calories_kcal);
    calories[key] = calorieTotal;
    cups[key] = calorieTotal > 0 ? calorieTotal / CALORIES_PER_CUP_OF_MILK : 0;
  });

  const routeKeys = ['combined', 'biking', 'running'];
  routeKeys.forEach(key => {
    const distance = toNumber(allStats?.[key]?.monthly?.distance_km);
    routes[key] = describeBikingRoute(distance);
  });

  return {
    calories,
    cups,
    routes,
  };
}

function useStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch('/stats.json', { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => setStats(null));
  }, []);
  return stats;
}

function useSpotify() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/spotify.json', { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);
  return data;
}

export default function AboutSection({ interests }) {
  const stats = useStats();
  const spotify = useSpotify();
  const [activity, setActivity] = useState('combined');

  const data = stats?.stats?.[activity];
  const monthly = data?.monthly;
  const series = data?.weekly?.series ?? [];

  const [weeklyMetric, setWeeklyMetric] = useState('distance');

  useEffect(() => {
    setWeeklyMetric('distance');
  }, [activity]);

  const latestWeek = series.length ? series.at(-1) : null;
  const lastFullWeek = series.length > 1 ? series.at(-2) : latestWeek;
  const comparisonWeek = series.length > 2 ? series.at(-3) : null;

  const lastWeekDistance = Number.isFinite(Number(lastFullWeek?.distance_km))
    ? Number(lastFullWeek.distance_km)
    : null;
  const lastWeekHours = Number.isFinite(Number(lastFullWeek?.time_hours)) ? Number(lastFullWeek.time_hours) : null;
  const comparisonDistance = Number.isFinite(Number(comparisonWeek?.distance_km))
    ? Number(comparisonWeek.distance_km)
    : null;
  const comparisonHours = Number.isFinite(Number(comparisonWeek?.time_hours))
    ? Number(comparisonWeek.time_hours)
    : null;
  const distanceDelta =
    lastWeekDistance !== null && comparisonDistance !== null
      ? lastWeekDistance - comparisonDistance
      : null;
  const hoursDelta =
    lastWeekHours !== null && comparisonHours !== null ? lastWeekHours - comparisonHours : null;

  const weeklyMetricOptions = [
    { key: 'distance', label: 'Distance' },
    { key: 'hours', label: 'Hours' },
  ];

  const weeklyMetricDetails = useMemo(() => {
    if (weeklyMetric === 'hours') {
      return {
        key: 'hours',
        label: 'Hours',
        unit: 'h',
        decimals: 1,
        accessor: week => Number(week?.time_hours) || 0,
        delta: hoursDelta,
      };
    }
    return {
      key: 'distance',
      label: 'Distance',
      unit: 'km',
      decimals: 1,
      accessor: week => Number(week?.distance_km) || 0,
      delta: distanceDelta,
    };
  }, [weeklyMetric, distanceDelta, hoursDelta]);

  const weeklyValues = useMemo(
    () => series.map(week => weeklyMetricDetails.accessor(week)),
    [series, weeklyMetricDetails]
  );
  const trainingInsights = useMemo(() => deriveTrainingInsights(stats?.stats), [stats]);
  const selectedCalories = trainingInsights.calories?.[activity] ?? 0;
  const selectedCups = trainingInsights.cups?.[activity] ?? 0;
  const routeEquivalents = trainingInsights.routes ?? {};

  const routeLabelMap = {
    combined: 'All activity',
    biking: 'Biking',
    running: 'Running',
  };
  const selectedRoute = routeEquivalents?.[activity];

  const activityLabels = {
    combined: 'all sessions',
    biking: 'biking',
    running: 'running',
  };

  return (
    <Section id="about" title="About me" icon={Sparkles}>
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-30 dark:opacity-20"
          style={{
            background: 'radial-gradient(60% 40% at 50% 20%, rgba(15,23,42,0.08), transparent 60%)'
          }}
        />
        <div className="space-y-12">
          <div className="grid md:grid-cols-5 gap-8 items-start">
            <div className="md:col-span-3 space-y-4">
              <p className="text-lg text-slate-600 dark:text-slate-300">
                I'm a CS & Math student just trying to get better at everything I do.
                <br />
                <br />
                I love solving hard problems—if you have any for me, send me an email, I'd love to chat.
                <br />
                <br />
                Check out some of my projects below: RL Research, Computer Vision, Tree-Search, Game Theory, and Concurrency.
              </p>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle icon={Brain}>Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {interests.map(i => (
                      <Badge key={i}>{i}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>


          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-2xl font-semibold">
                <Dumbbell className="w-5 h-5" />
                Training
              </h3>
              <p className="text-slate-600 dark:text-slate-300">Observe how I move.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="space-y-6 md:col-span-2">
                <CardHeader action={<ActivityToggle activity={activity} onChange={setActivity} />}>
                  <CardTitle>30-Day Volume</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-4">
                  <Stat value={monthly ? monthly.distance_km : '—'} label="Total km" />
                  <Stat value={monthly?.time_hours ?? '—'} label="Hours" />
                  <Stat value={monthly?.activities_count ?? '—'} label="Sessions" />
                  {monthly && (
                    <div className="sm:col-span-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/70 p-4 text-center shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Calorie tally
                        </div>
                        <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                          {formatCups(selectedCups)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {formatCalories(selectedCalories)} burned across {activityLabels[activity] ?? 'training'}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/70 p-4 text-center shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:col-span-1">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Route equivalents
                        </div>
                        <div className="mt-2 grid gap-2 text-center text-xs text-slate-600 dark:text-slate-300">
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">
                              {selectedRoute?.summary ?? 'Log more sessions'}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {selectedRoute?.detail ?? ''}
                            </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Highlights (30 Days)</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-0 px-6 pb-6 pt-0">
                  <div className="flex-1 overflow-hidden">
                    <RecentActivities activities={data?.recent?.last10 ?? data?.recent?.last3 ?? []} />
                  </div>
                </CardContent>
              </Card>
            </div>

              <Card>
                <CardHeader action={<ActivityToggle activity={activity} onChange={setActivity} />}>
                  <CardTitle>Weekly Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1 rounded-3xl border border-white/10 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Weekly trend
                        </span>
                        <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1 py-1 text-xs dark:border-slate-700 dark:bg-slate-900">
                          {weeklyMetricOptions.map(option => (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => setWeeklyMetric(option.key)}
                              className={`px-2 py-1 rounded-full transition ${
                                weeklyMetric === option.key
                                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {series.length ? (
                        <div className="mt-4 space-y-3">
                          <BarSparkline
                            values={weeklyValues}
                            formatter={(v, i) => {
                              const w = series[i];
                              const label = w ? formatWeekRange(w) || `Week ${i + 1}` : `Week ${i + 1}`;
                              const valueText = v.toFixed(weeklyMetricDetails.decimals);
                              return `${label}: ${valueText} ${weeklyMetricDetails.unit}`;
                            }}
                            height={72}
                            className="text-slate-700 dark:text-slate-200"
                          />
                          <div className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {formatWeekBoundary(series[0]?.week_start)} → {formatWeekBoundary(series.at(-1)?.week_end)}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">No weekly data yet</div>
                      )}
                    </div>

                    <div className="w-full rounded-2xl border border-white/10 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70 lg:max-w-xs">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Last week snapshot
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-between">
                          <span>Distance</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {lastWeekDistance !== null ? `${lastWeekDistance.toFixed(1)} km` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Hours</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {lastWeekHours !== null ? `${lastWeekHours.toFixed(1)} h` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>Week</span>
                          <span>{formatWeekRange(lastFullWeek) || '—'}</span>
                        </div>
                      </div>
                      {(distanceDelta !== null || hoursDelta !== null) && (
                        <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                          {distanceDelta !== null && (
                            <div
                              className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ${
                                distanceDelta >= 0
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                              }`}
                            >
                              {distanceDelta >= 0 ? '+' : '-'}
                              {Math.abs(distanceDelta).toFixed(1)} km vs week prior
                            </div>
                          )}
                          {hoursDelta !== null && (
                            <div className="text-slate-500 dark:text-slate-400">
                              Hours change: {hoursDelta >= 0 ? '+' : '-'}
                              {Math.abs(hoursDelta).toFixed(1)} h
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-2xl font-semibold">
                <Music className="w-5 h-5" />
                Music
              </h3>
              <p className="text-slate-600 dark:text-slate-300">A peek at what I'm listening to.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="space-y-9 md:col-span-2">
                <CardHeader>
                  <CardTitle>Top Artists</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpotifyTopArtists artists={spotify?.artists ?? []} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Tracks</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpotifyTopTracks tracks={spotify?.tracks ?? []} />
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </Section>
  );
}
