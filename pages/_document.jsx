import { Html, Head, Main, NextScript } from 'next/document'

/**
 * Inline theme script:
 * - If user saved a preference -> use it.
 * - Else follow system preference.
 * - Applies class *before* paint to avoid FOUC.
 */
const themeInitScript = `(function () {
  const stored = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (systemDark ? 'dark' : 'light');
  if (theme === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
})();`

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

