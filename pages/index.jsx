import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import rawExperience from '@/public/experience.json' assert { type: 'json' };
import rawOtherWork from '@/public/other-work.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import { validateExperience } from '@/lib/experience';
import { validateWork } from '@/lib/work';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import MapSection from '@/components/MapSection';
import ProjectsSection from '@/components/ProjectsSection';

const projects = validateProjects(rawProjects) ? rawProjects : [];
const experience = validateExperience(rawExperience) ? rawExperience : [];
const otherWork = validateWork(rawOtherWork) ? rawOtherWork : [];

function readJsonSafe(filename) {
  try {
    const filePath = path.join(process.cwd(), 'public', filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getStaticProps() {
  return {
    props: {
      statsData: readJsonSafe('stats.json'),
      spotifyData: readJsonSafe('spotify.json'),
      goodreadsData: readJsonSafe('goodreads.json'),
    },
  };
}

const FEATURED_SLUGS = ['life-dashboard', 'nlhe-alpha-beta', 'lecteuraide'];
const featuredProjects = FEATURED_SLUGS
  .map(slug => projects.find(p => p.slug === slug))
  .filter(Boolean);

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

const education = [
  {
    school: 'Northeastern University — Khoury College of Computer Sciences',
    degree: 'B.S. in Computer Science & Mathematics (Expected May 2027)',
    img: '/logos/normalized/nu-logo.png',
    oneLiner: 'BS CS+Math',
    extras: [
      'Sep 2022 – Present (Boston, MA)',
      'GPA 3.64/4.0; Dean’s Scholarship; Dean’s List (Fall 2024, Spring 2025)',
      'Activities: Bridge to Calculus Tutor, Calculus Field Day Volunteer, Math Club, Putnam Club, Running Club',
      'Relevant coursework: Artificial Intelligence, Matrix Methods for Machine Learning, Algorithms & Data Structures, Software Engineering, Computer Systems, Probability & Statistics, Quantitative Finance',
    ],
  },
  {
    school: 'Corvinus University of Budapest — Mathematical Heritage of Budapest',
    degree: 'Budapest, Hungary — Summer study abroad (Jun – Aug 2025)',
    img: '/logos/normalized/corvinus-logo.png',
    oneLiner: 'Math Dialogue',
    extras: ['GPA 4.0/4.0', 'Courses: Number Theory, Exploration of Modern Mathematics'],
  },
];

export default function Home({ statsData, spotifyData, goodreadsData }) {
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
        <Header links={links} />
        <main id="main-content" className="flex-1 space-y-12 pt-32 pb-24 sm:pt-28 md:pt-24 lg:min-w-0 lg:pt-16 xl:pt-20">
          <Hero links={links} featuredProjects={featuredProjects} />
          <AboutSection
            featuredActivities={otherWork}
            projectHighlights={[lifeDashboardProject, lecteurAideProject].filter(Boolean)}
            statsData={statsData}
            spotifyData={spotifyData}
            goodreadsData={goodreadsData}
          />

          <MapSection />

          <ProjectsSection />

          <ContactSection links={links} />
          <Footer links={links} />
        </main>
      </div>
    </>
  );
}
