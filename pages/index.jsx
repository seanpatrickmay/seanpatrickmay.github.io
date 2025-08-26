import Head from 'next/head'
import { useEffect } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import { Github, Linkedin, Mail, MapPin, FileText, Trophy, Briefcase, GraduationCap, Cpu, Brain } from 'lucide-react'
import projects from '../public/projects.json' assert { type: 'json' }

const links = {
  github: 'https://github.com/seanpatrickmay',
  linkedin: 'https://linkedin.com/in/seanpatrickmay',
  email: 'mailto:may.se@northeastern.edu',
  resume: '/resume.pdf',
}

const skills = {
  languages: ['Python','Java','C','LaTeX','Bash','React','Racket','C++','JavaScript','Assembly'],
  tools: ['PyTorch','Pandas','NumPy','Matplotlib','Git','Neovim','Codespaces','Jupyter'],
  platforms: ['Windows','macOS','Ubuntu Linux'],
}

const experience = [
  {
    org: 'General Dynamics Electric Boat',
    role: 'Software Development Co-op',
    location: 'Groton, CT',
    period: 'Jan – Jul 2024',
    bullets: [
      'Automated database accuracy via ServiceNow REST API; improved tracking of ~1000 assets.',
      'Automated XML transformation testing with Python/Batch; delivered digestible review outputs.',
      'Wrote a Python library for transforming/reading/writing CSV & JSON.',
    ],
  },
  {
    org: 'Defense Information Systems Agency (DISA)',
    role: 'Administrative Assistant',
    location: 'Fort Meade, MD',
    period: 'Jun – Sep 2023',
    bullets: [
      'Maintained records/databases to support mission accessibility.',
      'Obtained Secret security clearance after full background investigation.',
      'Supported transition of thousands of employees to a cloud suite and facilitated org comms.',
    ],
  },
]

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
]

const interests = [
  'Brain Teasers','Game Theory','Poker','Chess','Français','Track & Field','Triathlon','Skiing','Sports Science'
]

function Badge({ children }) { return <span className="badge">{children}</span> }
function Card({ children }) { return <div className="card rounded-2xl border bg-white dark:bg-slate-900">{children}</div> }
function CardHeader({ children }) { return <div className="px-6 pt-6">{children}</div> }
function CardTitle({ children }) { return <h3 className="text-lg font-semibold">{children}</h3> }
function CardContent({ children }) { return <div className="px-6 pb-6 pt-2 space-y-3">{children}</div> }

export default function Home() {
  useEffect(() => { /* no-op */ }, [])

  return (
    <>
      <Head>
        <title>Sean P. May — Portfolio</title>
        <meta name="description" content="Projects, experience, and education of Sean P. May (CS/Math, Northeastern University)." />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><text y='14' font-size='14'>🧠</text></svg>"
        />
      </Head>

      <header className="sticky top-0 z-20 backdrop-blur border-b bg-white/70 dark:bg-slate-900/70 dark:border-slate-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <a href="#home" className="font-bold tracking-tight text-xl">Sean P. May</a>
          <nav className="hidden sm:flex items-center gap-2">
            <a href="#projects" className="px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">Projects</a>
            <a href="#experience" className="px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">Experience</a>
            <a href="#education" className="px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">Education</a>
            <a href="#skills" className="px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">Skills</a>
            <a href="#interests" className="px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">Interests</a>
            <a href={links.resume} target="_blank" className="px-3 py-2 rounded-full border hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Resume
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="home" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-3 space-y-5">
              <div className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full border bg-white dark:bg-slate-900 card">
                <MapPin className="w-4 h-4" />
                <span>Boston, MA</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Building ML + systems projects with curiosity & rigor</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                CS/Math student at Northeastern (’26). I like tackling game-theoretic problems, computer vision, and
                systems-level C programming—then turning ideas into clean, usable software.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a href="#projects" className="px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">See projects</a>
                <a href={links.github} target="_blank" className="px-4 py-2 rounded-full border">GitHub</a>
                <a href={links.linkedin} target="_blank" className="px-4 py-2 rounded-full border">LinkedIn</a>
                <a href={links.email} className="px-4 py-2 rounded-full">Contact</a>
              </div>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" /> What I’m into</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {interests.map(i => <Badge key={i}>{i}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Projects (from JSON) */}
        <section id="projects" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl border bg-white dark:bg-slate-900 card"><Trophy className="w-5 h-5" /></div>
            <h2 className="text-2xl font-semibold">Projects</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map(p => (
              <Card key={p.title}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <CardTitle>{p.title}</CardTitle>
                    <span className="text-sm opacity-70">{p.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {p.stack.map(s => <Badge key={s}>{s}</Badge>)}
                  </div>
                  <ul className="list-disc pl-5 space-y-2">
                    {p.bullets.map((b,i) => <li key={i}>{b}</li>)}
                  </ul>
                  {p.links && p.links.length ? (
                    <div className="flex flex-wrap gap-3 pt-1">
                      {p.links.map((l,i) => (
                        <a key={i} href={l.href} target="_blank"
                           className="px-3 py-2 rounded-full border hover:bg-white dark:hover:bg-slate-800">
                          {l.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl border bg-white dark:bg-slate-900 card"><Briefcase className="w-5 h-5" /></div>
            <h2 className="text-2xl font-semibold">Experience</h2>
          </div>
          <div className="grid gap-6">
            {experience.map(job => (
              <Card key={job.org}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <CardTitle>{job.role} — {job.org}</CardTitle>
                    <div className="text-sm opacity-70 flex items-center gap-3">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.period}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    {job.bullets.map((b,i) => <li key={i}>{b}</li>)}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Education */}
        <section id="education" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl border bg-white dark:bg-slate-900 card"><GraduationCap className="w-5 h-5" /></div>
            <h2 className="text-2xl font-semibold">Education</h2>
          </div>
          <div className="grid gap-6">
            {education.map(e => (
              <Card key={e.school}>
                <CardHeader>
                  <CardTitle>{e.school}</CardTitle>
                  <div className="text-sm opacity-70">{e.degree}</div>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    {e.extras.map((x,i) => <li key={i}>{x}</li>)}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl border bg-white dark:bg-slate-900 card"><Cpu className="w-5 h-5" /></div>
            <h2 className="text-2xl font-semibold">Skills</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Languages</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">{skills.languages.map(s => <Badge key={s}>{s}</Badge>)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Tools & Libraries</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">{skills.tools.map(s => <Badge key={s}>{s}</Badge>)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Platforms</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">{skills.platforms.map(s => <Badge key={s}>{s}</Badge>)}</div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t dark:border-slate-800 py-10 mt-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-sm opacity-70">© {new Date().getFullYear()} Sean P. May. All rights reserved.</p>
          <div className="flex gap-3">
            <a href={links.github} target="_blank" className="px-3 py-2 rounded-full border hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2"><Github className="w-4 h-4"/> GitHub</a>
            <a href={links.linkedin} target="_blank" className="px-3 py-2 rounded-full border hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2"><Linkedin className="w-4 h-4"/> LinkedIn</a>
            <a href={links.email} className="px-3 py-2 rounded-full border hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2"><Mail className="w-4 h-4"/> Email</a>
            <a href={links.resume} target="_blank" className="px-3 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center gap-2"><FileText className="w-4 h-4"/> Resume</a>
          </div>
        </div>
      </footer>
    </>
  )
}

