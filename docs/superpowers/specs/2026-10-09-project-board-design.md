# Project Board — Design

**Date:** 2026-10-09
**Author:** Sean May (with Claude)
**Status:** Design approved in conversation; spec awaiting review

## Problem

The site's main audience is recruiters screening for **quant and SWE roles, both**. They skim
for about 30 seconds, then maybe open one deep dive. Today the site works against that:

1. **Projects are buried.** On desktop the projects section starts ~3,500px down, under
   ~1,800px of about-me cards. On a phone it starts 5,574px down and runs 4,631px.
2. **The same projects appear twice.** The hero fan shows ranks 1–3; the projects section
   features rank 1 again and opens its grid with ranks 2–3.
3. **Everything has equal weight.** Ten identical cards: a quant-shop data pipeline sits at
   the same size as a 2023 course project.
4. **Deep dives are one text-only template.** Every page shows the same numbers up to three
   times (overview, proof cards, results). Most have no figures. The two top-ranked projects
   are private repos, so their deep dive is the only evidence a visitor can check, and it is
   the weakest part of the site.
5. **Hand-written numbers drift.** The wildfire entry claimed F2 0.930 (that was recall),
   AUC 0.995 (that was XGBoost's) and 13 fires (it was 8 + 4) until 2026-10-09.
6. **The site is missing its strongest recent work.** RepoWiki (1,122 commits),
   AlphaSettler (149 commits) and RotoText have no entry. All three have wikis at
   `seanpatrickmay.me/wiki/`, built by RepoWiki.
7. **`/projects/` is a client-side redirect** to `/#projects`: blank without JavaScript and
   invisible to crawlers.

## Decisions (made in conversation)

| Question | Decision |
|---|---|
| Audience | Recruiters; quant and SWE both |
| Overall shape | One composed pinboard of projects, as an overview; cards link to deep dives |
| Placement | Home page, directly under the hero; replaces both the hero fan and the current projects section |
| Inventory | 9 cards (below). Less is more |
| Composition | Two clusters: "things that run" and "things that think" |
| Phone layout | Stacked clusters, with two jump links at the top |
| Card behaviour | Whole card links to its deep dive; no pill buttons on the board; artifacts link to their own evidence |
| Deep-dive top | Evidence first: the lead figure replaces the hand-drawn cover |
| Private projects | Lead figure is a generic, hand-drawn diagram of the pattern, with no internal names, vendors or schema; Sean checks each before it ships |
| Wiki | Link to it, plus a stats strip with hand-picked feature links on wikied deep dives. Lines of code are not shown |
| Hero | Fan removed; sidebar jobs link to the work done there; no "looking for" line |

## The board

### Inventory and placement

| Cluster | Size | Order | Project | Notes |
|---|---|---|---|---|
| things that run | big | 1 | Alternative Data Pipeline | Private (NU Systematic Alpha) |
| things that run | big | 2 | RepoWiki | **New entry** |
| things that run | small | 3 | Life-Dashboard | The only live product |
| things that run | small | 4 | AI Chief of Staff | Private (NExT Consulting) |
| things that run | small | 5 | LecteurAide | |
| things that think | big | 1 | AlphaSettler | **New entry** |
| things that think | big | 2 | Wildfire Modeling | Absorbs `wildfire-data-pipeline` |
| things that think | small | 3 | PokerML | Absorbs `CFR-Exploration` |
| things that think | small | 4 | RotoText | **New entry. On the board only once a live demo exists** |

Leaving the board: Human Digit Recognition, Hex Reversi, Linux Shell (C), and the site's own
entry. **Their deep-dive pages keep building** so no existing link breaks. They are simply no
longer linked from the board. The site's own entry becomes a footer line.

One corner note links to GitHub: "everything else lives on GitHub ↗"
(`https://github.com/seanpatrickmay`). There is no scrap pile of minor repos.

### Artifacts and thread

| Artifact | Kind | Pinned beside | Text | Links to |
|---|---|---|---|---|
| Job tag | tag | Alternative Data Pipeline | NU Systematic Alpha | — |
| Sticky | sticky | RepoWiki | wrote the wikis for 5 of these | `https://seanpatrickmay.me/wiki/` |
| Sticky | sticky | AlphaSettler | 300× faster than Catanatron | `https://seanpatrickmay.me/wiki/alphasettler/wiki/performance-testing/` |
| Paper | paper | Wildfire Modeling | Hourly Wildfire Spread… | `/projects/wildfire-modeling/hourly-wildfire-spread-prediction.pdf` |
| Polaroid | polaroid | Life-Dashboard | it's live | `https://lifedashboard.tech` |
| Job tag | tag | AI Chief of Staff | NExT Consulting | — |

Thread: AlphaSettler ↔ PokerML (game AI under hidden information). Job tags are pinned onto
their card, so they need no thread.

Every number on an artifact must trace to a source. "300×" is from AlphaSettler's
`docs/perf/comparison.md` (2026-10-01, after optimisation): 68.2 ns/step vs Catanatron's
20,691 ns/step with trades off, same M1 Pro, about 303×.

### What a card shows

- **Big:** the existing `CoverArt` motif, its `coverArt.line` caption as the handwritten proof
  line, the title, and one meta line (period · primary tech).
- **Small:** title and one line.
- No tag filters, no project count, no separate featured card.

### Behaviour and accessibility

- The whole card is one link to `/projects/<slug>/`. Artifacts with an `href` are separate
  links with real accessible names (e.g. "Wildfire paper (PDF)"). Job tags are plain text.
- DOM order is strict rank order within each cluster ("run" first), with each artifact
  directly after its card. Tab order and screen readers follow the ranking, not the scatter.
- Thread is decorative (`aria-hidden`), and so are the tilts.
- Tilt and hover-lift are disabled under `prefers-reduced-motion`.

### Layout

- **Desktop (`lg` and up):** the two clusters sit side by side on a CSS grid with fixed
  slots per size and order, so adding a card does not break the composition. Rotation, pin
  colour and fastener come from the same fixed cycles `ProjectsSection` uses today. Artifacts
  are positioned relative to their card.
- **Below `lg`:** the clusters stack, "things that run" first. Big cards go full width with
  their artifacts tucked on a corner, and small cards sit two to a row. Two jump links
  ("things that run · things that think") sit at the top of the board.
- **Thread** is an SVG overlay. Endpoints are measured from card positions after layout
  (`ResizeObserver`). Nothing renders before measurement or on the server, and nothing
  renders below `lg`.

## Home page and hero

- Order becomes: hero → **board** → about me → map → contact.
- `Hero` loses the "a few things i built" fan and the "see all projects" button. The intro
  column takes the freed width.
- Sidebar timeline entries get an optional `href`. NU Systematic Alpha links to
  `/projects/alternative-data-pipeline/` and NExT Consulting to `/projects/ai-chief-of-staff/`.
  On a phone, where the sidebar collapses to chips, the Quant Research chip links the same
  way.
- `/projects/` becomes a real static page rendering the same `Board`. The deep dive's
  "← all projects" link points to it.

## Deep dives

### Rules

1. Every fact appears once on the page.
2. Every number states its source (paper table, wiki page, benchmark doc, repo file).
3. Real output first: a lead figure replaces the hand-drawn cover in the masthead. The cover
   art remains the fallback for any project without a `leadFigure`.

### Page order

1. "← all projects"
2. Title, period and `credits` line (e.g. "Feb – Apr 2026 · with Aidan D'Alonzo & Ethan
   Meid"; the period is a proposal, since the site says "Updated Mar 2026" today), plus links. The first link stays solid. A `wiki` link kind ranks between `paper`
   and `repo` in `sortProjectLinks`.
3. Stack chips (at most 4)
4. **Metrics strip:** three metrics, each `value · label · source ↗`
5. **Lead figure:** a pinned card with caption and source link
6. **Wiki strip** (wikied projects only, see below)
7. Overview paragraph
8. "what i built", and "how it works" only for projects **without** a wiki. On wikied
   projects, the wiki strip's feature links replace it.
9. **Findings:** the non-numeric lessons from today's `results`
10. "what's next" (handwritten)

The three proof cards and the separate results list are removed. Their numbers move into
the metrics strip and their lessons into findings.

Order note: the mockup put the wiki strip directly under the metrics. This spec places it
after the lead figure, so the figure stays in the first screen on wikied projects too.

### Lead figures

| Project | Figure | Source | Made by |
|---|---|---|---|
| Wildfire Modeling | Creek Fire, hour 186: previous / actual / predicted | Paper p. 16 (cropped from the PDF) | Done in brainstorm; re-crop at 2× for production |
| AlphaSettler | ns/step bar chart, log scale: AlphaSettler 68 · catan-rl 88 · Catanatron 20,691 | `docs/perf/comparison.md` | Claude (static SVG) |
| RepoWiki | Screenshot of a real wiki article (PokerML's CFR page with infobox and citations) | Live wiki | Claude |
| Life-Dashboard | One of the 8 screenshots in `docs/screenshots/` | Repo | Claude; Sean picks which |
| LecteurAide | Its existing cover screenshot | Site | Exists |
| PokerML | 13×13 range grid from the web UI | Run `server/app.py` locally | Claude, if it runs |
| RotoText | A few seconds of looping video of the parallax effect | Needs Sean's face and camera | **Sean** |
| Alternative Data Pipeline | Generic pattern diagram, hand-drawn style | From the existing description | Claude drafts; **Sean checks** |
| AI Chief of Staff | Generic pattern diagram, hand-drawn style | From the existing description | Claude drafts; **Sean checks** |

Images live in `public/projects/<slug>/`. Raster figures get WebP variants through
`scripts/generate_cover_variants.mjs` (or an extension of it).

## Wiki strip

Shown on deep dives of projects with a `wiki` field: RepoWiki, AlphaSettler, Life-Dashboard,
PokerML, LecteurAide, RotoText.

```
📖 code wiki · 25 features · 517 cited claims
   345 commits, Oct 2025 – Jun 2026 · solo
   Python · TypeScript
   ▸ iMessage integration  ▸ Garmin sync  ▸ AI digest   read the wiki →
```

| Field | Derived from `export.json` |
|---|---|
| Features | `pages.length` |
| Cited claims | claims with at least one citation, across all page sections |
| Commits, span | `people.snapshot.commits`; min `firstCommitDate` / max `lastCommitDate` over page infoboxes |
| Authorship | "solo" when one human holds all lines; otherwise Sean's share of `currentLines` |
| Languages | union of infobox `languages`, minus JSON, Markdown, CSS, HTML, YAML, TOML and Shell; top 2–3 |
| Feature links | `wiki.highlight` (hand-picked feature ids) → `https://seanpatrickmay.me/wiki/<slug>/wiki/<featureId>/` |

**Lines of code are excluded on purpose.** The export's line counts disagree with each other
(Life-Dashboard's iMessage feature reports 105,472 lines against a 98,227-line repo, because
they count JSON fixtures and Markdown).

## Data model

All in `public/projects.json`, which stays the single source of truth. New or changed
fields:

```jsonc
{
  "board": { "cluster": "run", "size": "big", "order": 1 },   // absent = not on the board
  "artifacts": [
    { "kind": "sticky", "text": "300× faster than Catanatron",
      "href": "https://seanpatrickmay.me/wiki/alphasettler/wiki/performance-testing/",
      "label": "AlphaSettler benchmark (wiki)" }
  ],
  "threadTo": ["pokerml"],
  "credits": "with Aidan D'Alonzo & Ethan Meid",
  "leadFigure": { "src": "/projects/wildfire-modeling/creek-186.webp", "alt": "…", "caption": "…",
                  "source": { "label": "Figure from the paper", "href": "…pdf" } },
  "metrics": [
    { "value": "F1 0.929", "label": "on four fires the model never saw",
      "source": { "label": "paper · Table 3", "href": "…pdf" } }
  ],
  "findings": ["…"],
  "wiki": { "slug": "life-dashboard", "highlight": ["imessage-integration", "garmin-integration", "ai-digest"] }
}
```

- `findings` replaces `results`. `proofPoints` and `bullets` are retired from deep-dive
  rendering (metrics and `whatIBuilt` cover them). `validateProjects` stops requiring
  `bullets`.
- `caseStudyRank` and `coolness` are no longer used for display. The board reads `board`.
- New entries for RepoWiki, AlphaSettler and RotoText. Claude drafts them from their wikis;
  Sean reviews the copy.

### Wiki feed

- **New:** `scripts/update_wikis.mjs`. For each project with `wiki.slug`, it fetches
  `https://seanpatrickmay.me/wiki/<slug>/export.json`, derives the strip fields above, and
  writes `public/wikis.json` (about 1KB per project) with `generated_at`.
- **New:** `.github/workflows/update-wikis.yml`, daily, the same shape as
  `update-goodreads.yml` (commit only on change).
- Deep dives read `wikis.json` at build time. A missing entry hides the strip. Staleness
  uses the existing `getStaleness`.

## Components

| Status | Component | Role |
|---|---|---|
| New | `components/projects/Board.jsx` | Clusters, grid slots, stacked phone layout, jump links |
| New | `components/projects/BoardCard.jsx` | Big and small cards |
| New | `components/projects/Artifact.jsx` | paper, sticky, polaroid, tag variants |
| New | `components/projects/Thread.jsx` | Measured SVG overlay, desktop only |
| New | `components/projects/MetricsStrip.jsx` | Three sourced metrics |
| New | `components/projects/WikiStrip.jsx` | Strip from `wikis.json` |
| Changed | `pages/index.jsx`, `components/Hero.jsx` | Order; fan removed |
| Changed | `components/SidebarTimeline.jsx`, `lib/timeline.js` | Optional `href` per job |
| Changed | `pages/projects/[slug].jsx` | New page order and evidence-first masthead |
| Changed | `pages/projects/index.jsx` | Real page rendering `Board` |
| Changed | `lib/projectDisplay.js`, `lib/projects.js` | `wiki` link kind; validation |
| Removed | `ProjectsSection.jsx`, `projects/ProjectHero.jsx`, `projects/ArchiveCard.jsx` | Replaced by `Board` |

`Pinboard` and `PinCard` are reused as they are.

## Testing

- **Schema test** (`lib/board.test.mjs`): exactly 4 big cards (2 per cluster); `order` is
  unique within a cluster; every metric has a source; every artifact `href` is non-empty
  where the kind requires one; every `threadTo` and `wiki.highlight` target exists; every
  off-board project still has a slug, so its page builds.
- **Feed test** (`scripts/update_wikis.test.mjs`): derivation against a trimmed fixture
  export, including the language filter and the "solo" rule. Same pattern as
  `update_spotify.test.mjs`.
- **Font test:** extend `handwrittenStrings()` in `lib/fontSubset.test.mjs` to sticky,
  paper, polaroid and tag text, cluster labels and lead-figure captions. Regenerate the
  Caveat subset if "×" or any other new character is missing.
- `npm run build` passes. `/projects/` and every deep dive, including the off-board ones,
  export as HTML.
- Playwright screenshots at 1440 and 390 widths, light and dark. A Tab-order check that the
  board's focus order matches rank order.

## Milestones

Each milestone ships on its own.

1. **Board:** `Board`, `BoardCard`, `Artifact`, `Thread`, home order, no fan, sidebar job
   links, a real `/projects/` page, the `wiki` link kind, schema and font tests. Uses existing
   copy and covers. The three new entries ship with their wiki links; RotoText stays off the
   board until its demo exists.
2. **Deep dives:** new page order, `MetricsStrip`, lead figures, findings, `credits`, content
   migration from `proofPoints` / `bullets` / `results`.
3. **Wiki strip:** `update_wikis.mjs`, the workflow, `wikis.json` and `WikiStrip`.

## Prerequisites outside this repo (Sean)

- READMEs for RepoWiki, AlphaSettler and RotoText. Even five lines plus a wiki link: today a
  recruiter clicking through sees only a file list.
- AlphaSettler's GitHub description says "Superhuman". The wiki has speed numbers but no
  win-rate result. Change it to "fast" unless there's a strength result to cite.
- A hosted RotoText demo and a short capture of it.
- Review the two generic diagrams and the drafted copy for the three new entries.
- A real caption for RepoWiki's card (the mockup's "the wiki that writes itself" is a
  placeholder).

## Out of scope

- Restyling the wiki itself. The Wikipedia look is part of what RepoWiki is.
- Rendering wiki architecture diagrams (Mermaid) on the site.
- Changes to the about-me, map and contact sections beyond their position.
- Pan/zoom or drag interaction on the board.
