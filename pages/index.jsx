import { useState } from 'react';
import Head from 'next/head';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import rawExperience from '@/public/experience.json' assert { type: 'json' };
import rawOtherWork from '@/public/other-work.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import { validateExperience } from '@/lib/experience';
import { validateWork } from '@/lib/work';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import StackedCardSection from '@/components/StackedCardSection';
import ExperienceItem from '@/components/ExperienceItem';
import EducationItem from '@/components/EducationItem';
import { Briefcase, GraduationCap, ClipboardList } from 'lucide-react';

const projects = validateProjects(rawProjects) ? rawProjects : [];
const experience = validateExperience(rawExperience) ? rawExperience : [];
const otherWork = validateWork(rawOtherWork) ? rawOtherWork : [];

const featuredProjects = [...projects]
  .filter(project => typeof project.coolness === 'number')
  .sort((a, b) => (b.coolness ?? -Infinity) - (a.coolness ?? -Infinity))
  .slice(0, 3);

const links = {
  github: 'https://github.com/seanpatrickmay',
  linkedin: 'https://linkedin.com/in/seanpatrickmay',
  email: 'mailto:maypatricksean@gmail.com',
  emailDisplay: 'maypatricksean@gmail.com',
  phone: 'tel:+14438982870',
  phoneDisplay: '(443) 898-2870',
  website: 'https://seanpatrickmay.github.io',
};

const education = [
  {
    school: 'Northeastern University — Khoury College of Computer Sciences',
    degree: 'B.S. in Computer Science & Mathematics (Expected May 2027)',
    img: '/logos/normalized/nu-logo.png',
    oneLiner: 'BS CS+Math',
    extras: [
      'Sep 2022 - Present (Boston, MA)',
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

const interests = [
  'Français',
  'Triathlon',
  'Escape Rooms',
];

export default function Home() {
  const [activeSectionId, setActiveSectionId] = useState(null);


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

      <div className="lg:mx-auto lg:flex lg:max-w-screen-2xl lg:items-start lg:justify-center lg:gap-10 lg:px-12 xl:px-16">
        <Header links={links} />
        <main className="flex-1 space-y-12 pt-32 pb-24 sm:pt-28 md:pt-24 lg:min-w-0 lg:pt-16 xl:pt-20">
          <Hero links={links} featuredProjects={featuredProjects} />
          <AboutSection interests={interests} featuredActivities={otherWork} />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <StackedCardSection
              id="experience"
              title="Work Experience"
              icon={Briefcase}
              items={experience}
              keyExtractor={job => job.org}
              className="!py-6 !px-0"
              renderItem={(job, _index, state) => <ExperienceItem job={job} mode={state.mode} />}
              activeSectionId={activeSectionId}
              onActiveSectionChange={setActiveSectionId}
            />

            <StackedCardSection
              id="education"
              title="Education"
              icon={GraduationCap}
              items={education}
              keyExtractor={item => item.school}
              className="!py-6 !px-0"
              renderItem={(item, _index, state) => <EducationItem item={item} mode={state.mode} />}
              activeSectionId={activeSectionId}
              onActiveSectionChange={setActiveSectionId}
            />

            <StackedCardSection
              id="other-work"
              title="Leadership & Activities"
              icon={ClipboardList}
              items={otherWork}
              keyExtractor={job => job.org}
              className="!py-6 !px-0"
              renderItem={(job, _index, state) => <ExperienceItem job={job} mode={state.mode} />}
              activeSectionId={activeSectionId}
              onActiveSectionChange={setActiveSectionId}
            />
          </div>

          <Footer links={links} />
        </main>
      </div>
    </>
  );
}
