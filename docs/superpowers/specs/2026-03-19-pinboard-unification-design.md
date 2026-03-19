# Pinboard Theme Unification & Copy Pass

**Goal**: Extend the pinboard/collage aesthetic from the About section to the projects page and remaining homepage sections (map, contact). Rewrite all site copy in Sean's casual voice.

**Date**: 2026-03-19

---

## 1. Projects Page — Pinboard Restyling

### Approach
Wrap existing project page sections in `Pinboard` containers and individual cards in `PinCard` wrappers. Keep the current page structure (hero spotlight → tabbed binder → filterable archive grid) but apply the warm beige texture, pushpins, and slight rotations.

### Changes

**Page wrapper** (`pages/projects/index.jsx`):
- Wrap the main content area in a `Pinboard` component so the full page sits on the warm beige/tan gradient with noise texture overlay

**ProjectHero** (`components/projects/ProjectHero.jsx`):
- Wrap the outer `<section>` in `PinCard` with rotation ~1.5deg, teal pin
- Inner card styling stays (rounded border, white bg, cover image + content grid)

**ProjectBinder** (`components/projects/ProjectBinder.jsx`):
- Each tab panel's content card wraps in `PinCard`
- Rotations vary per tab: cycle through -1deg, 1.2deg, -0.8deg, 1.5deg
- Pin colors cycle: red, blue, green, yellow, teal

**ArchiveCard** (`components/projects/ArchiveCard.jsx`):
- Each card wraps in `PinCard` at the grid-item level
- Small deterministic rotations based on index: `[-1.2, 0.8, -0.6, 1.0, -1.0, 0.5]` cycling
- Pin colors cycle through the 5 available colors

**Filter bar**:
- Stays flat and functional (no rotation/pins)
- Background tinted warm to blend with pinboard surface (stone-100/stone-800 instead of white/slate)

## 2. Homepage Sections — Extending Warmth

### MapSection (`components/MapSection.jsx`)
- Wrap section content in `Pinboard` container
- Map component keeps its own border/background unchanged
- Entry list items (`MapEntryList.jsx`) get `PinCard` wrappers with slight rotations and cycling pin colors
- Category pill buttons shift to warmer color palette (stone tones for inactive, keep red for active)

### ContactSection (`components/ContactSection.jsx`)
- Wrap section content in `Pinboard` container
- The contact card itself becomes a `PinCard` (slight rotation ~1deg, teal pin)
- Decorative scattered emoji stay — they complement the pinboard texture

### Not changed
- Hero section — left as-is (polaroid fan is its own aesthetic)
- Section headers (`Section.jsx`) — clean headings above pinboard containers, no changes
- About section — already uses Pinboard/PinCard, no changes needed

## 3. Copy Pass — Casual Voice

### Register
Casual throughout. Lowercase, conversational, the way Sean would describe his work to a friend. Based on the write-like-me skill profile.

### Scope

**`public/projects.json`** — all text fields:
- `oneLiner`, `cardDescription`, `overview`: rewrite anything that reads formal/resume-style
- `proofPoints`, `whatIBuilt`, `howItWorks`: lowercase, casual phrasing
- `results`, `nextSteps`: conversational tone
- Rule: if it sounds like a resume or press release, rewrite it. If it already sounds natural, leave it.

**Case study page chrome** (`pages/projects/[slug].jsx`):
- Section headings: lowercase ("what i built", "how it works", "results", "what's next")
- Any static UI text that feels stiff

**Projects page chrome** (`pages/projects/index.jsx`):
- Filter labels, button text, empty state messages — scan for generic phrasing

**Homepage text**:
- Hero bio: already sounds natural, light touch only
- Contact section copy: already casual, keep as-is unless something stands out
- Section headers: already lowercase, good

### Voice rules (from write-like-me)
- High self-reference ("i" not "we")
- Contrastive transitions ("but", "though") over additive
- Genuine hedges ("i think", "sort of", "probably")
- No banned words (delve, leverage, utilize, robust, landscape, etc.)
- No em-dashes or semicolons
- Comma before "and" in compound sentences, no Oxford comma in lists

## 4. Components Affected

| Component | Change |
|---|---|
| `pages/projects/index.jsx` | Wrap in Pinboard, warm filter bar |
| `components/projects/ProjectHero.jsx` | Wrap in PinCard |
| `components/projects/ProjectBinder.jsx` | Wrap tab panels in PinCard |
| `components/projects/ArchiveCard.jsx` | Wrap in PinCard at grid level |
| `components/MapSection.jsx` | Wrap in Pinboard |
| `components/MapEntryList.jsx` | Wrap entries in PinCard |
| `components/ContactSection.jsx` | Wrap in Pinboard + PinCard |
| `pages/projects/[slug].jsx` | Lowercase section headings |
| `public/projects.json` | Rewrite copy in casual voice |

## 5. What stays the same
- Hero section layout and polaroid fan
- About section (already pinboard)
- Pinboard and PinCard component internals
- Map SVG component
- All functionality (filtering, search, sorting, tooltips, navigation)
- Dark mode support (Pinboard/PinCard already handle it)
- Reduced motion accessibility (PinCard already handles it)
