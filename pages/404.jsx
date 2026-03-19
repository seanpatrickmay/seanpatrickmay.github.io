import Head from 'next/head';
import PillLink from '@/components/ui/PillLink';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 — Sean P. May</title>
      </Head>
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            404
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-slate-900 dark:text-slate-50">
            Page not found
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            This page doesn&apos;t exist, but plenty of others do.
          </p>
          <div className="mt-6">
            <PillLink href="/" variant="solid" icon={Home} className="px-5">
              Back home
            </PillLink>
          </div>
        </div>
      </main>
    </>
  );
}
