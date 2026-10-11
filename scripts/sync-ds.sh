#!/bin/sh
# Copies the Rough Draft design system into vendor/ so the app builds on its own.
# Run after changing the design system:  npm run sync-ds  (expects ../rough-draft-ds)
set -e
SRC="${1:-../rough-draft-ds}"
DEST="vendor/rough-draft-ds"
[ -d "$SRC/components" ] || { echo "design system not found at $SRC"; exit 1; }
(cd "$SRC" && npm run tokens >/dev/null)
rm -rf "$DEST"
mkdir -p "$DEST/design-tokens"
cp -R "$SRC/components" "$DEST/components"
cp -R "$SRC/design-tokens/build" "$DEST/design-tokens/build"
rm -f "$DEST/components/README.md"
REV=$(cd "$SRC" && git rev-parse --short HEAD 2>/dev/null || echo unknown)
printf 'Vendored from rough-draft-ds @ %s on %s. Do not edit here; edit the design system and run `npm run sync-ds`.\n' "$REV" "$(date +%Y-%m-%d)" > "$DEST/VERSION"
echo "synced design system @ $REV"
