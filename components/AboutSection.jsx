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

  const weeklyValues = useMemo(() => series.map(w => w.distance_km), [series]);

  const lastWeek = weeklyValues.length > 1 ? weeklyValues.at(-2) : undefined;
  const bestWeek = weeklyValues.length ? Math.max(...weeklyValues) : undefined;
  const generatedAt = stats ? new Date(stats.generated_at) : null;
  const updatedAt = generatedAt
    ? new Date(generatedAt.getTime() - (10 - (generatedAt.getDate() % 11)) * 60 * 1000)
    : null;

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
		 <br></br>
        
		<br></br>
		I love solving hard problems, if you have any for me, send me an email, I'd love to chat.
		 <br></br>
        
		<br></br>
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
                <Music className="w-5 h-5" />
                Music
              </h3>
              <p className="text-slate-600 dark:text-slate-300">A peek at what I'm listening to.</p>
            </div>
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


          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-2xl font-semibold">
                <Dumbbell className="w-5 h-5" />
                Training
              </h3>
              <p className="text-slate-600 dark:text-slate-300">Snapshot of recent workouts.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader action={<ActivityToggle activity={activity} onChange={setActivity} />}>
                  <CardTitle>Monthly Training (last {monthly?.window_days ?? 30} days)</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-4">
                  <Stat value={monthly ? monthly.distance_km : '—'} label="Total distance (km)" />
                  <Stat value={monthly?.time_hours ?? '—'} label="Total hours" />
                  <Stat value={monthly?.activities_count ?? '—'} label="Activities" />
                  {monthly && updatedAt && (
                    <div className="sm:col-span-3 text-sm opacity-70 text-center">
                      Longest: {monthly.longest_km} km
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentActivities activities={data?.recent?.last10 ?? data?.recent?.last3 ?? []} />
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
                    Best distance week: {typeof bestWeek === 'number' ? bestWeek.toFixed(1) : '—'} km
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Section>
  );
}

