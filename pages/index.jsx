import { useState, useMemo } from 'react';
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
import ProjectCard from '@/components/ProjectCard';
import ExperienceItem from '@/components/ExperienceItem';
import EducationItem from '@/components/EducationItem';
import SkillCategoryCard from '@/components/SkillCategoryCard';
import { Trophy, Briefcase, GraduationCap, Cpu, ClipboardList } from 'lucide-react';

const projects = validateProjects(rawProjects) ? rawProjects : [];
const experience = validateExperience(rawExperience) ? rawExperience : [];
const otherWork = validateWork(rawOtherWork) ? rawOtherWork : [];

const links = {
  github: 'https://github.com/seanpatrickmay',
  linkedin: 'https://linkedin.com/in/seanpatrickmay',
  email: 'mailto:may.se@northeastern.edu',
  resume: '/resume.pdf',
};

const skillCategories = [
  {
    title: 'Core Languages & Frameworks',
    emoji: '💻',
    oneLiner: 'Core Languages',
    summary: 'Daily languages and front-end frameworks across co-ops, teaching, and research builds.',
    items: ['Python', 'TypeScript', 'JavaScript', 'C', 'Next.js & React', 'HTML & CSS', 'Shell Scripting'],
  },
  {
    title: 'AI & Decision Science',
    emoji: '🧠',
    oneLiner: 'AI & Decision Science',
    summary: 'Research tooling for digit classifiers, CFR-Min exploration, and poker AI experiments.',
    items: ['PyTorch', 'Computer Vision', 'Reinforcement Learning', 'Monte Carlo Simulation', 'Game Theory', 'Alpha-Beta Search'],
  },
  {
    title: 'Systems & Automation',
    emoji: '🛠️',
    oneLiner: 'Systems & Automation',
    summary: 'Infrastructure work from Navy shipyard tools to internal libraries that keep data flowing.',
    items: ['Linux', 'Git', 'JupyterLab', 'ServiceNow REST API', 'Test Automation', 'CSV/JSON Pipelines'],
  },
  {
    title: 'Software Engineering Practices',
    emoji: '🚀',
    oneLiner: 'Engineering Practices',
    summary: 'Habits proven through co-ops, tutoring, and client demos.',
    items: [
      'Concurrency & Synchronization',
      'Data Structures & Algorithms',
      'Agile Delivery',
      'Mentoring & Technical Communication',
      'Client-Facing Demos',
      'Risk & Probabilistic Analysis',
    ],
  },
];

const education = [
  {
    school: 'Northeastern University — Khoury College of Computer Sciences',
    degree: 'B.S. in Computer Science & Mathematics (Expected May 2027)',
    img: '/images/northeastern.svg',
    oneLiner: 'BS CS+Math',
    extras: [
      'GPA 3.64/4.0; Dean’s Scholarship; Dean’s List (Fall 2024, Spring 2025)',
      'Activities: Bridge to Calculus Tutor, Calculus Field Day Volunteer, Math Club, Putnam Club, Running Club',
      'Relevant coursework: AI, Matrix Methods in ML, Algorithms & Data Structures, OOP, Systems, Prob & Stat',
    ],
  },
  {
    school: 'Corvinus University of Budapest - Mathematical Heritage of Budapest Summer Dialogue',
    degree: 'Budapest, Hungary (Jun – Aug 2025)',
    img: '/images/corvinus.svg',
    oneLiner: 'Math Dialogue',
    extras: ['Courses: Number Theory, Exploration of Modern Mathematics'],
  },
];

const interests = [
  'Brain Teasers', 'Game Theory', 'Poker', 'Chess', 'Français', 'Track & Field', 'Triathlon', 'Skiing', 'Sports Science'
];

export default function Home() {
  const [activeSectionId, setActiveSectionId] = useState(null);

  const showcaseSections = useMemo(() => [
    {
      id: 'experience',
      title: 'Experience',
      icon: Briefcase,
      items: experience,
      keyExtractor: job => job.org,
      renderItem: (job, _index, state) => <ExperienceItem job={job} mode={state.mode} />,
    },
    {
      id: 'education',
      title: 'Education',
      icon: GraduationCap,
      items: education,
      keyExtractor: item => item.school,
      renderItem: (item, _index, state) => <EducationItem item={item} mode={state.mode} />,
    },
    {
      id: 'other-work',
      title: 'Other Work',
      icon: ClipboardList,
      items: otherWork,
      keyExtractor: job => job.org,
      renderItem: (job, _index, state) => <ExperienceItem job={job} mode={state.mode} />,
    },
  ], [experience, education, otherWork]);


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
          <Hero links={links} />
          <AboutSection interests={interests} />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {showcaseSections.map(section => (
            <StackedCardSection
              key={section.id}
              {...section}
              className="!py-6 !px-0"
              activeSectionId={activeSectionId}
              onActiveSectionChange={setActiveSectionId}
            />
          ))}

          <StackedCardSection
            id="skills"
            title="Skills"
            icon={Cpu}
            items={skillCategories}
            keyExtractor={category => category.title}
            className="!py-8 !px-0"
            renderItem={(category, _index, state) => (
              <SkillCategoryCard category={category} mode={state.mode} />
            )}
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
