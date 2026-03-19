import Head from 'next/head';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta property="og:title" content="Sean P. May — Portfolio" />
        <meta property="og:description" content="Software engineer and mathematician at Northeastern. Projects in AI, quant research, and full-stack development." />
        <meta property="og:image" content="https://seanpatrickmay.me/images/headshot.png" />
        <meta property="og:url" content="https://seanpatrickmay.me" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sean P. May — Portfolio" />
        <meta name="twitter:description" content="SWE &amp; math at Northeastern — AI tutoring, quant research, prediction markets, and more." />
        <meta name="twitter:image" content="https://seanpatrickmay.me/images/headshot.png" />
      </Head>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-teal-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
      >
        Skip to content
      </a>
      <Component {...pageProps} />
    </>
  );
}
