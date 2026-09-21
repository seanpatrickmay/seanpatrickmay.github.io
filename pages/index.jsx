import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import { getStaleness } from '@/lib/freshness';
import { splitTimeline } from '@/lib/timeline';
import { validateProjects } from '@/lib/projects';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import MapSection from '@/components/MapSection';
import ProjectsSection from '@/components/ProjectsSection';

const projects = validateProjects(rawProjects) ? rawProjects : [];

function readJsonSafe(filename) {
  try {
    const filePath = path.join(process.cwd(), 'public', filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Staleness is resolved at build time, not render time: the site is a static
// export, so this keeps the badge crawler-visible and free of hydration
// mismatches. The daily deploy cron re-evaluates it.
function readFeed(filename) {
  const data = readJsonSafe(filename);
  if (!data) return null;
  return { ...data, _staleness: getStaleness(data.generated_at) };
}

// stats.json is ~39KB and was shipping whole in __NEXT_DATA__ for a card that
// renders four aggregates. Only the weekly series is read, plus a calorie
// fallback that needs two fields off each recent activity.
function trimStats(data) {
  if (!data?.stats) return data;

  const weeklyOnly = section =>
    section?.weekly ? { weekly: { series: section.weekly.series ?? [] } } : undefined;

  return {
    generated_at: data.generated_at,
    _staleness: data._staleness,
    stats: {
      combined: {
        ...weeklyOnly(data.stats.combined),
        recent: {
          // Used only when the weekly series carries no calories.
          last60: (data.stats.combined?.recent?.last60 ?? []).map(a => ({
            start: a.start,
            calories_kcal: a.calories_kcal,
          })),
        },
      },
      running: weeklyOnly(data.stats.running),
      biking: weeklyOnly(data.stats.biking),
    },
  };
}

// The home card shows 12 recent books; readHistory exists for /reading, which
// reads goodreads.json itself.
function trimGoodreads(data) {
  if (!data) return data;
  const { readHistory, ...rest } = data;
  return rest;
}

export async function getStaticProps() {
  return {
    props: {
      statsData: trimStats(readFeed('stats.json')),
      spotifyData: readFeed('spotify.json'),
      goodreadsData: trimGoodreads(readFeed('goodreads.json')),
      duolingoData: readFeed('duolingo.json'),
      timeline: splitTimeline(Date.now()),
      // Resolved at build time like the rest: `new Date()` at render time
      // disagrees between the prerendered HTML and the client on Jan 1.
      buildYear: new Date().getFullYear(),
    },
  };
}

// The hero fan is the top of the same ranking ProjectsSection uses, rather
// than a second hand-kept list. The old hardcoded trio had drifted to ranks
// 1, 5, 2 — so re-ranking a project in projects.json silently disagreed with
// what the hero showed.
const featuredProjects = projects
  .filter(project => Number.isFinite(project.caseStudyRank))
  .sort((a, b) => a.caseStudyRank - b.caseStudyRank)
  .slice(0, 3);

const lifeDashboardProject =
  projects.find(project => project.slug === 'life-dashboard') ?? null;
const lecteurAideProject =
  projects.find(project => project.slug === 'lecteuraide') ?? null;

const links = {
  github: 'https://github.com/seanpatrickmay',
  linkedin: 'https://linkedin.com/in/seanpatrickmay',
  email: 'mailto:maypatricksean@gmail.com',
  emailDisplay: 'maypatricksean@gmail.com',
  phone: 'tel:+14438982870',
  phoneDisplay: '(443) 898-2870',
  website: 'https://seanpatrickmay.me',
};


export default function Home({ statsData, spotifyData, goodreadsData, duolingoData, timeline, buildYear }) {
  return (
    <>
      <Head>
        <title>Sean P. May — Portfolio</title>
        <meta
          name="description"
          content="Sean May — SWE and mathematician at Northeastern University. Projects in AI, quant research, computer vision, and full-stack development."
        />
      </Head>

      <div className="lg:mx-auto lg:flex lg:max-w-screen-2xl lg:items-start lg:justify-center lg:gap-10 lg:px-12 xl:px-16">
        <Header links={links} timeline={timeline} />
        <main id="main-content" className="flex-1 space-y-12 pt-32 pb-24 sm:pt-28 md:pt-24 lg:min-w-0 lg:pt-16 xl:pt-20">
          <Hero links={links} featuredProjects={featuredProjects} timeline={timeline} />
          <AboutSection
            projectHighlights={[lifeDashboardProject, lecteurAideProject].filter(Boolean)}
            statsData={statsData}
            spotifyData={spotifyData}
            goodreadsData={goodreadsData}
            duolingoData={duolingoData}
          />

          <MapSection />

          <ProjectsSection />

          <ContactSection links={links} />
          <Footer links={links} year={buildYear} />
        </main>
      </div>
    </>
  );
}
