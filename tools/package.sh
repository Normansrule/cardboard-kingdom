#!/usr/bin/env bash
# Build the single-file game and a download-and-play zip in dist/.
# Usage: bash tools/package.sh
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tools/build_single.py
VERSION="$(cat VERSION 2>/dev/null || echo dev)"
NAME="cardboard-kingdom-${VERSION}"
STAGE="dist/${NAME}"
rm -rf "${STAGE}" "dist/${NAME}.zip"
mkdir -p "${STAGE}"
cp -r index.html js play.sh play.bat play.command PLAY.txt "${STAGE}/"
cp dist/cardboard-kingdom.html "${STAGE}/cardboard-kingdom-single-file.html"
chmod +x "${STAGE}/play.sh" "${STAGE}/play.command"
(cd dist && zip -qr "${NAME}.zip" "${NAME}")
rm -rf "${STAGE}"
echo "wrote dist/${NAME}.zip"
