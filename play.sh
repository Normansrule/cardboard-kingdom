#!/usr/bin/env bash
# Cardboard Kingdom launcher for Linux (and macOS).
# Opens the game in your web browser. No install, no internet needed.
cd "$(dirname "$0")"
GAME="$PWD/index.html"
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$GAME" >/dev/null 2>&1 &
elif command -v open >/dev/null 2>&1; then
  open "$GAME"
elif command -v python3 >/dev/null 2>&1; then
  echo "No browser launcher found. Serving at http://localhost:8000 (Ctrl+C to stop)"
  python3 -m http.server 8000
else
  echo "Open this file in any web browser: $GAME"
fi
