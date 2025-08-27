# scripts/update_stats.py
"""
Fetch Garmin data and write public/stats.json for your site.

Environment variables:
  GARMIN_EMAIL         your Garmin account email (only needed for first login)
  GARMIN_PASSWORD      your Garmin account password (only needed for first login)
  GARMIN_TOKENS_DIR    where to cache tokens (default: ~/.garminconnect)
  GARMIN_OUT           output path for stats.json (default: public/stats.json)

First run (to seed tokens, especially if MFA is enabled):
  python -m pip install garminconnect
  GARMIN_EMAIL="you@example.com" GARMIN_PASSWORD="..." python scripts/update_stats.py

Subsequent runs (CI/cron) reuse cached tokens and won’t need credentials.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from datetime import date, datetime, timedelta, timezone
from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple

from garminconnect import Garmin

# --------------------------- Configuration -----------------------------------


EMAIL = os.getenv("GARMIN_EMAIL")
PASSWORD = os.getenv("GARMIN_PASSWORD")
TOKENS_DIR = Path(os.getenv("GARMIN_TOKENS_DIR", str(Path.home() / ".garminconnect")))
OUT_PATH = Path(os.getenv("GARMIN_OUT", "public/stats.json"))

# How much history for weekly series (in weeks):
WEEKLY_WINDOW = 12
# Monthly window for totals (in days):
MONTHLY_WINDOW_DAYS = 30
# How many recent activities to include:
RECENT_COUNT = 3
# How many activities to fetch from Garmin (increase if you’re very active):
FETCH_LIMIT = 200


# ---------------------------- Helpers ----------------------------------------

def get_client() -> Garmin:
    """
    Create a Garmin client using cached tokens if possible.
    If tokens are missing/invalid, try a fresh login (may require MFA).
    """
    g = Garmin()
    # 1) Try cached tokens first
    try:
        g.garth.load(TOKENS_DIR)
        # Light call to validate tokens
        g.get_user_profile()
        return g
    except Exception:
        pass

    # 2) Fresh login (interactive MFA cannot be completed non-interactively)
    if not EMAIL or not PASSWORD:
        raise SystemExit(
            "GARMIN_EMAIL / GARMIN_PASSWORD not set and no cached tokens available.\n"
            "Run locally once with credentials to seed tokens (and pass MFA if prompted)."
        )

    g = Garmin(email=EMAIL, password=PASSWORD, return_on_mfa=True)
    res1, res2 = g.login()
    if res1 == "needs_mfa":
        raise SystemExit(
            "MFA required. Run this script locally once to complete MFA and seed tokens.\n"
            f"Tokens will be saved in: {TOKENS_DIR}"
        )
    g.garth.dump(TOKENS_DIR)
    return g


def parse_dt(s: Optional[str]) -> Optional[datetime]:
    """
    Parse various Garmin date string formats into an aware UTC datetime.
    Examples observed: '2025-08-18 17:12:07', '2025-08-18T17:12:07Z'
    """
    if not s:
        return None
    s = s.replace("T", " ").replace("Z", "")
    for fmt in ("%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(s[:26], fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def meters(a: Dict[str, Any]) -> float:
    return float(
        a.get("distance")
        or a.get("summaryDTO", {}).get("distance")
        or 0.0
    )


def seconds(a: Dict[str, Any]) -> float:
    return float(
        a.get("duration")
        or a.get("summaryDTO", {}).get("duration")
        or 0.0
    )


def activity_type(a: Dict[str, Any]) -> Optional[str]:
    t = a.get("activityType")
    if isinstance(t, dict):
        return t.get("typeKey")
    return t


def week_key(dt: datetime) -> Tuple[str, str]:
    """
    Return (monday_date, sunday_date) as ISO strings for the week of dt (UTC),
    with Monday as the first day of week.
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    monday = dt - timedelta(days=dt.weekday())
    monday = datetime(monday.year, monday.month, monday.day, tzinfo=timezone.utc)
    sunday = monday + timedelta(days=6)
    return monday.date().isoformat(), sunday.date().isoformat()


