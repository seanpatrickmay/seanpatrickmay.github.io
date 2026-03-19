# Pinboard Theme Unification & Copy Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the pinboard/collage aesthetic (beige texture, pushpins, slight rotations) from the About section to the projects page and remaining homepage sections, and rewrite all site copy in Sean's casual voice.

**Architecture:** Wrap existing page sections and cards in the existing `Pinboard` and `PinCard` components. No new components needed — just applying the existing pattern to more surfaces. Copy pass edits `projects.json` and a few JSX files.

**Tech Stack:** React, Next.js, Tailwind CSS, existing Pinboard/PinCard components

---

### Task 1: Wrap projects page in Pinboard

**Files:**
- Modify: `pages/projects/index.jsx`

- [ ] **Step 1: Add Pinboard import and wrap main content**

Add import at top:
```jsx
import Pinboard from '@/components/Pinboard';
```

Wrap the `<main>` content in a Pinboard. Replace:
```jsx
<main id="main-content" className="section-container pt-24 pb-16 space-y-12">
```
with:
```jsx
<main id="main-content" className="section-container pt-24 pb-16">
  <Pinboard className="space-y-12">
```
And add closing `</Pinboard>` before `</main>`.

- [ ] **Step 2: Warm up the filter bar**

Change the filter bar section (line ~285) from:
```jsx
<section className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 lg:sticky lg:top-20 lg:z-20">
```
to:
```jsx
<section className="rounded-2xl border border-stone-300/60 bg-stone-50/80 px-4 py-3 shadow-sm dark:border-stone-700/60 dark:bg-stone-800/80 lg:sticky lg:top-20 lg:z-20 backdrop-blur-sm">
```

Also update the search input background from `bg-white` / `dark:bg-slate-900` to `bg-white/80` / `dark:bg-stone-900/80`, and sort/filter buttons from `bg-white` / `dark:bg-slate-900` to `bg-white/80` / `dark:bg-stone-900/80`.

- [ ] **Step 3: Verify projects page renders**

Run: `open http://localhost:3004/projects/`
Expected: Projects page has warm beige background, filter bar blends with surface.

- [ ] **Step 4: Commit**

```bash
git add pages/projects/index.jsx
git commit -m "feat: wrap projects page in pinboard container"
```

---

### Task 2: Wrap ProjectHero in PinCard

**Files:**
- Modify: `components/projects/ProjectHero.jsx`

- [ ] **Step 1: Add PinCard import and wrap the outer section**

Add import:
```jsx
import PinCard from '@/components/PinCard';
```

Wrap the returned `<section>` element in a PinCard:
```jsx
return (
  <PinCard rotation={1.5} pinColor="teal">
    <section className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-lg dark:border-slate-800/70 dark:bg-slate-900">
      {/* ... existing content unchanged ... */}
    </section>
  </PinCard>
);
```

- [ ] **Step 2: Verify hero card has pushpin and rotation**

Run: `open http://localhost:3004/projects/`
Expected: Featured project hero has teal pushpin at top, slight clockwise rotation.

- [ ] **Step 3: Commit**

```bash
git add components/projects/ProjectHero.jsx
git commit -m "feat: wrap project hero in pincard"
```

---

### Task 3: Wrap ProjectBinder panels in PinCard

**Files:**
- Modify: `components/projects/ProjectBinder.jsx`

- [ ] **Step 1: Add PinCard import and rotation/color arrays**

Add import:
```jsx
import PinCard from '@/components/PinCard';
```

Add constants near the top of the file:
```jsx
const BINDER_ROTATIONS = [-1, 1.2, -0.8, 1.5, -0.6];
const BINDER_PIN_COLORS = ['red', 'blue', 'green', 'yellow', 'teal'];
```

- [ ] **Step 2: Wrap the binder panel container in PinCard**

In the `ProjectBinder` component's return, wrap the `<div className="rounded-2xl border...">` container (line ~168) in a PinCard that uses the `selectedIndex`:
```jsx
<PinCard
  rotation={BINDER_ROTATIONS[selectedIndex % BINDER_ROTATIONS.length]}
  pinColor={BINDER_PIN_COLORS[selectedIndex % BINDER_PIN_COLORS.length]}
>
  <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 -mt-px">
    {/* ... existing panels ... */}
  </div>
</PinCard>
```

