import SpotifyTopTracks from '@/components/SpotifyTopTracks';
import SpotifyTopArtists from '@/components/SpotifyTopArtists';
import Section from '@/components/ui/Section';
import BarSparkline from '@/components/ui/BarSparkline';
import { getBostonJourneyEquivalence } from '@/lib/journeyEquivalents';
import { getTrainingSplit } from '@/lib/trainingSplit';
import { getSpotifyWindowLabel } from '@/lib/spotifyWindow';
import GoodreadsCard from '@/components/GoodreadsCard';
import DuolingoCard from '@/components/DuolingoCard';
import Pinboard from '@/components/Pinboard';
import PinCard from '@/components/PinCard';
import StaleBadge from '@/components/ui/StaleBadge';
import JourneyArc from '@/components/ui/JourneyArc';
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

const SPORT_BAR = {
  running: 'bg-teal-500 dark:bg-teal-400',
  biking: 'bg-indigo-500 dark:bg-indigo-400',
  other: 'bg-slate-400 dark:bg-slate-500',
};

/**
 * Run / bike / other, barred by hours.
 *
 * Numbers sit above a full-width bar rather than beside it — a masonry column
 * is ~250px of content and a label + km + hours + bar on one row squeezed the
 * bar down to nothing.
 */
function SportSplit({ split }) {
  if (!split || split.rows.length === 0) return null;

  const maxHours = Math.max(...split.rows.map(row => row.hours));

  return (
    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        by sport
      </div>
      <ul className="space-y-2">
        {split.rows.map(row => (
          <li key={row.key}>
            <div className="flex items-baseline justify-between gap-2 text-[11px]">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                <span aria-hidden="true">{row.emoji}</span> {row.label}
              </span>
              <span className="tabular-nums text-slate-500 dark:text-slate-400">
                {KM_FORMAT.format(Math.round(row.km))} km ·{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {row.hours.toFixed(1)} h
                </span>
              </span>
            </div>
            <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <span
                className={`block h-full rounded-full ${SPORT_BAR[row.key] ?? SPORT_BAR.other}`}
                style={{ width: `${Math.max(3, (row.hours / maxHours) * 100)}%` }}
              />
            </span>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default function AboutSection({
  statsData = null,
  spotifyData = null,
  goodreadsData = null,
  duolingoData = null,
}) {
  const stats = statsData;
  const spotify = spotifyData;
  const combined = stats?.stats?.combined;
  const weeklySeries = Array.isArray(combined?.weekly?.series) ? combined.weekly.series : [];
  const recent = Array.isArray(combined?.recent?.last60) ? combined.recent.last60 : [];

  const weeklyHours = weeklySeries.map(row => Number(row?.time_hours) || 0);
  const totalHours8w = weeklyHours.length
    ? weeklyHours.reduce((sum, hours) => sum + hours, 0)
    : null;

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

  const sportSplit = getTrainingSplit(stats);
  const spotifyWindow = getSpotifyWindowLabel(spotify?.time_range);

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


  const weekLabels = weeklySeries.map(row => {
    const d = parseDateOnlyLocal(row?.week_start);
    return d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
  });

  return (
    <Section id="about" title="about me" icon={Sparkles}>
      <Pinboard>
        <div className="columns-1 gap-5 sm:columns-2 [&>*]:mb-5 [&>*]:break-inside-avoid">

          {/* Training Stats — expanded */}
          <PinCard rotation={-1.8} pinColor="red">
            <div className="rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  training · 8 weeks
                </div>
                <StaleBadge staleness={stats?._staleness} />
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold leading-none text-slate-900 dark:text-white">
                  {totalHours8w == null ? '—' : totalHours8w.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">hours</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{totalKmLabel} km</span>
                <span>·</span>
                <span>{totalCaloriesLabel} kcal</span>
                {rangeLabel && (
                  <>
                    <span>·</span>
                    <span className="tabular-nums">{rangeLabel}</span>
                  </>
                )}
              </div>

              {/* Cups of milk callout */}
              {totalCalories8w != null && (
                <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950/40">
                  <span className="text-lg leading-none">🥛</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-teal-700 dark:text-teal-300">{totalMilkCupsLabel}</span>
                    <span className="text-xs font-medium text-teal-600 dark:text-teal-400">cups of milk burned</span>
                  </div>
                </div>
              )}

              {/* Weekly bar chart */}
              {weeklyHours.length > 1 && (
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    hours per week
                  </div>
                  <BarSparkline
                    values={weeklyHours}
                    height={48}
                    labels={weekLabels}
                    labelOrientation="stacked"
                    labelClassName="text-[9px] text-slate-400 dark:text-slate-500"
                    formatter={(v) => `${v.toFixed(1)} hrs`}
                    className="text-teal-600 dark:text-teal-400"
                  />
                </div>
              )}

              <SportSplit split={sportSplit} />

              {kmJourney && (
                <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-700">
                  <JourneyArc
                    percent={kmJourney.percent}
                    origin={kmJourney.origin}
                    destination={kmJourney.destination}
                  />
                  <div className="mt-1.5 text-[11px] font-medium text-teal-600 dark:text-teal-400">
                    {totalKmLabel} km ≈ {kmJourney.percent}% of the way
                    <span className="text-stone-400 dark:text-stone-500">
                      {' '}({KM_FORMAT.format(Math.round(kmJourney.routeDistanceKm))} km total)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </PinCard>

          {/* Top Artists — own card */}
          <PinCard rotation={1.5} pinColor="blue" pinPosition="right">
            <div className="rounded-sm border border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  🎵 top artists{' '}
                  <span className="font-medium normal-case tracking-normal text-slate-400 dark:text-slate-500">
                    · {spotifyWindow}
                  </span>
                </div>
                <StaleBadge staleness={spotify?._staleness} />
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

          {/* Duolingo — sits under Reading in the left column */}
          <PinCard rotation={1.4} pinColor="teal">
            <div className="rounded-sm border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
              <DuolingoCard data={duolingoData} bare />
            </div>
          </PinCard>

          {/* Top Tracks — own card */}
          <PinCard rotation={-0.8} pinColor="yellow" pinPosition="left">
            <div className="rounded-sm border border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  🎧 top tracks{' '}
                  <span className="font-medium normal-case tracking-normal text-slate-400 dark:text-slate-500">
                    · {spotifyWindow}
                  </span>
                </div>
                <StaleBadge staleness={spotify?._staleness} />
              </div>
              <div className="mt-2">
                <SpotifyTopTracks tracks={spotify?.tracks ?? []} visibleCount={7} />
              </div>
            </div>
          </PinCard>

        </div>

      </Pinboard>
    </Section>
  );
}
