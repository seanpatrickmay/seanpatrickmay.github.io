#!/bin/bash
# Install (or update) the launchd job that refreshes Garmin stats from this Mac.
# Idempotent: safe to re-run after editing refresh.sh.
#
# Everything lives outside ~/Desktop on purpose — macOS privacy protection stops
# launchd agents from reading Desktop/Documents without Full Disk Access.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$HOME/.local/share/garmin-refresh"
REPO="$ROOT/repo"
LABEL="com.seanmay.garmin-refresh"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/garmin-refresh.log"
REMOTE="$(git -C "$HERE" remote get-url origin)"

mkdir -p "$ROOT" "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"

if [ ! -d "$REPO/.git" ]; then
  git clone --quiet "$REMOTE" "$REPO"
fi
git -C "$REPO" config user.email "sean.may101@gmail.com"

if [ ! -x "$ROOT/venv/bin/python3" ]; then
  /Library/Frameworks/Python.framework/Versions/3.12/bin/python3 -m venv "$ROOT/venv"
fi
"$ROOT/venv/bin/python3" -m pip install --quiet --disable-pip-version-check -r "$REPO/scripts/requirements-stats.txt"

install -m 755 "$HERE/refresh.sh" "$ROOT/refresh.sh"

# 09:23 and 21:23. A run missed while the Mac sleeps fires on wake, so twice a
# day keeps a stretch of closed-lid days from leaving the page stale.
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$ROOT/refresh.sh</string>
    </array>

    <key>StartCalendarInterval</key>
    <array>
        <dict>
            <key>Hour</key><integer>9</integer>
            <key>Minute</key><integer>23</integer>
        </dict>
        <dict>
            <key>Hour</key><integer>21</integer>
            <key>Minute</key><integer>23</integer>
        </dict>
    </array>

    <key>RunAtLoad</key>
    <false/>

    <key>StandardOutPath</key>
    <string>$LOG</string>

    <key>StandardErrorPath</key>
    <string>$LOG</string>

    <key>WorkingDirectory</key>
    <string>$ROOT</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Installed $LABEL. Run now with: launchctl kickstart gui/$(id -u)/$LABEL"
