import Head from 'next/head';
import ThemeToggle from '@/components/ThemeToggle';
import Section from '@/components/ui/Section';
import ProjectCard from '@/components/ProjectCard';
import ExperienceItem from '@/components/ExperienceItem';
import SkillsGrid from '@/components/SkillsGrid';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MapPin, Trophy, Briefcase, GraduationCap, Cpu, Brain, FileText, Github, Linkedin, Mail, Sparkles, BarChart, Target } from 'lucide-react';
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

        {/* Part-Time Work + Stats */}
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

          {/* Stats placeholders for future numbers */}
          <div className="space-y-6">
            <AboutStat
              icon={BarChart}
              label="Projects shipped"
              value="—"
              hint="Connect to /public/stats.json later"
            />
            <AboutStat
              icon={Sparkles}
              label="Open-source PRs"
              value="—"
              hint="Populate from GitHub API at build time"
            />
          </div>
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
