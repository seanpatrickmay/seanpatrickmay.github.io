import { useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import SpotifyTopTracks from '@/components/SpotifyTopTracks';
import SpotifyTopArtists from '@/components/SpotifyTopArtists';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Section from '@/components/ui/Section';
import HobbySpotlight from '@/components/HobbySpotlight';
import CaseStudyCard from '@/components/projects/CaseStudyCard';
import LineSparkline from '@/components/ui/LineSparkline';
import { getBostonJourneyEquivalence } from '@/lib/journeyEquivalents';
import { Sparkles, TrendingUp, Music, ClipboardList, Users } from 'lucide-react';

function parseDateOnlyLocal(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfLocalDay(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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

export default function AboutSection({
  interests,
  featuredActivities = [],
  projectHighlights = [],
  projectHighlight = null,
}) {
  const stats = useStats();
  const spotify = useSpotify();
  const activities = Array.isArray(featuredActivities) ? featuredActivities : [];
  const highlights = Array.isArray(projectHighlights) ? projectHighlights.filter(Boolean) : [];
  if (highlights.length === 0 && projectHighlight) highlights.push(projectHighlight);
  const hasHighlights = highlights.length > 0;

  const combined = stats?.stats?.combined;
  const weeklySeries = Array.isArray(combined?.weekly?.series) ? combined.weekly.series : [];
  const recent = Array.isArray(combined?.recent?.last60) ? combined.recent.last60 : [];

  const weeklyHours = weeklySeries.map(row => Number(row?.time_hours) || 0);
  const cumulativeHours = weeklyHours.reduce((acc, hours) => {
    const nextTotal = (acc.length ? acc[acc.length - 1] : 0) + hours;
    acc.push(nextTotal);
    return acc;
  }, []);
  const totalHours8w = cumulativeHours.length ? cumulativeHours[cumulativeHours.length - 1] : null;

  const totalKm8w = weeklySeries.reduce((sum, row) => sum + (Number(row?.distance_km) || 0), 0);

  const totalCaloriesFromWeekly = weeklySeries.reduce(
    (sum, row) => sum + (Number(row?.calories_kcal) || 0),
    0,
  );

  const generatedAt = stats?.generated_at ? new Date(stats.generated_at) : new Date();
  const cutoff = new Date(generatedAt.getTime() - 56 * 24 * 60 * 60 * 1000);
  const totalCaloriesFromRecent = recent.reduce((sum, activity) => {
    const startRaw = activity?.start;
    if (typeof startRaw !== 'string') return sum;
    const start = new Date(startRaw.replace(' ', 'T'));
    if (Number.isNaN(start.getTime()) || start < cutoff) return sum;
    return sum + (Number(activity?.calories_kcal) || 0);
  }, 0);

  const totalCalories8w =
    totalCaloriesFromWeekly > 0 ? totalCaloriesFromWeekly : totalCaloriesFromRecent || null;

  const KM_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const KCAL_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const MILK_KCAL_PER_CUP = 150;
  const MILK_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

  const totalKmLabel = weeklySeries.length ? KM_FORMAT.format(Math.round(totalKm8w)) : '—';
  const totalKmRounded = weeklySeries.length ? Math.round(totalKm8w) : null;
  const kmJourney = totalKmRounded ? getBostonJourneyEquivalence(totalKmRounded) : null;
  const totalCaloriesLabel =
    totalCalories8w == null ? '—' : KCAL_FORMAT.format(Math.round(totalCalories8w));
  const totalMilkCupsLabel =
    totalCalories8w == null ? '—' : MILK_FORMAT.format(Math.round(totalCalories8w / MILK_KCAL_PER_CUP));

  const rangeLabel = (() => {
    const first = weeklySeries[0];
    const last = weeklySeries[weeklySeries.length - 1];
    if (!first?.week_start || !last?.week_end) return null;

    const start = parseDateOnlyLocal(first.week_start);
    const weekEnd = parseDateOnlyLocal(last.week_end);
    const generatedAtDay = startOfLocalDay(generatedAt);
    if (!start || !weekEnd || !generatedAtDay) return null;

    const end = weekEnd.getTime() > generatedAtDay.getTime() ? generatedAtDay : weekEnd;
    if (end.getTime() < start.getTime()) return null;

    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} → ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  })();

  const hobbySpotlights = [
    {
      title: 'Prompting',
      emoji: '✨',
      description: 'Token-maxxing. This site was vibe-coded.',
    },
    {
      title: 'Triathlon',
      emoji: '🏊‍♂️',
      description: 'I love steady state and eating',
    },
    {
      title: 'Français',
      emoji: '🇫🇷',
      description: 'Larping as a frenchman',
    },
    {
      title: 'Escape Rooms',
      emoji: '🗝️',
      description: 'Look up "Escape Simulator" on Steam',
    },
  ];

  const hiddenInterests = new Set(['Poker', 'Triathlon', 'Français', 'Escape Rooms']);
  const extraInterests = Array.isArray(interests)
    ? interests.filter(item => !hiddenInterests.has(item))
    : [];

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
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="bg-white/70 shadow-sm dark:bg-slate-900/60 h-full">
                <CardHeader>
                  <CardTitle icon={TrendingUp}>Training (8 weeks)</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Cumulative hours
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {totalHours8w == null ? '—' : `${totalHours8w.toFixed(1)}h`}
                      </div>
                    </div>

                    <LineSparkline values={cumulativeHours} height={56} className="text-slate-900 dark:text-white" />
                    {rangeLabel && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">{rangeLabel}</div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="rounded-xl border border-slate-200/60 bg-white/60 p-3 text-center dark:border-slate-800/60 dark:bg-slate-950/50">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Total KM
                        </div>
                        <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                          {totalKmLabel}
                        </div>
                        {kmJourney && (
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-snug">
                            Equivalent to ~{kmJourney.percent}% of the way to {kmJourney.destination}
                          </div>
                        )}
                      </div>
                      <div
                        className="rounded-xl border border-slate-200/60 bg-white/60 p-3 text-center dark:border-slate-800/60 dark:bg-slate-950/50"
                        title={`Rough conversion: 1 cup milk ≈ ${MILK_KCAL_PER_CUP} kcal`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Total Calories
                        </div>
                        <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                          {totalCaloriesLabel}
                        </div>
                        {totalCalories8w != null && (
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-snug">
                            Equivalent to ~{totalMilkCupsLabel} cups milk
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 shadow-sm dark:bg-slate-900/60 h-full flex flex-col">
                <CardHeader>
                  <CardTitle icon={Users}>Top Artists</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                  <SpotifyTopArtists artists={spotify?.artists ?? []} fillHeight />
                </CardContent>
              </Card>

              <Card className="bg-white/70 shadow-sm dark:bg-slate-900/60 h-full flex flex-col">
                <CardHeader>
                  <CardTitle icon={Music}>Top Tracks</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                  <SpotifyTopTracks tracks={spotify?.tracks ?? []} fillHeight />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  Off the clock
                </h3>
                {extraInterests.length > 0 && (
                  <div className="hidden sm:flex flex-wrap justify-end gap-2">
                    {extraInterests.map(item => (
                      <Badge key={item}>{item}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <HobbySpotlight hobbies={hobbySpotlights} />

              {extraInterests.length > 0 && (
                <div className="flex flex-wrap gap-2 sm:hidden">
                  {extraInterests.map(item => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
              )}
            </div>

            {hasHighlights && (
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  Project spotlights
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {highlights.map(project => (
                    <CaseStudyCard
                      key={project.slug || project.title}
                      project={project}
                      variant="compact"
                      className="bg-white/70 shadow-sm dark:bg-slate-900/60"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </Section>
  );
}
