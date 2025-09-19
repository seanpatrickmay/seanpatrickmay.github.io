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
import StackedCardPreview from '@/components/StackedCardPreview';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
    oneLiner: 'Core languages · Python-first shipping',
    summary: 'Daily languages and front-end frameworks across co-ops, teaching, and research builds.',
    items: ['Python', 'TypeScript', 'JavaScript', 'C', 'Next.js & React', 'HTML & CSS', 'Shell Scripting'],
  },
  {
    title: 'AI & Decision Science',
    emoji: '🧠',
    oneLiner: 'Decision science · CFR, CV, poker',
    summary: 'Research tooling for digit classifiers, CFR-Min exploration, and poker AI experiments.',
    items: ['PyTorch', 'Computer Vision', 'Reinforcement Learning', 'Monte Carlo Simulation', 'Game Theory', 'Alpha-Beta Search'],
  },
  {
    title: 'Systems & Automation',
    emoji: '🛠️',
    oneLiner: 'Automation · shipyard & internal tooling',
    summary: 'Infrastructure work from Navy shipyard tools to internal libraries that keep data flowing.',
    items: ['Linux', 'Git', 'JupyterLab', 'ServiceNow REST API', 'Test Automation', 'CSV/JSON Pipelines'],
  },
  {
    title: 'Software Engineering Practices',
    emoji: '🚀',
    oneLiner: 'Engineering habits · delivering with teams',
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
    oneLiner: 'BS CS+Math — Northeastern',
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
    oneLiner: 'Math Dialogue — Corvinus',
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
      id: 'projects',
      title: 'Projects',
      icon: Trophy,
      items: projects,
      keyExtractor: project => project.title,
      renderItem: (project, _index, state) => <ProjectCard project={project} mode={state.mode} />,
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
  ], [experience, projects, education, otherWork]);

  const showcaseRows = useMemo(() => {
    const rows = [];
    for (let index = 0; index < showcaseSections.length; index += 2) {
      rows.push(showcaseSections.slice(index, index + 2));
    }
    return rows;
  }, [showcaseSections]);

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

      <Header links={links} />
      <Hero links={links} />
      <AboutSection interests={interests} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {showcaseRows.map((row, rowIndex) => {
          const rowActiveId = row.some(section => section.id === activeSectionId)
            ? activeSectionId
            : undefined;

          return (
            <div
              key={row.map(section => section.id).join('-')}
              className="space-y-8 md:flex md:flex-wrap md:items-start md:gap-6 md:space-y-0"
            >
              {row.map((section, columnIndex) => (
                <StackedCardSection
                  key={section.id}
                  {...section}
                  columnsInRow={row.length}
                  columnIndex={columnIndex}
                  rowActiveId={rowActiveId}
                  className="!py-6 !px-0"
                  activeSectionId={activeSectionId}
                  onActiveSectionChange={setActiveSectionId}
                />
              ))}
            </div>
          );
        })}

        <StackedCardSection
          id="skills"
          title="Skills"
          icon={Cpu}
          items={skillCategories}
          keyExtractor={category => category.title}
          columnsInRow={1}
          columnIndex={0}
          rowActiveId={activeSectionId === 'skills' ? 'skills' : undefined}
          className="!py-8 !px-0"
          renderItem={(category, _index, state) => (
            <Card className="h-full">
              {state.mode === 'preview' ? (
                <StackedCardPreview emoji={category.emoji} label={category.oneLiner} />
              ) : (
                <>
                  <CardHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" aria-hidden="true">
                        {category.emoji}
                      </span>
                      <CardTitle className="text-xl sm:text-2xl">{category.title}</CardTitle>
                    </div>
                    {category.summary && (
                      <p className="text-sm text-slate-600 dark:text-white/70">{category.summary}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {category.items.map(item => (
                        <li
                          key={item}
                          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-white"
                        >
                          <span className="text-xs font-semibold text-slate-500 dark:text-white/60">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </>
              )}
            </Card>
          )}
          activeSectionId={activeSectionId}
          onActiveSectionChange={setActiveSectionId}
        />
      </div>

      <Footer links={links} />
    </>
  );
}
