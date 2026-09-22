import Head from 'next/head';
import PillLink from '@/components/ui/PillLink';
import { Home } from 'lucide-react';
import PinCard from '@/components/PinCard';

/**
 * 404, as a postcard that came back.
 *
 * It borrows the contact section's card stock and stamp on purpose: the one
 * other place on this site that looks like post is the place you write to
 * him, so a returned card reads as part of the same world rather than a
 * generic error screen. The "RETURN TO SENDER" mark is the joke and the
 * message at once — no page at this address.
 */

/** Cancelled postage, struck through because the card never arrived. */
function CancelledStamp() {
  return (
    <div
      aria-hidden="true"
      className="postage absolute right-6 top-6 hidden h-[4.5rem] w-[3.5rem] rotate-6 bg-stone-500/80 sm:block dark:bg-stone-400/70"
    >
      <div className="absolute inset-[5px] flex flex-col items-center justify-center border border-white/50 text-white">
        <span className="font-display text-xl leading-none">404</span>
        <span className="mt-1 text-[7px] uppercase tracking-[0.18em]">no such</span>
      </div>
    </div>
  );
}

/** The mark a sorting office leaves when it gives up on an address. */
function ReturnMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 74"
      // Struck over the address side, not the middle: a sorting office marks
      // the address it could not deliver to, and centring it buried the
      // handwritten message underneath.
      className="pointer-events-none absolute left-1/2 top-1/2 w-[78%] max-w-sm -translate-x-1/2 -translate-y-1/2 -rotate-[9deg] text-red-700/45 md:left-[73%] md:w-[44%] dark:text-red-400/40"
    >
      <rect
        x="3"
        y="3"
        width="214"
        height="68"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <text
        x="110"
        y="32"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontSize: 21, fontWeight: 700, letterSpacing: 2.5 }}
      >
        RETURN TO
      </text>
      <text
        x="110"
        y="58"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontSize: 21, fontWeight: 700, letterSpacing: 2.5 }}
      >
        SENDER
      </text>
    </svg>
  );
}

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 — Sean P. May</title>
        <meta name="description" content="That page does not exist — head back to seanpatrickmay.me." />
      </Head>
      <main id="main-content" className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <PinCard rotation={-1.4} pinColor="red" fastener="tape">
            <div className="postcard relative overflow-hidden rounded-[10px]">
              <div className="grid md:grid-cols-[1.05fr_1fr]">
                {/* Message side */}
                <div className="px-7 py-9 sm:px-9 md:border-r md:border-dashed md:border-stone-400/50 dark:md:border-stone-500/40">
                  <h1 className="font-display text-3xl tracking-tight text-stone-900 dark:text-stone-50">
                    page not found
                  </h1>
                  <p className="font-hand mt-3 text-xl leading-snug text-stone-700 dark:text-stone-200">
                    nothing lives at this address. it may have moved, or it may
                    never have existed — either way, there&apos;s plenty more
                    back at the house
                  </p>
                  <PillLink href="/" variant="solid" icon={Home} className="mt-6 px-6">
                    back home
                  </PillLink>
                </div>

                {/* Address side, with the delivery attempt struck out */}
                <div className="relative min-h-[13rem] px-7 pb-9 pt-8 sm:px-9">
                  <CancelledStamp />
                  <div className="mt-[5.5rem] space-y-2.5">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                      addressed to
                    </div>
                    <div className="border-b border-stone-300/80 pb-1 text-base text-stone-500 line-through dark:border-stone-600/70 dark:text-stone-400">
                      whatever you typed
                    </div>
                    <div className="border-b border-stone-300/80 pb-1 text-sm text-stone-500 line-through dark:border-stone-600/70 dark:text-stone-400">
                      seanpatrickmay.me
                    </div>
                  </div>
                </div>
              </div>
              <ReturnMark />
            </div>
          </PinCard>
        </div>
      </main>
    </>
  );
}
