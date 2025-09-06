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
import ListSection from '@/components/ListSection';
import Section from '@/components/ui/Section';
import ProjectCard from '@/components/ProjectCard';
import ExperienceItem from '@/components/ExperienceItem';
import EducationItem from '@/components/EducationItem';
import SkillsGrid from '@/components/SkillsGrid';
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

      <ListSection
        id="experience"
        title="Experience"
        icon={Briefcase}
        items={experience}
        renderItem={job => <ExperienceItem key={job.org} job={job} />}
      />

      <ListSection
        id="other-work"
        title="Other Work"
        icon={ClipboardList}
        items={otherWork}
        renderItem={job => <ExperienceItem key={job.org} job={job} />}
      />

      <ListSection
        id="projects"
        title="Projects"
        icon={Trophy}
        items={projects}
        columns={2}
        renderItem={p => <ProjectCard key={p.title} project={p} />}
      />

      <ListSection
        id="education"
        title="Education"
        icon={GraduationCap}
        items={education}
        renderItem={e => <EducationItem key={e.school} item={e} />}
      />

      <Section id="skills" title="Skills" icon={Cpu}>
        <SkillsGrid skills={skills} />
      </Section>

      <Footer links={links} />
    </>
  );
}

