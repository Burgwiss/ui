#!/usr/bin/env bash
# Cut a release tag that carries the built `dist/`.
#
#   bash scripts/release.sh            # tags the version in package.json
#
# Apps install from a git tag, and Burgwiss runs npm with ignore-scripts
# (a supply-chain guard), so the package's `prepare` build never runs there.
# The tag therefore points at a commit that has `dist/` in it: a commit made
# on top of main for the tag only, so main itself stays free of build output.
set -euo pipefail
cd "$(dirname "$0")/.."

version="v$(node -p "require('./package.json').version")"
if [ -n "$(git status --porcelain)" ]; then
    echo "working tree not clean" >&2
    exit 1
fi
if git rev-parse -q --verify "refs/tags/$version" >/dev/null; then
    echo "$version already exists; bump the version in package.json first" >&2
    exit 1
fi

base="$(git rev-parse HEAD)"
npm run build
git checkout -q --detach
git add -f dist
git commit -q -m "release: $version (built dist)"
git tag -a "$version" -m "$version"
git checkout -q -
git push origin "$version"
echo "tagged $version on top of ${base:0:7}: install with github:Burgwiss/ui#$version"
