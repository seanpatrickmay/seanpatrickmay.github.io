import SpotifyTopTracks from '@/components/SpotifyTopTracks';
import SpotifyTopArtists from '@/components/SpotifyTopArtists';
import Section from '@/components/ui/Section';
import HobbySpotlight from '@/components/HobbySpotlight';
import LineSparkline from '@/components/ui/LineSparkline';
import BarSparkline from '@/components/ui/BarSparkline';
import { getBostonJourneyEquivalence } from '@/lib/journeyEquivalents';
import GoodreadsCard from '@/components/GoodreadsCard';
import Pinboard from '@/components/Pinboard';
import PinCard from '@/components/PinCard';
import { Sparkles } from 'lucide-react';

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
  statsData = null,
  spotifyData = null,
  goodreadsData = null,
}) {
  const stats = statsData;
  const spotify = spotifyData;
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
    { title: 'Prompting', emoji: '🚀' },
    { title: 'Triathlon', emoji: '🏊‍♂️' },
    { title: 'Français', emoji: '🇫🇷' },
    { title: 'Escape Rooms', emoji: '🗝️' },
  ];

  const weekLabels = weeklySeries.map(row => {
    const d = parseDateOnlyLocal(row?.week_start);
    return d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
  });

  return (
    <Section id="about" title="about me" icon={Sparkles}>
      <Pinboard>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

          {/* Training Stats — expanded */}
          <PinCard rotation={-1.8} pinColor="red">
            <div className="border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                training · 8 weeks
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold leading-none text-stone-900 dark:text-white">
                  {totalHours8w == null ? '—' : totalHours8w.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-stone-400 dark:text-stone-500">hours</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-stone-500 dark:text-stone-400">
                <span>{totalKmLabel} km</span>
                <span>·</span>
                <span>{totalCaloriesLabel} kcal</span>
                <span>·</span>
                <span>~{totalMilkCupsLabel} cups milk</span>
              </div>

              {/* Cumulative sparkline */}
              <LineSparkline
                values={cumulativeHours}
                height={40}
                className="mt-3 text-stone-900 dark:text-white"
                label="Cumulative training hours over 8 weeks"
              />

              {/* Weekly bar chart */}
              {weeklyHours.length > 1 && (
                <div className="mt-4 border-t border-stone-100 pt-3 dark:border-stone-700">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">
                    hours per week
                  </div>
                  <BarSparkline
                    values={weeklyHours}
                    height={48}
                    labels={weekLabels}
                    labelOrientation="stacked"
                    labelClassName="text-[9px] text-stone-400 dark:text-stone-500"
                    formatter={(v) => `${v.toFixed(1)} hrs`}
                    className="text-teal-600 dark:text-teal-400"
                  />
                </div>
              )}

              {kmJourney && (
                <div className="mt-2 text-[11px] font-medium text-teal-600 dark:text-teal-400">
                  ~{kmJourney.percent}% of the way to {kmJourney.destination}
                </div>
              )}
              {rangeLabel && (
                <div className="mt-1 text-[10px] text-stone-400 dark:text-stone-500">{rangeLabel}</div>
              )}
            </div>
          </PinCard>

          {/* Top Artists — own card */}
          <PinCard rotation={1.5} pinColor="blue" pinPosition="right">
            <div className="rounded-sm bg-slate-800 p-4 text-white dark:bg-slate-900">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                🎵 top artists
              </div>
              <div className="mt-2">
                <SpotifyTopArtists artists={spotify?.artists ?? []} visibleCount={7} />
              </div>
            </div>
          </PinCard>

          {/* Goodreads */}
          <PinCard rotation={1} pinColor="green">
            <div className="border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
              <GoodreadsCard data={goodreadsData} bare />
            </div>
          </PinCard>

          {/* Top Tracks — own card */}
          <PinCard rotation={-0.8} pinColor="yellow" pinPosition="left">
            <div className="rounded-sm bg-slate-800 p-4 text-white dark:bg-slate-900">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                🎧 top tracks
              </div>
              <div className="mt-2">
                <SpotifyTopTracks tracks={spotify?.tracks ?? []} visibleCount={7} />
              </div>
            </div>
          </PinCard>

          {/* Hobby stickers */}
          <div className="sm:col-span-2 pt-2">
            <HobbySpotlight hobbies={hobbySpotlights} />
          </div>

        </div>
      </Pinboard>
    </Section>
  );
}
