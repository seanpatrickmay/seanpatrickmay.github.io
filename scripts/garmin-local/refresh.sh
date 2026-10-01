#!/bin/bash
# Refresh public/stats.json from this Mac, run by launchd (com.seanmay.garmin-refresh).
#
# Garmin 429s the OAuth1 -> OAuth2 token exchange from GitHub's runner IPs, so
# the CI job could only ever survive the ~day an OAuth2 token lasts after a
# manual reseed. From a home IP the exchange goes through, so the cached tokens
# in ~/.garminconnect keep rotating on their own.
#
# Works in its own clone so it never touches the checkout you're editing in.
# Installed (copied) by install.sh; re-run that after changing this file.
#
# Reseed, if Garmin ever invalidates the tokens (prompts for MFA if needed):
#   GARMIN_ALLOW_FRESH_LOGIN=1 GARMIN_EMAIL=... GARMIN_PASSWORD=... ~/.local/share/garmin-refresh/refresh.sh
set -euo pipefail

ROOT="$HOME/.local/share/garmin-refresh"
REPO="$ROOT/repo"
PY="$ROOT/venv/bin/python3"

notify() {
  osascript -e "display notification \"$1\" with title \"Garmin refresh\"" >/dev/null 2>&1 || true
}
trap 'rc=$?; [ "$rc" -eq 0 ] || notify "Failed (exit $rc) - see ~/Library/Logs/garmin-refresh.log"' EXIT

echo "=== $(date '+%Y-%m-%d %H:%M:%S %Z')"
cd "$REPO"

# Nothing local is worth keeping here: a previous run either pushed or failed.
git fetch --quiet origin main
git reset --quiet --hard origin/main

# Requirements are pinned; this is a no-op unless the pins move.
"$PY" -m pip install --quiet --disable-pip-version-check -r scripts/requirements-stats.txt

GARMIN_OUT=public/stats.json "$PY" scripts/update_stats.py

if [[ -z "$(git status --porcelain public/stats.json)" ]]; then
  echo "No changes to commit."
  exit 0
fi

git add public/stats.json
git commit --quiet -m "chore(stats): daily refresh"

# The other feeds push from CI around the same time; rebase over them.
for attempt in 1 2 3; do
  if git push --quiet origin HEAD:main; then
    echo "Pushed $(git rev-parse --short HEAD)."
    exit 0
  fi
  echo "Push rejected (attempt $attempt/3), rebasing..."
  git pull --quiet --rebase origin main
done
exit 1
