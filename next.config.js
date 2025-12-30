const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/** @type {import('next').NextConfig | ((phase: string) => import('next').NextConfig)} */
module.exports = phase => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    // Prevent `next build` from fighting with an already-running `next dev`
    // by using separate cache/output dirs.
    distDir: isDev ? '.next-dev' : '.next',
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
  };
};
