# Personal Stats Reliability + Reading Progress — Design

**Date:** 2026-05-28
**Author:** Sean May (with Claude)
**Status:** Approved for autonomous implementation

## Problem

1. **Garmin stats stopped updating** on 2026-03-21 (68 days stale) while Spotify/Goodreads
   refresh daily. The site's training card shows frozen data.
2. **Books** should show reading *progress*, and there should be a **total-pages-read**
   statistic, anchored to a window and/or compared to a familiar benchmark.

## Root Cause (Garmin) — confirmed via CI logs

`.github/workflows/update-stats.yml` installs `garminconnect` **unpinned**. PyPI's latest
moved to **0.3.3**, which changed/removed the `Garmin.garth` attribute the script relies on
(`g.garth.load` / `g.garth.dump`). Sequence each daily run:

1. `g.garth.load(TOKENS_DIR)` → `AttributeError: 'Garmin' object has no attribute 'garth'`
2. Exception swallowed → script falls through to a **fresh login**
3. Fresh login from GitHub's datacenter IP → **429 "IP rate limited by Garmin"**
4. `g.garth.dump` → same AttributeError → exit 1 (run fails in ~25s, nothing committed)

Verified locally: `garminconnect==0.2.28` + `garth==0.5.17` + the existing cached tokens
(`~/.garminconnect/oauth1_token.json`, `oauth2_token.json`) successfully fetch fresh
activities (latest 2026-05-20) from a residential IP with **no 429**. The 429 was
login-specific and self-inflicted by the fall-through; cached-token API calls are unaffected.

## Solution — Part 1: Garmin

- **New:** `scripts/requirements-stats.txt`

  ```
  garminconnect==0.2.28
  garth==0.5.17
  ```

  (0.2.28 requires `garth<0.6.0,>=0.5.13`; 0.5.17 satisfies it. This is the combo proven to
  work locally.)

- **Edit:** `update-stats.yml` install step → `pip install -r scripts/requirements-stats.txt`.

- **Harden `scripts/update_stats.py`** (defense-in-depth, addresses the observed failure mode):
  - Only attempt a fresh email/password login when `GARMIN_ALLOW_FRESH_LOGIN` is set.
    CI does not set it → if cached tokens ever fail, the run exits with a clear message
    instead of hammering the 429-blocked login endpoint. Local re-seeding sets the flag.
  - Preserve the existing `profile` block if `get_user_profile()` returns empty (the endpoint
    returns nulls on the pinned combo; profile is non-essential, but we shouldn't wipe it).

- **Immediate:** run the script locally to regenerate `public/stats.json` with fresh data.

**Permanence:** pinning prevents silent dependency drift (the actual cause). If GitHub IPs are
ever blocked for *API* calls (no evidence today — every failure died at login first), the
documented fallback is a local `launchd`/cron run on Sean's Mac, which uses a residential IP.

## Solution — Part 2: Reading progress + pages stat

Goodreads public RSS exposes `user_read_at` (finish date) + `num_pages` per read book, but
**no per-book reading-progress** (current page / %) for currently-reading. So "show progress"
is delivered as a **temporal** reading panel rather than a fake per-book bar.

- **Edit `scripts/update_goodreads.mjs`:**
  - Parse `user_read_at` → `dateRead` (ISO) per book.
  - Paginate the `read` shelf (`?page=N` until empty, cap 5 pages) — future-proof.
  - Sort `recentlyRead` by `dateRead` desc (fallback `dateAdded`).
  - Emit new aggregates: `yearPagesRead`, `yearBooksRead` (books with `dateRead` within the
    trailing 365 days). Keep existing `totalPages` (all-time).

- **Edit `components/GoodreadsCard.jsx`:** add a compact panel above "Currently reading":
  - Eyebrow `reading · past 12 months` (mirrors the training card's `training · 8 weeks`).
  - Big number = `yearPagesRead` + "pages"; sub = "across N books".
  - Progress bar toward the **Harry Potter series** (`HP_SERIES_PAGES = 4100`):
    - ratio < 1 → "N% of the Harry Potter series" (bar = ratio).
    - ratio ≥ 1 → "N.N× the Harry Potter series" (bar capped at 100%).
  - Amber accent (ties to the existing star color + book/paper warmth), dark-mode aware.
  - Benchmark is a single named constant → trivial to swap (e.g., LOTR ≈ 1,178 pp).

**Trailing 12 months** (not calendar year) avoids an empty-looking January.

## Out of scope / follow-ups
- Per-book live progress for currently-reading (no public data source).
- Workflow-failure alerting (optional monitoring; pinning addresses the root cause).

## Verification
- Garmin: run `update_stats.py` locally → `stats.json` shows activities through 2026-05-20.
- Books: run `update_goodreads.mjs` → `goodreads.json` has `yearPagesRead`/`yearBooksRead`.
- `npm run build` succeeds; visual check of the About section in dev.
