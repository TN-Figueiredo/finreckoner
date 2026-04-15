#!/usr/bin/env bash
set -euo pipefail
# Fail if any @tn-figueiredo/* dep uses ^ or ~ in any package.json
FOUND=$(grep -rEn '"@tn-figueiredo/[^"]+":\s*"[\^~]' --include=package.json . || true)
if [ -n "$FOUND" ]; then
  echo "::error::Ecosystem packages must be pinned (no ^/~). Found:"
  echo "$FOUND"
  exit 1
fi
echo "Ecosystem pinning OK."
