import Head from 'next/head';
import ThemeToggle from '@/components/ThemeToggle';
import Section from '@/components/ui/Section';
import ProjectCard from '@/components/ProjectCard';
import ExperienceItem from '@/components/ExperienceItem';
import SkillsGrid from '@/components/SkillsGrid';
import Badge from '@/components/ui/Badge';
import BarSparkline from '@/components/ui/BarSparkline';
import UnitToggle from '@/components/ui/UnitToggle';
import SpotifyTopArtists from '@/components/SpotifyTopArtists';
import SpotifyTopTracks from '@/components/SpotifyTopTracks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MapPin, Trophy, Briefcase, GraduationCap, Cpu, Brain, FileText, Github, Linkedin, Mail, Sparkles, BarChart, Target } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import rawExperience from '@/public/experience.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import { validateExperience } from '@/lib/experience';

const projects = validateProjects(rawProjects) ? rawProjects : [];
const experience = validateExperience(rawExperience) ? rawExperience : [];

const links = {
    github: 'https://github.com/seanpatrickmay',
    linkedin: 'https://linkedin.com/in/seanpatrickmay',
    email: 'mailto:may.se@northeastern.edu',
    resume: '/resume.pdf',
};

const skills = {
    languages: ['Python','Java','C','JavaScript','HTML','CSS'],
    tools: ['Git', 'PyTorch','NumPy','Neovim', 'Matplotlib','Jupyter','React'],
    platforms: ['Windows','macOS','Ubuntu Linux'],
};

const education = [
    {
	school: 'Northeastern University — Khoury College of Computer Sciences',
	degree: 'B.S. in Computer Science & Mathematics (Expected Dec 2026)',
	extras: [
	    'GPA 3.64/4.0; Dean’s Scholarship; Dean’s List (Fall 2024, Spring 2025)',
	    'Activities: Bridge to Calculus Tutor, Calculus Field Day Volunteer, Math Club, Putnam Club, Running Club',
	    'Relevant coursework: AI, Matrix Methods in ML, Algorithms & Data Structures, OOP, Computer Systems, Probability & Statistics',
	],
    },
    {
	school: 'Summer Study — Mathematical Heritage of Budapest',
	degree: 'Budapest, Hungary (Jun – Aug 2025)',
	extras: ['Courses: Number Theory, Exploration of Modern Mathematics'],
    },
];

const interests = [
    'Brain Teasers','Game Theory','Poker','Chess','Français','Track & Field','Triathlon','Skiing','Sports Science'
];

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

function AboutStat({ icon: Icon, label, value, hint }) {
    return (
	<Card className="transition hover:shadow-md">
	<CardContent className="pt-6">
	<div className="flex items-center justify-between">
	<div>
	<div className="text-3xl font-extrabold tracking-tight">{value}</div>
	<div className="text-sm opacity-70 mt-1">{label}</div>
	</div>
	<div className="p-2 rounded-xl border bg-white dark:bg-slate-900">
	<Icon className="w-5 h-5" />
	</div>
	</div>
	{hint ? <div className="text-xs opacity-60 mt-3">{hint}</div> : null}
	</CardContent>
	</Card>
    );
}

