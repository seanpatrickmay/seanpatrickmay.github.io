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
import ProjectCard from '@/components/ProjectCard';
import ExperienceItem from '@/components/ExperienceItem';
import EducationItem from '@/components/EducationItem';
import Badge from '@/components/ui/Badge';
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

const skills = {
  languages: ['Python', 'Java', 'C', 'JavaScript', 'HTML', 'CSS'],
  tools: ['Git', 'PyTorch', 'NumPy', 'Neovim', 'Matplotlib', 'Jupyter', 'React'],
  platforms: ['Windows', 'macOS', 'Ubuntu Linux'],
};

const skillCategories = [
  { title: 'Languages', items: skills.languages },
  { title: 'Tools & Libraries', items: skills.tools },
  { title: 'Platforms', items: skills.platforms },
];

const education = [
  {
    school: 'Northeastern University — Khoury College of Computer Sciences',
    degree: 'B.S. in Computer Science & Mathematics (Expected May 2027)',
    img: '/images/northeastern.svg',
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
    extras: ['Courses: Number Theory, Exploration of Modern Mathematics'],
  },
];

const interests = [
  'Brain Teasers', 'Game Theory', 'Poker', 'Chess', 'Français', 'Track & Field', 'Triathlon', 'Skiing', 'Sports Science'
];

export default function Home() {
  const [activeStackSection, setActiveStackSection] = useState(null);

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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="relative">
          {activeStackSection && (
            <div className="pointer-events-none absolute -inset-4 rounded-[32px] bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 z-10" />
          )}
          <div className={`space-y-8 relative ${activeStackSection ? 'z-20' : ''}`}>
            <div className="grid gap-8 md:grid-cols-2">
              <StackedCardSection
                id="experience"
                title="Experience"
                icon={Briefcase}
                items={experience}
                keyExtractor={job => job.org}
                renderItem={(job, _, context) => (
                  <ExperienceItem job={job} compact={context?.mode === 'preview'} />
                )}
                className="px-0 md:mx-0 py-6 md:py-8"
                stackOffset={168}
                expandOnHover
                activeSectionId={activeStackSection}
                setActiveSectionId={setActiveStackSection}
              />
              <StackedCardSection
                id="projects"
                title="Projects"
                icon={Trophy}
                items={projects}
                keyExtractor={project => project.title}
                renderItem={(project, _, context) => (
                  <ProjectCard project={project} compact={context?.mode === 'preview'} />
                )}
                className="px-0 md:mx-0 py-6 md:py-8"
                stackOffset={168}
                expandOnHover
                activeSectionId={activeStackSection}
                setActiveSectionId={setActiveStackSection}
              />
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <StackedCardSection
                id="education"
                title="Education"
                icon={GraduationCap}
                items={education}
                keyExtractor={item => item.school}
                renderItem={(item, _, context) => (
                  <EducationItem item={item} compact={context?.mode === 'preview'} />
                )}
                className="px-0 md:mx-0 py-6 md:py-8"
                stackOffset={168}
                expandOnHover
                activeSectionId={activeStackSection}
                setActiveSectionId={setActiveStackSection}
              />
              <StackedCardSection
                id="other-work"
                title="Other Work"
                icon={ClipboardList}
                items={otherWork}
                keyExtractor={job => job.org}
                renderItem={(job, _, context) => (
                  <ExperienceItem job={job} compact={context?.mode === 'preview'} />
                )}
                className="px-0 md:mx-0 py-6 md:py-8"
                stackOffset={168}
                expandOnHover
                activeSectionId={activeStackSection}
                setActiveSectionId={setActiveStackSection}
              />
            </div>
          </div>
        </div>
      </div>

      <StackedCardSection
        id="skills"
        title="Skills"
        icon={Cpu}
        items={skillCategories}
        keyExtractor={category => category.title}
        renderItem={(category, _, context) => {
          const isPreview = context?.mode === 'preview';
          const items = isPreview ? category.items.slice(0, 6) : category.items;

          return (
            <Card className={isPreview ? 'shadow-sm' : ''}>
              <CardHeader className={isPreview ? 'pb-3' : ''}>
                <CardTitle className={isPreview ? 'text-base font-semibold' : ''}>{category.title}</CardTitle>
              </CardHeader>
              <CardContent className={isPreview ? 'px-6 pb-4 pt-0' : ''}>
                <div className="flex flex-wrap gap-2">
                  {items.map(item => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                  {isPreview && category.items.length > items.length && (
                    <Badge key="more">+{category.items.length - items.length}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        }}
      />

      <Footer links={links} />
    </>
  );
}

