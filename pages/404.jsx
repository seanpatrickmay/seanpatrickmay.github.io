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
          <div className="relative mx-auto mb-6 w-fit">
            <span className="text-8xl font-extrabold tracking-tighter text-slate-200 dark:text-slate-800 select-none" aria-hidden="true">
              404
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center text-5xl motion-reduce:!rotate-0"
              style={{ transform: 'rotate(-6deg)' }}
              aria-hidden="true"
            >
              🫠
            </span>
          </div>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 dark:text-slate-50">
            page not found
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            this page doesn't exist, but there's plenty more to look at
          </p>
          <div className="mt-6">
            <PillLink href="/" variant="solid" icon={Home} className="px-5">
              back home
            </PillLink>
          </div>
        </div>
      </main>
    </>
  );
}
