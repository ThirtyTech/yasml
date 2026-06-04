#!/usr/bin/env bash
#
# Build and publish all yasml packages to npm.
# Skips any package whose local version is already published.
#
# Dry run by default — prints what would be published without touching the
# registry. Pass --publish (or --yes/-y) to actually publish.
#
# Order matters: eslint-plugin is published before codegen (vite-plugin),
# since codegen peer-depends on it.

set -euo pipefail

# Package directories, in publish order. "." is the repo root (@thirtytech/yasml).
PACKAGES=(eslint codegen .)

# Dry run is the default. Pass --publish (or --yes/-y) to actually publish.
DRY_RUN=true
case "${1:-}" in
  --publish | --yes | -y) DRY_RUN=false ;;
esac

root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

published=0
skipped=0

for dir in "${PACKAGES[@]}"; do
  pkg_dir="$root/$dir"
  name="$(jq -r .name "$pkg_dir/package.json")"
  version="$(jq -r .version "$pkg_dir/package.json")"

  echo "==> $name@$version ($dir)"

  # Is this exact version already on the registry?
  # `npm view` prints the version if it exists, errors/empty otherwise.
  existing="$(npm view "$name@$version" version 2>/dev/null || true)"

  if [[ "$existing" == "$version" ]]; then
    echo "    already published, skipping."
    skipped=$((skipped + 1))
    continue
  fi

  echo "    building..."
  ( cd "$pkg_dir" && npm run build )

  if $DRY_RUN; then
    echo "    [dry-run] would publish:"
    ( cd "$pkg_dir" && npm publish --dry-run )
  else
    echo "    publishing..."
    ( cd "$pkg_dir" && npm publish )
    published=$((published + 1))
  fi
done

echo
if $DRY_RUN; then
  echo "Dry run complete. $skipped already-published, the rest would publish."
  echo "Re-run with --publish to publish for real."
else
  echo "Done. Published $published, skipped $skipped."
fi
