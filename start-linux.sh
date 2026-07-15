#!/usr/bin/env sh
set -e
cd "$(dirname "$0")"
SERVE_DIR="."
if command -v node >/dev/null 2>&1 && [ -f package.json ]; then
  npm run build >/dev/null 2>&1 || true
  [ -f dist/index.html ] && SERVE_DIR="dist"
fi
python3 -m http.server 8080 -d "$SERVE_DIR"
