# Pinboard About Section Design

## Overview

Redesign the About section from a uniform 2-column card grid into a pinboard/corkboard-style collage layout. The visual style matches the site's casual text tone — personal, slightly messy, like a corkboard in someone's room.

## Design Direction

- **Style:** Pinboard — pushpin accents, slight card rotations (1-3°), light overlap, warm cork-textured background
- **Container:** Floating pinboard — a rounded-rectangle container with a warm paper/cork background, sitting within the existing clean site background. Not full-width; visually distinct from the rest of the site.
- **Dark mode:** The cork background shifts to a dark warm tone (e.g., `bg-gradient` from `stone-900` to `stone-950` with warm undertones). Pushpins keep their colors. Card dark mode treatments stay as-is.

## Content Hierarchy

### Hero pieces (large, prominent) — 3 items
1. **Training Stats** — compact card, red pushpin, -1.8° rotation. Shows hours (large number), km, kcal, milk cups, sparkline, journey equivalence.
2. **Spotify** — single combined card (artists + tracks in one), dark background, blue pushpin, +1.5° rotation. Auto-scroll preserved.
3. **Goodreads** — white card, green pushpin, +1° rotation. Currently reading + recently finished with star ratings.

### Accent pieces (small, woven in) — 2 items
4. **Project Spotlights** — polaroid-style cards. One main card with a second peeking behind it. Replaces the current `CaseStudyCard` usage.
5. **Hobbies** — pill-shaped stickers in a centered flex row at the bottom. Descriptions are dropped; only emoji + title shown.

## Grid Layout

```
Desktop (2-column equal grid, gap-20px):

  Row 1:  [Training (red pin, -1.8°)]  [Spotify (blue pin, +1.5°)]
  Row 2:  [Goodreads (green pin, +1°)] [Project polaroid (teal pin, -2°)]
                                            └─ 2nd project peeking (+3°, yellow pin)
  Row 3:  [────── hobby sticker pills, centered, spanning both columns ──────]
```

Grid ordering is explicit:
- Training: column 1, row 1
- Spotify: column 2, row 1
- Goodreads: column 1, row 2
- Project polaroid: column 2, row 2
- Hobby stickers: columns 1-2, row 3

This replaces the current layout which has: Training (col 1), Goodreads (col 2), Spotify Artists (col 1), Spotify Tracks (col 2), then hobbies and project spotlights as separate sections below.

## Z-Index Strategy

- Pinboard container: base layer
- Grid cards: `z-1` (default stacking)
- Peeking project card: `z-5` (behind main project card)
- Pushpins: `z-10` (always on top of their card)
- Hobby stickers: default flow, no z-index needed

## Component Changes

### New: `Pinboard.jsx`
Container component. Renders:
- Warm background gradient: `linear-gradient(135deg, #f5f0e6, #ede8db, #f0ebe0)` (light), warm dark gradient (dark mode)
- Subtle SVG noise texture overlay via `::before` pseudo-element (opacity 0.03, pointer-events none)
- `rounded-2xl` border, `shadow-lg`, `border-stone-300 dark:border-stone-700`
- Responsive padding: `px-9 py-12` desktop, `px-5 py-8` mobile

### New: `PinCard.jsx`
Wrapper for pinned cards. Props:
- `rotation: number` — CSS rotation in degrees
- `pinColor: 'red' | 'blue' | 'green' | 'yellow' | 'teal'`
- `pinPosition: 'center' | 'left' | 'right'` (default: `'center'`)
- `className: string` — pass-through
- `children: ReactNode`

The pushpin is a CSS `::before` pseudo-element on the card:
- 14px circle, absolutely positioned at top center/left/right
- `radial-gradient` for 3D sphere effect
- `box-shadow` for depth: `0 2px 4px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.4)`

Rotation respects `prefers-reduced-motion: reduce` — if enabled, `rotation` is set to 0.

### New: `ProjectPolaroid.jsx`
Polaroid-style project spotlight. Props:
- `project: object` — expects `{ slug, emoji, title, coverImage, oneLiner, cardDescription }`
- `rotation: number`
- `pinColor: string`
- `peek: boolean` — if true, renders smaller (width ~140px, cover height 50px) with absolute positioning

Structure:
- Cover image area: uses `project.coverImage.src` if available, else a `linear-gradient` fallback (`from-slate-900 via-slate-800 to-slate-700`)
- White border padding (6px) like a printed photo
- Below image: emoji, title (font-semibold), short description (cardDescription or oneLiner), "deep dive →" link to `/projects/${project.slug}/`

