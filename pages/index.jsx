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
        <div className="grid gap-8 md:grid-cols-2">
          <StackedCardSection
            id="experience"
            title="Experience"
            icon={Briefcase}
            items={experience}
            keyExtractor={job => job.org}
            renderItem={(job, _index, state) => <ExperienceItem job={job} mode={state.mode} />}
            className="px-0 md:mx-0"
          />
          <StackedCardSection
            id="projects"
            title="Projects"
            icon={Trophy}
            items={projects}
            keyExtractor={project => project.title}
            renderItem={(project, _index, state) => <ProjectCard project={project} mode={state.mode} />}
            className="px-0 md:mx-0"
          />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <StackedCardSection
            id="education"
            title="Education"
            icon={GraduationCap}
            items={education}
            keyExtractor={item => item.school}
            renderItem={(item, _index, state) => <EducationItem item={item} mode={state.mode} />}
            className="px-0 md:mx-0"
          />
          <StackedCardSection
            id="other-work"
            title="Other Work"
            icon={ClipboardList}
            items={otherWork}
            keyExtractor={job => job.org}
            renderItem={(job, _index, state) => <ExperienceItem job={job} mode={state.mode} />}
            className="px-0 md:mx-0"
          />
        </div>
      </div>

      <StackedCardSection
        id="skills"
        title="Skills"
        icon={Cpu}
        items={skillCategories}
        keyExtractor={category => category.title}
        renderItem={(category, _index, state) => (
          <Card className="h-full" data-mode={state.mode}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
            </CardHeader>
            {state.mode !== 'preview' && (
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {category.items.map(item => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      />

      <Footer links={links} />
    </>
  );
}