- [ ] **Step 3: Verify binder has rotating pin that changes with tab selection**

Run: `open http://localhost:3004/projects/`
Expected: Binder panel below tabs has pushpin and slight rotation. Switching tabs changes the rotation and pin color.

- [ ] **Step 4: Commit**

```bash
git add components/projects/ProjectBinder.jsx
git commit -m "feat: wrap binder panels in pincard"
```

---

### Task 4: Wrap ArchiveCards in PinCard

**Files:**
- Modify: `pages/projects/index.jsx`

- [ ] **Step 1: Add PinCard import and rotation/color arrays**

Add import (if not already there):
```jsx
import PinCard from '@/components/PinCard';
```

Add constants:
```jsx
const ARCHIVE_ROTATIONS = [-1.2, 0.8, -0.6, 1.0, -1.0, 0.5];
const ARCHIVE_PIN_COLORS = ['red', 'blue', 'green', 'yellow', 'teal'];
```

- [ ] **Step 2: Wrap each ArchiveCard in PinCard**

Change the archive grid rendering (line ~404) from:
```jsx
{archiveProjects.map(project => (
  <ArchiveCard key={project.slug || project.title} project={project} />
))}
```
to:
```jsx
{archiveProjects.map((project, i) => (
  <PinCard
    key={project.slug || project.title}
    rotation={ARCHIVE_ROTATIONS[i % ARCHIVE_ROTATIONS.length]}
    pinColor={ARCHIVE_PIN_COLORS[i % ARCHIVE_PIN_COLORS.length]}
  >
    <ArchiveCard project={project} />
  </PinCard>
))}
```

- [ ] **Step 3: Verify archive grid has pushpins and rotations**

Run: `open http://localhost:3004/projects/`
Expected: Each archive card has a colored pushpin and slight rotation. Grid layout preserved.

- [ ] **Step 4: Commit**

```bash
git add pages/projects/index.jsx
git commit -m "feat: wrap archive cards in pincard"
```

---

### Task 5: Wrap MapSection in Pinboard and entry list in PinCard

**Files:**
- Modify: `components/MapSection.jsx`
- Modify: `components/MapEntryList.jsx`

- [ ] **Step 1: Add Pinboard import to MapSection and wrap content**

In `MapSection.jsx`, add:
```jsx
import Pinboard from '@/components/Pinboard';
```

In the `Section` component's children, wrap everything (category pills, PinMap, MapEntryList) in a `<Pinboard>`:
```jsx
<Section id="experience" title="where i've been" icon={MapPin}>
  <Pinboard>
    {/* Category pills */}
    <div className="flex gap-2 mb-4">
      {/* ... existing pills ... */}
    </div>

    {/* Map */}
    <PinMap ... />

    {/* Entry list */}
    <MapEntryList ... />
  </Pinboard>
</Section>
```

- [ ] **Step 2: Wrap each entry in MapEntryList with PinCard**

In `MapEntryList.jsx`, add:
```jsx
import PinCard from '@/components/PinCard';
```

Add rotation/color arrays:
```jsx
const ENTRY_ROTATIONS = [-0.8, 0.6, -0.5, 0.9, -0.7, 0.4];
const ENTRY_PIN_COLORS = ['red', 'blue', 'green', 'yellow', 'teal'];
```

Wrap each `<button>` entry in a `<PinCard>`:
```jsx
return (
  <PinCard
    key={`${pin.org}-${i}`}
    rotation={ENTRY_ROTATIONS[i % ENTRY_ROTATIONS.length]}
    pinColor={ENTRY_PIN_COLORS[i % ENTRY_PIN_COLORS.length]}
  >
    <button ... >
      {/* ... existing content ... */}
    </button>
  </PinCard>
);
```

Remove the `key` from the `<button>` since it moves to PinCard.

- [ ] **Step 3: Verify map section has pinboard background and pinned entries**

Run: `open http://localhost:3004/#experience`
Expected: Map section sits on warm beige background. Entry list items have pushpins and slight rotations.

- [ ] **Step 4: Commit**

