import SpotifyTopTracks from '@/components/SpotifyTopTracks';
import SpotifyTopArtists from '@/components/SpotifyTopArtists';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Section from '@/components/ui/Section';
import HobbySpotlight from '@/components/HobbySpotlight';
import CaseStudyCard from '@/components/projects/CaseStudyCard';
import LineSparkline from '@/components/ui/LineSparkline';
import { getBostonJourneyEquivalence } from '@/lib/journeyEquivalents';
import GoodreadsCard from '@/components/GoodreadsCard';
import { Sparkles, TrendingUp, Music, Users } from 'lucide-react';

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

const KM_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const KCAL_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const MILK_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const MILK_KCAL_PER_CUP = 150;

export default function AboutSection({
  featuredActivities = [],
  projectHighlights = [],
  projectHighlight = null,
  statsData = null,
  spotifyData = null,
  goodreadsData = null,
}) {
  const stats = statsData;
  const spotify = spotifyData;
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
      emoji: '🚀',
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

  return (
    <Section id="about" title="About me" icon={Sparkles}>
      <div>
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
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

                    <LineSparkline values={cumulativeHours} height={56} className="text-slate-900 dark:text-white" label="Cumulative training hours over 8 weeks" />
                    {rangeLabel && (
                      <div className="text-xs text-slate-500 dark:text-slate-300">{rangeLabel}</div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div className="text-center">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                          Total KM
                        </div>
                        <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                          {totalKmLabel}
                        </div>
                        {kmJourney && (
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-300 leading-snug">
                            ~{kmJourney.percent}% to {kmJourney.destination}
                          </div>
                        )}
                      </div>
                      <div
                        className="text-center"
                        title={`Rough conversion: 1 cup milk ≈ ${MILK_KCAL_PER_CUP} kcal`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                          Calories
                        </div>
                        <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                          {totalCaloriesLabel}
                        </div>
                        {totalCalories8w != null && (
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-300 leading-snug">
                            ~{totalMilkCupsLabel} cups milk
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <GoodreadsCard data={goodreadsData} />

              <Card className="bg-white/70 shadow-sm dark:bg-slate-900/60 h-full">
                <CardHeader>
                  <CardTitle icon={Users}>Top Artists</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpotifyTopArtists artists={spotify?.artists ?? []} visibleCount={5} />
                </CardContent>
              </Card>

              <Card className="bg-white/70 shadow-sm dark:bg-slate-900/60 h-full">
                <CardHeader>
                  <CardTitle icon={Music}>Top Tracks</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpotifyTopTracks tracks={spotify?.tracks ?? []} visibleCount={5} />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-display text-2xl tracking-tight text-slate-900 dark:text-slate-50">
                when i'm not coding
              </h3>

              <HobbySpotlight hobbies={hobbySpotlights} />
            </div>

            {hasHighlights && (
              <div className="space-y-4">
                <h3 className="font-display text-2xl tracking-tight text-slate-900 dark:text-slate-50">
                  projects worth showing
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
