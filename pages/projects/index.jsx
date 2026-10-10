import Head from 'next/head';
import { ArrowLeft } from 'lucide-react';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import ProjectPageHeader from '@/components/ProjectPageHeader';
import Pinboard from '@/components/Pinboard';
import Board from '@/components/projects/Board';

const projects = validateProjects(rawProjects) ? rawProjects : [];

/**
 * The same board as the home page, on its own URL.
 *
 * This used to be a client-side redirect to /#projects: a blank page until
 * JavaScript ran, nothing for a crawler, and the deep dives' "← all projects"
 * link went through it.
 */
export default function ProjectsPage() {
  return (
    <>
      <Head>
        <title>Projects — Sean P. May</title>
        <meta
          name="description"
          content="Projects by Sean May: systems that run in production and models that think, from a quant data pipeline to a Catan engine in Rust."
        />
      </Head>
      <ProjectPageHeader />

      <main id="main-content" className="section-container pb-16 pt-24">
        <div className="mb-6">
          <a
            href="/"
            className="font-hand text-lg text-stone-500 underline-offset-4 transition-colors hover:text-teal-700 hover:underline dark:text-stone-400 dark:hover:text-teal-400"
          >
            <ArrowLeft className="mr-1 inline h-4 w-4 align-[-2px]" aria-hidden="true" />
            home
          </a>
        </div>
        <div className="mb-5">
          <div className="stamp">
            <h1 className="font-display text-3xl tracking-tight">projects</h1>
          </div>
        </div>
        <Pinboard>
          <Board projects={projects} headingLevel={2} />
        </Pinboard>
      </main>
    </>
  );
}
