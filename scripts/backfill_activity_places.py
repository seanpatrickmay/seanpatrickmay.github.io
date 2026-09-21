# scripts/backfill_activity_places.py
"""
Write public/activity-places.json from the whole Garmin history.

Run this by hand, locally:

    python3 -m pip install -r scripts/requirements-stats.txt
    python3 scripts/backfill_activity_places.py

Why by hand and not in CI: Garmin 429-rate-limits datacenter IPs, so a
GitHub Actions runner cannot page years of activities. It does not need to.
Where you have been running is not news that breaks daily — a snapshot you
refresh occasionally from your own machine is the right shape, and
committing the result means the site never touches the API at build time.

WHAT GETS PUBLISHED, AND WHY IT IS SAFE
---------------------------------------
Garmin returns a start coordinate for every GPS activity, which for almost
every run is the front door of wherever the runner lives. Committing those
would publish a home address at GPS precision with timestamps.

So the coordinates are used here and thrown away: each PLACE gets the median
of its activities' start points, snapped to a COORD_GRID-degree grid (~11km)
before anything is written. One coarse centroid per place, never a per-activity
point. That is no more revealing than the place name beside it, and it is what
makes the map trustworthy — resolving from real GPS is how "Dover" becomes
Dover, Vermont rather than Dover, Delaware, and hand-geocoding 44 place names
would have got several of them wrong.

WHAT GETS EXCLUDED
------------------
Virtual rides. Zwift reports its virtual world's coordinates, and Garmin
reverse-geocodes them into real place names: Zwift London becomes "City of
Westminster" and "Tower Hamlets", Yorkshire becomes "Harrogate", Scotland
becomes "North Ayrshire", and Watopia sits at 0,0 which resolves to "Thio".
Six places on this map were trainer rides in a bedroom. Claiming them as
travel would be a straightforward lie, so anything with "virtual" in its
type key is dropped, along with a 0,0 guard for whatever else reports no fix.

Indoor activities are excluded for free: Garmin gives them no locationName.
Of 1751 activities, 553 are located, and every one of those carries a real
GPS polyline.

Environment variables: the same ones scripts/update_stats.py uses. Auth is
imported from it so there is one login path, not two.
"""

from __future__ import annotations

import json
import re
import statistics
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

sys.path.insert(0, str(Path(__file__).resolve().parent))

from update_stats import get_client  # noqa: E402  (after the sys.path fix)

OUT_PATH = Path("public/activity-places.json")
PAGE_SIZE = 100
# Generous because this runs once, by hand, not on every build.
MAX_ACTIVITIES = 20000

# Degrees to snap each place's centroid to. 0.1 deg is about 11km north-south,
# which is coarser than every place name on the map already is.
COORD_GRID = 0.1

# Trainer and simulator activities masquerading as places. See the header.
VIRTUAL_TYPE = re.compile(r"virtual", re.I)
# Not an activity — Garmin's crash detection files one of these.
NON_ACTIVITY_TYPES = {"incident_detected"}

# Coarse sport families, matched against Garmin's type key so a type this
# script has never seen still lands somewhere sensible. Order matters:
# "skate_skiing" must reach the ski rule before the skate one.
SPORT_FAMILIES: List[tuple] = [
    (re.compile(r"ski|snowboard"), "ski"),
    (re.compile(r"snowshoe"), "snowshoe"),
    (re.compile(r"hik"), "hike"),
    (re.compile(r"run"), "run"),
    (re.compile(r"cycl|bik"), "bike"),
    (re.compile(r"swim"), "swim"),
    (re.compile(r"walk"), "walk"),
    (re.compile(r"kayak|canoe|paddl"), "paddle"),
    (re.compile(r"row"), "row"),
    (re.compile(r"climb|boulder"), "climb"),
    (re.compile(r"skat"), "skate"),
    (re.compile(r"surf"), "surf"),
    (re.compile(r"sail"), "sail"),
]


def sport_family(type_key: Optional[str]) -> str:
    key = type_key or ""
    for pattern, family in SPORT_FAMILIES:
        if pattern.search(key):
            return family
    return key or "other"


def snap(value: float) -> float:
    return round(round(value / COORD_GRID) * COORD_GRID, 1)


def is_usable(activity: Dict[str, Any]) -> bool:
    type_key = (activity.get("activityType") or {}).get("typeKey") or ""
    if VIRTUAL_TYPE.search(type_key) or type_key in NON_ACTIVITY_TYPES:
        return False
    if not activity.get("locationName"):
        return False
    lat, lon = activity.get("startLatitude"), activity.get("startLongitude")
    if lat is None or lon is None:
        return False
    # Null Island: anything without a real fix.
    return not (abs(lat) < 0.01 and abs(lon) < 0.01)


def fetch_all(client) -> List[Dict[str, Any]]:
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
    print(f"Fetched {len(activities)} activities.")

    places: Dict[str, Dict[str, Any]] = {}
    skipped_virtual = 0

    for activity in activities:
        type_key = (activity.get("activityType") or {}).get("typeKey") or ""
        if VIRTUAL_TYPE.search(type_key) or type_key in NON_ACTIVITY_TYPES:
            skipped_virtual += 1
            continue
        if not is_usable(activity):
            continue

        name = activity["locationName"]
        entry = places.setdefault(
            name,
            {"place": name, "count": 0, "distance_km": 0.0, "sports": {},
             "first": None, "last": None, "_lats": [], "_lons": []},
        )
        entry["count"] += 1
        entry["distance_km"] += (activity.get("distance") or 0) / 1000.0
        family = sport_family(type_key)
        entry["sports"][family] = entry["sports"].get(family, 0) + 1
        entry["_lats"].append(activity["startLatitude"])
        entry["_lons"].append(activity["startLongitude"])

        day = (activity.get("startTimeLocal") or "")[:10]
        if day:
            if not entry["first"] or day < entry["first"]:
                entry["first"] = day
            if not entry["last"] or day > entry["last"]:
                entry["last"] = day

    # Median, then snapped: the raw values stop here and never reach the file.
    ordered = sorted(
        (
            {
                "place": e["place"],
                "lat": snap(statistics.median(e["_lats"])),
                "lon": snap(statistics.median(e["_lons"])),
                "count": e["count"],
                "distance_km": round(e["distance_km"], 1),
                "sports": dict(sorted(e["sports"].items(), key=lambda kv: -kv[1])),
                "first": e["first"],
                "last": e["last"],
            }
            for e in places.values()
        ),
        key=lambda e: (-e["count"], e["place"]),
    )

    placed = sum(e["count"] for e in ordered)
    payload = {
        "source": "full-history",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "note": (
            "Full Garmin history. Each place's coordinate is the median of its "
            f"activities' start points, snapped to a {COORD_GRID} degree grid; no "
            "per-activity coordinate is published. Virtual/trainer rides are excluded."
        ),
        "activities_considered": len(activities),
        "activities_placed": placed,
        "coord_grid_deg": COORD_GRID,
        "places": ordered,
    }

    OUT_PATH.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"\nWrote {OUT_PATH.resolve()}")
    print(f"  {len(ordered)} places from {placed}/{len(activities)} activities")
    print(f"  {skipped_virtual} virtual/non-activity records excluded")
    print()
    for entry in ordered:
        sports = " ".join(f"{k}:{v}" for k, v in entry["sports"].items())
        print(f"  {entry['count']:>4}  {entry['place']:<22} "
              f"[{entry['lat']:>6}, {entry['lon']:>7}]  {sports}")


if __name__ == "__main__":
    main()
