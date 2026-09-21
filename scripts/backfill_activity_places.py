# scripts/backfill_activity_places.py
"""
Write public/activity-places.json from the whole Garmin history.

Run this by hand, locally:

    python3 -m pip install -r scripts/requirements-stats.txt
    python3 scripts/backfill_activity_places.py

Why by hand, and not in CI: Garmin 429-rate-limits datacenter IPs, so a
GitHub Actions runner cannot page years of activities. It does not need to.
Where you have been running is not news that breaks daily — a snapshot you
refresh occasionally from your own machine is the right shape for it, and
committing the result means the site never depends on the API at build time.

Between runs, scripts/build_activity_places.mjs keeps the file current from
the rolling window already in public/stats.json. This script marks its output
source="full-history", which tells that script to leave it alone rather than
trimming years back to a few months.

WHAT THIS DELIBERATELY DOES NOT READ
------------------------------------
Garmin returns startLatitude/startLongitude on every activity. This script
ignores them, and nothing here ever writes a coordinate.

The start coordinate of a run is, for almost every run, the front door of
wherever the runner lives. Committing years of those to a public repository
publishes a home address, at GPS precision, with timestamps. Instead this
reads the activity NAME, which Garmin has already composed as
"<Place> <Type>" from its own reverse geocoder at city or county
granularity — "Henrico County Running". That is the granularity the map
draws at anyway, so the precise version buys nothing and costs a lot.

Environment variables: the same ones scripts/update_stats.py uses; auth is
imported from it so there is one login path, not two.
"""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional

sys.path.insert(0, str(Path(__file__).resolve().parent))

from update_stats import get_client  # noqa: E402  (after sys.path fix)

OUT_PATH = Path("public/activity-places.json")
PAGE_SIZE = 100
# Garmin's own cap on how far back a single paging run is worth pushing. Set
# high because this runs once, by hand, not on every build.
MAX_ACTIVITIES = 20000

# Longest suffix first: "Open Water Swimming" must match before "Swimming".
# Mirrors TYPE_SUFFIXES in scripts/build_activity_places.mjs; the two
# producers have to agree or the file's shape changes depending on who wrote
# it last.
TYPE_SUFFIXES = [
    ("Open Water Swimming", "swim"),
    ("Trail Running", "run"),
    ("Mountain Biking", "bike"),
    ("Running", "run"),
    ("Cycling", "bike"),
    ("Swimming", "swim"),
    ("Hiking", "hike"),
    ("Walking", "walk"),
    ("Rowing", "row"),
]

INDOOR_WORDS = re.compile(
    r"\b(indoor|treadmill|elliptical|virtual|stationary|pool|gym|stair)\b", re.I
)


def parse_activity_name(name: Optional[str]) -> Optional[Dict[str, str]]:
    """Split "<Place> <Type>" into place and sport, or None when there is no place."""
    trimmed = (name or "").strip()
    if not trimmed:
        return None
    lowered = trimmed.lower()
    for suffix, sport in TYPE_SUFFIXES:
        if not lowered.endswith(suffix.lower()):
            continue
        place = trimmed[: len(trimmed) - len(suffix)].strip()
        if not place or INDOOR_WORDS.search(place):
            return None
        return {"place": place, "sport": sport}
    return None


def fetch_all(client) -> List[Dict[str, Any]]:
    """Page until Garmin runs out of activities."""
    out: List[Dict[str, Any]] = []
    start = 0
    while start < MAX_ACTIVITIES:
        batch = client.get_activities(start, PAGE_SIZE)
        if not batch:
            break
        out.extend(batch)
        start += len(batch)
        print(f"  fetched {len(out)} activities...", flush=True)
        if len(batch) < PAGE_SIZE:
            break
    return out


def main() -> None:
    client = get_client()
    activities = fetch_all(client)
    print(f"Fetched {len(activities)} activities in total.")

    places: Dict[str, Dict[str, Any]] = {}
    for activity in activities:
        parsed = parse_activity_name(activity.get("activityName"))
        if not parsed:
            continue

        entry = places.setdefault(
            parsed["place"],
            {
                "place": parsed["place"],
                "count": 0,
                "distance_km": 0.0,
                "sports": defaultdict(int),
                "first": None,
                "last": None,
            },
        )
        entry["count"] += 1
        entry["sports"][parsed["sport"]] += 1
        entry["distance_km"] += (activity.get("distance") or 0) / 1000.0

        day = (activity.get("startTimeLocal") or "")[:10]
        if day:
            if not entry["first"] or day < entry["first"]:
                entry["first"] = day
            if not entry["last"] or day > entry["last"]:
                entry["last"] = day

    ordered = sorted(
        (
            {**e, "sports": dict(e["sports"]), "distance_km": round(e["distance_km"], 1)}
            for e in places.values()
        ),
        key=lambda e: (-e["count"], e["place"]),
    )

    payload = {
        "source": "full-history",
        "generated_at": __import__("datetime").datetime.now(
            __import__("datetime").timezone.utc
        ).isoformat(),
        "note": "Full Garmin history, by activity name. No coordinates are read or written.",
        "activities_considered": len(activities),
        "activities_placed": sum(e["count"] for e in ordered),
        "places": ordered,
    }

    OUT_PATH.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"\nWrote {OUT_PATH.resolve()}")
    print(f"  {len(ordered)} places from {payload['activities_placed']}/{len(activities)} activities")
    print("\nPlaces found — add any missing ones to ACTIVITY_PLACE_KEYS and")
    print("COORDINATES in lib/mapData.js, or they will not be plotted:\n")
    for entry in ordered:
        sports = " ".join(f"{k}:{v}" for k, v in sorted(entry["sports"].items()))
        print(f"  {entry['count']:>5}  {entry['place']:<28} {sports}")


if __name__ == "__main__":
    main()
