# seanpatrickmay.github.io

Static-exported personal portfolio built with Next.js and deployed to GitHub Pages. The site combines hand-curated project case studies with lightweight live data feeds from Garmin and Spotify so the homepage feels current without requiring a backend server.

## What the site includes

- A portfolio homepage with projects, experience, education, and activities
- A dedicated `/projects` archive with filters by tag and language
- Per-project static detail pages generated from `public/projects.json`
- Client-side widgets backed by generated JSON files in `public/`
- Scheduled GitHub Actions for deploys and data refreshes

## Stack

- Next.js 14
- React 18
- Tailwind CSS
- GitHub Pages
- Python for Garmin ingestion
- Node.js scripts for Spotify refresh and asset cleanup

## Repository layout

- `pages/` Next.js routes for the homepage and project pages
- `components/` reusable UI building blocks
- `public/projects.json` project catalog that drives the portfolio UI
- `public/experience.json` and `public/other-work.json` supporting resume-style sections
- `public/stats.json` generated Garmin activity summary
- `public/spotify.json` generated Spotify top artists and tracks
- `scripts/update_stats.py` Garmin refresh script
- `scripts/update_spotify.mjs` Spotify refresh script
- `.github/workflows/` deployment and scheduled refresh jobs

## Local development

Prerequisites:

- Node.js 20+
- npm

Install dependencies and start the dev server:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
npm run dev
npm run build
npm run preview
npm run clean
npm run normalize-logos
```

## Content and data model

The site is intentionally simple at runtime: pages import static JSON directly during build time.

- `public/projects.json` is the main portfolio data source
- `coolness` controls homepage featuring order
- `caseStudyRank` controls which projects appear in the deep-dive section
- `slug` enables static `/projects/<slug>` routes
- long-form fields such as `overview`, `whatIBuilt`, and `howItWorks` drive the detail pages

If a project is missing from `public/projects.json`, it does not appear on the site even if the repo exists on GitHub.

## Live data refresh

Two scheduled refresh jobs keep the site data current:

- Garmin stats refresh writes `public/stats.json`
- Spotify refresh writes `public/spotify.json`

Local execution:

```bash
python3 scripts/update_stats.py
node scripts/update_spotify.mjs
```

The Garmin script expects cached Garmin tokens or valid credentials in the environment. The Spotify script expects:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

## Deployment

The site is deployed as a static export through GitHub Pages.

- `.github/workflows/deploy.yml` builds and deploys the site
- `.github/workflows/update-stats.yml` refreshes `public/stats.json`
- `.github/workflows/update-spotify.yml` refreshes `public/spotify.json`

Any push to `main` triggers a fresh static build and deploy.

## Current limitations

- Project metadata is still maintained manually in `public/projects.json`
- There is no automated GitHub-to-portfolio sync yet
- Spotify and Garmin widgets depend on external credentials and scheduled workflows
- There is no formal test suite in this repo today

## Next documentation upgrades

- Add a project metadata generator so GitHub can populate objective fields automatically
- Add screenshots to the README for the homepage and project archive
- Document the expected schema for future project-sync automation