function AboutMe() {
  const stats = useStats();
  const spotify = useSpotify();
  const [unit, setUnit] = useState("mi"); // "mi" | "km"

  const monthly = stats?.monthly;
  const series = stats?.weekly?.series ?? [];

  const weeklyValues = useMemo(
    () => series.map(w => (unit === "mi" ? w.distance_mi : w.distance_km)),
    [series, unit]
  );

      // use previous week for "last" value (current week is still in progress)
  const lastWeek = weeklyValues.length > 1 ? weeklyValues.at(-2) : undefined;
  const bestWeek = weeklyValues.length ? Math.max(...weeklyValues) : undefined;
  const generatedAt = stats ? new Date(stats.generated_at) : null;
  // display updated time slightly behind the actual generated time, varying by day
  const updatedAt = generatedAt
    ? new Date(
        generatedAt.getTime() -
          (10 - (generatedAt.getDate() % 11)) * 60 * 1000
      )
    : null;
  return (
    <section id="about" className="relative scroll-mt-16">
      {/* Soft radial accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-30 dark:opacity-20"
        style={{
          background:
            'radial-gradient(60% 40% at 50% 20%, rgba(15,23,42,0.08), transparent 60%)'
        }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">

        {/* Deeper bio (distinct from hero) */}
        <div className="grid md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-3 space-y-5">
            <div className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full border bg-white dark:bg-slate-900">
              <Sparkles className="w-4 h-4" />
              <span>About me</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              I learn by building — from algorithms to UX.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              My sweet spot is where CS fundamentals meet practical impact. I’ve built
              projects across computer vision, game-theoretic search, and systems-level C,
              and I enjoy shaping ideas into reliable, maintainable software.
            </p>
          </div>

          {/* Interests moved here (no longer in hero) */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" /> Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {interests.map(i => <Badge key={i}>{i}</Badge>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Part-Time Work */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Part-Time Work */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" /> Part-Time Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Semi-Professional Poker (NLHE)</strong> — probabilistic reasoning, risk management, and disciplined decision-making.</li>
                <li><strong>Computer Science Tutor (CSA)</strong> — mentoring on fundamentals, debugging strategies, and problem-solving patterns.</li>
              </ul>
            </CardContent>
          </Card>
	</div>

	{/* Training stats */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Monthly */}
          <Card className="md:col-span-2">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>
                Monthly Training (last {monthly?.window_days ?? 30} days)
              </CardTitle>
              <UnitToggle unit={unit} onChange={setUnit} />
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-3xl font-extrabold">
                  {monthly
                    ? unit === "mi"
                      ? monthly.distance_mi
                      : monthly.distance_km
                    : "—"}
                </div>
                <div className="text-sm opacity-70 h-10 flex items-center justify-center text-center">
		    Total distance ({unit})
		</div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-3xl font-extrabold">
                  {monthly?.time_hours ?? "—"}
                </div>
                <div className="text-sm opacity-70 h-10 flex items-center justify-center">
		    Total hours
		</div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-3xl font-extrabold">
                  {monthly?.activities_count ?? "—"}
                </div>
                <div className="text-sm opacity-70 h-10 flex items-center justify-center">
		    Activities
		</div>
              </div>
              {monthly && updatedAt && (
                <div className="sm:col-span-3 text-sm opacity-70 text-center">
                  Longest:{" "}
                  {unit === "mi" ? monthly.longest_mi : monthly.longest_km}{" "}
                  {unit} · Updated{" "}
		  {updatedAt.toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent */}
          <Card>
            <CardHeader>
              <CardTitle>Recent</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(stats?.recent?.last3 ?? []).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {a.name || a.type || "Activity"}
                      </div>
                      <div className="text-xs opacity-70">{a.start}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm">
                        {unit === "mi" ? a.distance_mi : a.distance_km} {unit}
                      </div>
                      <div className="text-xs opacity-70">{a.duration_min} min</div>
                    </div>
                  </li>
                ))}
                {!stats?.recent?.last3?.length && (
                  <div className="text-sm opacity-70">No recent activities</div>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Sparkline */}
	{/* Weekly charts: Hours (left) + Distance (right) */}
<Card>
  <CardHeader className="flex items-center justify-between">
    <CardTitle className="flex items-center gap-2">
      Weekly Training
      {/* small live summary */}
      {weeklyValues.length > 1 && (
        <span className="text-sm opacity-70">
          • last:{" "}
          <strong>
            {typeof lastWeek === "number" ? lastWeek.toFixed(1) : "—"}
          </strong>{" "}
          {unit}
        </span>
      )}
    </CardTitle>
    {/* unit toggle only affects distance */}
    <UnitToggle unit={unit} onChange={setUnit} />
  </CardHeader>

  <CardContent>
    {series.length ? (
      <div className="grid md:grid-cols-2 gap-6 text-slate-900 dark:text-slate-100">
        {/* LEFT: Hours */}
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

        {/* RIGHT: Distance (mi|km toggle) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium opacity-80">
              Distance ({unit})
            </div>
          </div>
          <BarSparkline
            values={series.map(w => (unit === "mi" ? w.distance_mi : w.distance_km))}
            formatter={(v, i) => {
              const w = series[i];
              const label = w ? `${w.week_start} → ${w.week_end}` : `Week ${i + 1}`;
              return `${label}: ${v.toFixed(1)} ${unit}`;
            }}
          />
        </div>
      </div>
    ) : (
      <div className="text-sm opacity-70">No weekly data yet</div>
    )}

    {/* Best week footnote (distance uses current unit) */}
    {weeklyValues.length ? (
      <div className="mt-3 text-xs opacity-70">
        Best distance week:{" "}
        {typeof bestWeek === "number" ? bestWeek.toFixed(1) : "—"} {unit} ·
        Updated {stats ? new Date(stats.generated_at).toLocaleDateString() : "—"}
      </div>
    ) : null}
	</CardContent>
        </Card>
      {/* Spotify listening */}
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

// -----------------------------------------------------------------------------

export default function Home() {
    return (
	<>
	<Head>
	<title>Sean P. May — Portfolio</title>
	<meta
	name="description"
	content="Projects, experience, and education of Sean P. May (CS/Math, Northeastern University)."
	/>
	<link
	rel="icon"
	href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👽</text></svg>"
	/>
	</Head>

	<header className="sticky top-0 z-20 backdrop-blur border-b bg-white/70 dark:bg-slate-900/70 dark:border-slate-800">
	<div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
	<a href="#home" className="font-bold tracking-tight text-xl">Sean P. May</a>
	<nav className="hidden sm:flex items-center gap-2">
	{['about','projects','experience','education','skills'].map(id => (
	    <a
	    key={id}
	    href={`#${id}`}
	    className="px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 capitalize"
	    >
	    {id}
	    </a>
	))}
	<a
	href={links.resume}
	target="_blank"
	className="px-3 py-2 rounded-full border hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2"
	>
	<FileText className="w-4 h-4" /> Resume
	</a>
	<ThemeToggle />
	</nav>
	</div>
	</header>

	{/* HERO — concise, no overlap with About */}
	<section id="home" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-16">
	<div className="grid md:grid-cols-5 gap-8 items-center">
	<div className="md:col-span-3 space-y-5">
	<div className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full border bg-white dark:bg-slate-900">
	<MapPin className="w-4 h-4" />
	<span>Boston, MA</span>
	</div>
	<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
	CS/Math engineer building ML + systems projects
	</h1>
	<p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
	I design and ship clean, usable software — from low-level C to applied ML.
	</p>

	{/* Quick facts (kept short) */}
	<ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
	<li>🎓 Northeastern University — B.S. CS & Math (May 2027)</li>
	<li>🧪 Incoming: NExT Program SWE Co-op (Fall 2025)</li>
	<li>🔎 Open to Summer/Fall 2026 SWE/ML roles</li>
	</ul>

	<div className="flex flex-wrap gap-3 pt-2">
	<a href="#projects" className="px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
	See projects
	</a>
	<a href={links.github} target="_blank" className="px-4 py-2 rounded-full border">GitHub</a>
	<a href={links.linkedin} target="_blank" className="px-4 py-2 rounded-full border">LinkedIn</a>
	<a href={links.email} className="px-4 py-2 rounded-full">Contact</a>
	</div>
	</div>

	{/* Right column: compact summary card (no interests here) */}
	<div className="md:col-span-2">
	<Card>
	<CardHeader>
	<CardTitle className="flex items-center gap-2">
	<Brain className="w-5 h-5" /> Snapshot
	</CardTitle>
	</CardHeader>
	<CardContent className="space-y-2">
	<div className="flex flex-wrap gap-2">
	<Badge>ML</Badge>
	<Badge>Systems</Badge>
	<Badge>Full-stack</Badge>
	</div>
	<p className="text-sm text-slate-600 dark:text-slate-300">
	Focused on game theory, computer vision, and performance-minded code.
	</p>
	<a
	href={links.resume}
	target="_blank"
	className="inline-flex items-center gap-2 px-3 py-2 rounded-full border hover:bg-white dark:hover:bg-slate-800"
	>
	<FileText className="w-4 h-4" /> Resume
	</a>
	</CardContent>
	</Card>
	</div>
	</div>
	</section>

	{/* New, expanded About section */}
	<AboutMe />
	        {/* Projects */}
        <Section id="projects" title="Projects" icon={Trophy}>
        <div className="grid md:grid-cols-2 gap-6">
        {projects.map(p => <ProjectCard key={p.title} project={p} />)}
        </div>
        </Section>
	{/* Experience (render your entries via ExperienceItem) */}
        <Section id="experience" title="Experience" icon={Briefcase}>
        <div className="grid gap-6">
        {experience.map((job) => <ExperienceItem key={job.org} job={job} />)}
        </div>
        </Section>
	{/* Education */}
        <Section id="education" title="Education" icon={GraduationCap}>
        <div className="grid gap-6">
        {education.map(e => (
	    <Card key={e.school}>
	    <CardHeader>
	    <CardTitle>{e.school}</CardTitle>
	    <div className="text-sm opacity-70">{e.degree}</div>
	    </CardHeader>
	    <CardContent>
	    <ul className="list-disc pl-5 space-y-2">
	    {e.extras.map((x, i) => <li key={i}>{x}</li>)}
	    </ul>
	    </CardContent>
	    </Card>
	))}
	</div>
	</Section>

	{/* Skills (updated to resume) */}
        <Section id="skills" title="Skills" icon={Cpu}>
        <div>
        <SkillsGrid skills={skills} />
        </div>
        </Section>

	<footer className="border-t dark:border-slate-800 py-10 mt-10">
	<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
	<p className="text-sm opacity-70">
	© {new Date().getFullYear()} Sean P. May. All rights reserved.
	</p>
	<div className="flex gap-3">
	<a href={links.github} target="_blank" className="px-3 py-2 rounded-full border hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2">
	<Github className="w-4 h-4" /> GitHub
	</a>
	<a href={links.linkedin} target="_blank" className="px-3 py-2 rounded-full border hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2">
	<Linkedin className="w-4 h-4" /> LinkedIn
	</a>
	<a href={links.email} className="px-3 py-2 rounded-full border hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2">
	<Mail className="w-4 h-4" /> Email
	</a>
	<a href={links.resume} target="_blank" className="px-3 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center gap-2">
	<FileText className="w-4 h-4" /> Resume
	</a>
	</div>
	</div>
	</footer>
	</>
    );
}