### Modified: `AboutSection.jsx`
Major restructure:
- Remove `Card`/`CardHeader`/`CardTitle`/`CardContent` imports for Training stats (replace with `PinCard`)
- Remove `CaseStudyCard` import — replaced by `ProjectPolaroid`
- Keep `Section` wrapper (preserves `id="about"` anchor and the section title/icon)
- Wrap content in new `Pinboard` component
- Compose grid:
  - Training stats content directly inside a `PinCard` (no `Card` wrapper)
  - Spotify: render both `SpotifyTopArtists` and `SpotifyTopTracks` inside a single `PinCard` with a divider between them. The existing components are used as-is, composed into one pinned card.
  - Goodreads: render `GoodreadsCard` content inside a `PinCard`. Since `GoodreadsCard` currently wraps itself in `Card`, modify `GoodreadsCard` to accept a `bare` prop (see below).
  - Projects: render `ProjectPolaroid` components
  - Hobbies: render restyled `HobbySpotlight`
- Remove the "when i'm not coding" and "projects worth showing" sub-headings — content is part of the collage now

### Modified: `GoodreadsCard.jsx`
Add a `bare` prop (default: `false`). When `bare` is true, skip the outer `Card`/`CardHeader`/`CardTitle` wrapper and render just the content. This lets `AboutSection` wrap it in a `PinCard` without double-card nesting. The component remains usable elsewhere with its default card wrapper.

### Modified: `HobbySpotlight.jsx`
Restyle from grid of mini-cards to a centered flex-wrap row of pill stickers:
- `flex flex-wrap gap-2.5 justify-center`
- Each item: `rounded-full` pill, `px-3.5 py-1.5`, `border border-stone-200 dark:border-stone-700`, `bg-white dark:bg-stone-800`, `shadow-sm`
- Content: emoji + title only. **Description text is dropped** — descriptions don't fit the pill format and the hobbies are self-explanatory with their emoji.
- Per-item rotations via inline `transform: rotate(Xdeg)` with small varied angles (-2°, 1.5°, -0.5°, 2°)
- Rotations set to 0 when `prefers-reduced-motion: reduce`

### Unchanged
- `SpotifyTopArtists.jsx` — used as-is, composed into the combined Spotify PinCard
- `SpotifyTopTracks.jsx` — used as-is, composed into the combined Spotify PinCard
- `AutoScrollList.jsx` — no changes
- `components/ui/LineSparkline.jsx` — no changes
- `components/projects/CaseStudyCard.jsx` — no changes (still used on projects page, just no longer imported in AboutSection)

## Responsive Behavior

| Breakpoint | Columns | Rotations | Peeking project | Pinboard padding |
|---|---|---|---|---|
| `lg+` | 2 equal | Full (1-3°) | Visible | `px-9 py-12` |
| `sm` to `lg` | 2 equal | Slightly reduced | Visible | `px-7 py-10` |
| `< sm` | 1 column | 0.5-0.8° | Hidden | `px-5 py-8` |

On single-column mobile, all cards stack vertically in order: Training, Spotify, Goodreads, Project (main only), Hobby stickers.

## Accessibility

- Pushpins are decorative — use `aria-hidden="true"` on the pseudo-element (or ensure it has no semantic content)
- Card rotations respect `prefers-reduced-motion: reduce` (set to 0°)
- Auto-scroll in Spotify lists already respects `prefers-reduced-motion` (existing behavior)
- All existing link/button focus states preserved
- Pinboard container gets no special ARIA role — it's a visual treatment, not a semantic landmark

## Background Technique

The cork/paper texture uses a CSS-only approach (no image assets):
- Base: `linear-gradient(135deg, ...)` with warm stone/amber tones
- Texture: SVG noise filter rendered inline via `::before` pseudo-element with low opacity
- This keeps the build simple and avoids image loading

## Files to Create
- `components/Pinboard.jsx`
- `components/PinCard.jsx`
- `components/ProjectPolaroid.jsx`

## Files to Modify
- `components/AboutSection.jsx` — restructure layout, replace Card wrappers with PinCard, remove CaseStudyCard import, compose Spotify into one card
- `components/GoodreadsCard.jsx` — add `bare` prop to skip Card wrapper
- `components/HobbySpotlight.jsx` — restyle as sticker pills, drop descriptions

## Files Unchanged
- `components/SpotifyTopArtists.jsx`
- `components/SpotifyTopTracks.jsx`
- `components/AutoScrollList.jsx`
- `components/ui/LineSparkline.jsx`
- `components/projects/CaseStudyCard.jsx`
