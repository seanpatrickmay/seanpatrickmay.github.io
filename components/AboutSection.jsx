import { useState, useEffect, useMemo } from 'react';
import Badge from '@/components/ui/Badge';
import ActivityToggle from '@/components/ui/ActivityToggle';
import BarSparkline from '@/components/ui/BarSparkline';
import SpotifyTopArtists from '@/components/SpotifyTopArtists';
import SpotifyTopTracks from '@/components/SpotifyTopTracks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Stat from '@/components/ui/Stat';
import { Sparkles, Brain, Target } from 'lucide-react';

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

  const weeklyValues = useMemo(
    () => series.map(w => w.distance_km),
    [series]
  );

  const lastWeek = weeklyValues.length > 1 ? weeklyValues.at(-2) : undefined;
  const bestWeek = weeklyValues.length ? Math.max(...weeklyValues) : undefined;
  const generatedAt = stats ? new Date(stats.generated_at) : null;
  const updatedAt = generatedAt
    ? new Date(
        generatedAt.getTime() -
          (10 - (generatedAt.getDate() % 11)) * 60 * 1000
      )
    : null;

  return (
    <section id="about" className="relative scroll-mt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-30 dark:opacity-20"
        style={{
          background:
            'radial-gradient(60% 40% at 50% 20%, rgba(15,23,42,0.08), transparent 60%)'
        }}
      />
      <div className="section-container py-14 space-y-10">
        <div className="grid md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-3 space-y-5">
            <Badge icon={Sparkles} variant="outline">
              About me
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              I learn by building — from algorithms to UX.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              My sweet spot is where CS fundamentals meet practical impact. I’ve built
              projects across computer vision, game-theoretic search, and systems-level C,
              and I enjoy shaping ideas into reliable, maintainable software.
            </p>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle icon={Brain}>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {interests.map(i => <Badge key={i}>{i}</Badge>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle icon={Target}>Part-Time Work</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Semi-Professional Poker (NLHE)</strong> — probabilistic reasoning, risk management, and disciplined decision-making.</li>
                <li><strong>Computer Science Tutor (CSA)</strong> — mentoring on fundamentals, debugging strategies, and problem-solving patterns.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader action={<ActivityToggle activity={activity} onChange={setActivity} />}>
              <CardTitle>
                Monthly Training (last {monthly?.window_days ?? 30} days)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <Stat
                value={monthly ? monthly.distance_km : '—'}
                label="Total distance (km)"
              />
              <Stat
                value={monthly?.time_hours ?? '—'}
                label="Total hours"
              />
              <Stat
                value={monthly?.activities_count ?? '—'}
                label="Activities"
              />
              {monthly && updatedAt && (
                <div className="sm:col-span-3 text-sm opacity-70 text-center">
                  Longest: {monthly.longest_km} km · Updated{' '}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(data?.recent?.last3 ?? []).map(a => (
                  <li key={a.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {a.name || a.type || 'Activity'}
                      </div>
                      <div className="text-xs opacity-70">{a.start}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm">{a.distance_km} km</div>
                      <div className="text-xs opacity-70">{a.duration_min} min</div>
                    </div>
                  </li>
                ))}
                {!data?.recent?.last3?.length && (
                  <div className="text-sm opacity-70">No recent activities</div>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader action={<ActivityToggle activity={activity} onChange={setActivity} />}>
            <CardTitle className="flex items-center gap-2">
              Weekly Training
              {weeklyValues.length > 1 && (
                <span className="text-sm opacity-70">
                  • last: <strong>{typeof lastWeek === 'number' ? lastWeek.toFixed(1) : '—'}</strong> km
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {series.length ? (
              <div className="grid md:grid-cols-2 gap-6 text-slate-900 dark:text-slate-100">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium opacity-80">Hours</div>
                  </div>
                  <BarSparkline
                    values={series.map(w => w.time_hours)}
                    formatter={(v, i) => {
                      const w = series[i];
                      const label = w ? `${w.week_start} → ${w.week_end}` : `Week ${i + 1}`;
                      return `${label}: ${v.toFixed(2)} h`;
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium opacity-80">Distance (km)</div>
                  </div>
                  <BarSparkline
                    values={series.map(w => w.distance_km)}
                    formatter={(v, i) => {
                      const w = series[i];
                      const label = w ? `${w.week_start} → ${w.week_end}` : `Week ${i + 1}`;
                      return `${label}: ${v.toFixed(1)} km`;
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm opacity-70">No weekly data yet</div>
            )}
            {weeklyValues.length ? (
              <div className="mt-3 text-xs opacity-70">
                Best distance week: {typeof bestWeek === 'number' ? bestWeek.toFixed(1) : '—'} km ·
                Updated {stats ? new Date(stats.generated_at).toLocaleDateString() : '—'}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
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
    </section>
  );
}