```bash
git add components/MapSection.jsx components/MapEntryList.jsx
git commit -m "feat: wrap map section in pinboard with pinned entries"
```

---

### Task 6: Wrap ContactSection in Pinboard + PinCard

**Files:**
- Modify: `components/ContactSection.jsx`

- [ ] **Step 1: Read current ContactSection and add imports**

Add imports:
```jsx
import Pinboard from '@/components/Pinboard';
import PinCard from '@/components/PinCard';
```

- [ ] **Step 2: Wrap section content in Pinboard, card in PinCard**

Wrap the inner content of the Section component in a `<Pinboard>`. Wrap the centered contact card `<div className="relative max-w-lg mx-auto ...">` in `<PinCard rotation={1} pinColor="teal">`.

- [ ] **Step 3: Verify contact section has warm background and pinned card**

Run: `open http://localhost:3004/#contact` (or scroll to bottom)
Expected: Contact section has beige pinboard background. Contact card has teal pushpin.

- [ ] **Step 4: Commit**

```bash
git add components/ContactSection.jsx
git commit -m "feat: wrap contact section in pinboard"
```

---

### Task 7: Copy pass — projects.json casual rewrite

**Files:**
- Modify: `public/projects.json`

- [ ] **Step 1: Rewrite all project text fields in casual voice**

For each project in `projects.json`, rewrite these fields in Sean's casual register:
- `overview` — lowercase, conversational, like explaining to a friend
- `proofPoints` — shorter, punchier, no resume-speak
- `whatIBuilt` — casual first person
- `howItWorks` — simple, direct steps
- `results` — conversational
- `nextSteps` — casual future plans

**Voice rules:**
- Lowercase sentence starts
- No banned words (delve, leverage, utilize, robust, landscape, etc.)
- Use "i" not "we", hedges where natural ("sort of", "basically")
- No em-dashes or semicolons
- Comma before "and" in compound sentences, no Oxford comma in lists

Also audit `oneLiner`, `cardDescription`, and `featuredDescription` — many already sound natural but some may read stiff. Apply the same rule: if it sounds like a resume, rewrite it. If it already sounds casual, leave it.

- [ ] **Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/projects.json','utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add public/projects.json
git commit -m "content: rewrite project copy in casual voice"
```

---

### Task 8: Copy pass — case study page headings and projects page chrome

**Files:**
- Modify: `pages/projects/[slug].jsx`
- Modify: `pages/projects/index.jsx`

- [ ] **Step 1: Ensure case study section headings are lowercase**

In `pages/projects/[slug].jsx`, verify these headings are lowercase (they already are based on the current code: "what i built", "how it works", "results", "what's next", "screenshots"). No changes needed if already lowercase.

- [ ] **Step 2: Check projects page chrome text**

In `pages/projects/index.jsx`, verify:
- Page title: "projects" ✓
- Subtitle: "things i've built — some i'm proud of, and some that taught me a lot" — rewrite to feel more natural, e.g.: "things i've built, some cool and some just for learning"
- Empty state: "nothing matches those filters, try adjusting your search or clearing some" ✓
- Section headings: "deep dives" ✓, "project archive" ✓

- [ ] **Step 3: Commit**

```bash
git add "pages/projects/[slug].jsx" pages/projects/index.jsx
git commit -m "content: casual copy pass on project page chrome"
```

---

### Task 9: Final visual check across all pages

- [ ] **Step 1: Screenshot projects page**

Open `http://localhost:3004/projects/` and verify:
- Beige pinboard background on full page
- Hero card has teal pushpin + rotation
- Binder has pin that changes with tabs
- Archive cards all have pushpins
- Filter bar blends with warm surface

- [ ] **Step 2: Screenshot homepage sections**

Open `http://localhost:3004/` and verify:
- About section: unchanged (already pinboard)
- Map section: warm pinboard background, pinned entries
- Contact section: warm pinboard background, pinned card
- Hero: unchanged

- [ ] **Step 3: Check a case study page**

Open `http://localhost:3004/projects/life-dashboard/` and verify:
- Copy reads casual and natural
- Headings are lowercase

- [ ] **Step 4: Final commit if any adjustments needed**

```bash
git add -A
git commit -m "fix: visual adjustments from final review"
```
