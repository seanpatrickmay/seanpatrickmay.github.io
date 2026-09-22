import { Html, Head, Main, NextScript } from 'next/document';
import { PRELOAD } from '@/lib/fontSpec';

const themeInitScript = `(function () {
  try {
    const stored = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (systemDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch(e) {}
})();`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Fonts are self-hosted — see lib/fontSpec.js for why, and
            scripts/fetch_fonts.mjs for how they get here.

            The two faces used above the fold are preloaded: @font-face rules
            are only discovered once the stylesheet parses, which left the
            body font a full round trip behind the page and made the hero
            paragraph paint twice — once in the fallback, once in DM Sans.
            crossOrigin is required even same-origin, because font fetches
            are CORS-mode; without it the preload is discarded and the file
            is fetched a second time. */}
        {PRELOAD.map(file => (
          <link
            key={file}
            rel="preload"
            as="font"
            type="font/woff2"
            href={`/fonts/${file}`}
            crossOrigin="anonymous"
          />
        ))}
        <link rel="preconnect" href="https://i.scdn.co" crossOrigin="anonymous" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
