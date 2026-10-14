import Head from 'next/head';
import '@/styles/fonts.css';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta key="og:title" property="og:title" content="Sean P. May — Portfolio" />
        <meta key="og:description" property="og:description" content="Software engineer and mathematician at Northeastern. Projects in AI, quant research, and full-stack development." />
        <meta key="og:image" property="og:image" content="https://seanpatrickmay.me/images/headshot.png" />
        <meta key="og:url" property="og:url" content="https://seanpatrickmay.me" />
        <meta key="og:type" property="og:type" content="website" />
        <link key="canonical" rel="canonical" href="https://seanpatrickmay.me" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" name="twitter:title" content="Sean P. May — Portfolio" />
        <meta key="twitter:description" name="twitter:description" content="swe, math, and whatever looks interesting — AI tutoring, quant research, and more." />
        <meta key="twitter:image" name="twitter:image" content="https://seanpatrickmay.me/images/headshot.png" />
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