# ---------------------------- Main -------------------------------------------

def main() -> None:
    client = get_client()

    today = date.today()
    today_dt = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    start_month = today_dt - timedelta(days=MONTHLY_WINDOW_DAYS)
    cutoff_weekly = today_dt - timedelta(weeks=WEEKLY_WINDOW)

    # Profile
    profile = client.get_user_profile() or {}

    # Get a window of activities
    activities: List[Dict[str, Any]] = client.get_activities(0, FETCH_LIMIT)

    # ----- Monthly window aggregates (distance, time, count, longest)
    last30: List[Dict[str, Any]] = []
    for a in activities:
        start = parse_dt(a.get("startTimeLocal") or a.get("startTimeGMT"))
        if start and start >= start_month:
            last30.append(a)

    total_m = sum(meters(a) for a in last30)
    total_s = sum(seconds(a) for a in last30)
    monthly = {
        "window_days": MONTHLY_WINDOW_DAYS,
        "activities_count": len(last30),
        "distance_km": round(total_m / 1000.0, 2),
        "distance_mi": round(total_m / 1609.344, 2),
        "time_hours": round(total_s / 3600.0, 2),
        "longest_km": round(max([meters(a) for a in last30] + [0.0]) / 1000.0, 2),
        "longest_mi": round(max([meters(a) for a in last30] + [0.0]) / 1609.344, 2),
    }

    # ----- Last 3 activities
    def start_key(a: Dict[str, Any]) -> datetime:
        d = parse_dt(a.get("startTimeLocal") or a.get("startTimeGMT"))
        return d or datetime.min.replace(tzinfo=timezone.utc)

    activities_sorted = sorted(activities, key=start_key, reverse=True)
    last3 = activities_sorted[:RECENT_COUNT]

    recent_last3 = []
    for a in last3:
        m = meters(a)
        dur = seconds(a)
        recent_last3.append({
            "id": a.get("activityId"),
            "name": a.get("activityName"),
            "type": activity_type(a),
            "start": a.get("startTimeLocal") or a.get("startTimeGMT"),
            "distance_km": round(m / 1000.0, 2),
            "distance_mi": round(m / 1609.344, 2),
            "duration_min": round(dur / 60.0, 1),
            "avg_speed_kmh": round((m / 1000.0) / (dur / 3600.0), 2) if dur > 0 else None,
        })

    # ----- Weekly aggregates (last N weeks)
    weekly = defaultdict(lambda: {"meters": 0.0, "seconds": 0.0})
    for a in activities:
        start = parse_dt(a.get("startTimeLocal") or a.get("startTimeGMT"))
        if not start or start < cutoff_weekly:
            continue
        wk = week_key(start)
        weekly[wk]["meters"] += meters(a)
        weekly[wk]["seconds"] += seconds(a)

    weekly_rows: List[Dict[str, Any]] = []
    for wk in sorted(weekly.keys()):
        m = weekly[wk]["meters"]
        s = weekly[wk]["seconds"]
        weekly_rows.append({
            "week_start": wk[0],
            "week_end": wk[1],
            "distance_km": round(m / 1000.0, 2),
            "distance_mi": round(m / 1609.344, 2),
            "time_hours": round(s / 3600.0, 2),
        })

    # ----- Payload
    data = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "profile": {
            "displayName": profile.get("displayName"),
            "fullName": profile.get("fullName"),
            "userId": profile.get("userId"),
        },
        "monthly": monthly,
        "recent": {"last3": recent_last3},
        "weekly": {
            "window_weeks": WEEKLY_WINDOW,
            "series": weekly_rows  # chronological (oldest -> newest)
        },
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Wrote {OUT_PATH.resolve()}")


if __name__ == "__main__":
    main()
