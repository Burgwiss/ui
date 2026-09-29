#!/usr/bin/env bash
# deploy/publish-storybook.sh — build Storybook and put it live on the infra box.
#
#   npm run storybook:publish            # build + upload
#   SKIP_BUILD=1 npm run storybook:publish
#   bash deploy/publish-storybook.sh setup   # first time: install the compose project
#
# Served at https://ui.infra.burgwiss.com (Traefik edge-proxy, Let's Encrypt).
# Needs ssh access to the box as root (same key as `make gate-remote` in burgwiss).
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="${UI_STORYBOOK_HOST:-root@2.29.38.140}"
DIR="${UI_STORYBOOK_DIR:-/opt/ui-storybook}"
URL="https://ui.infra.burgwiss.com"

if [ "${1:-}" = "setup" ]; then
    echo "==> installing compose project at $HOST:$DIR"
    ssh "$HOST" "mkdir -p $DIR/site && [ -f $DIR/site/index.html ] || echo '<h1>@burgwiss/ui — first publish pending</h1>' > $DIR/site/index.html"
    scp deploy/docker-compose.yml "$HOST:$DIR/docker-compose.yml"
    ssh "$HOST" "cd $DIR && docker compose up -d"
    exit 0
fi

if [ "${SKIP_BUILD:-0}" != "1" ]; then
    echo "==> building Storybook"
    npm run storybook:build
fi
[ -f storybook-static/index.html ] || { echo "no storybook-static/index.html — build failed?" >&2; exit 1; }

REV="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
echo "$REV $(date -u +%Y-%m-%dT%H:%M:%SZ)" > storybook-static/version.txt

echo "==> uploading to $HOST:$DIR/site"
# --delete-after: the old files stay servable until the new set is complete.
rsync -az --delete-after storybook-static/ "$HOST:$DIR/site/"
echo "==> live: $URL  (version.txt: $REV)"
