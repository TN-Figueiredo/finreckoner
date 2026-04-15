#!/usr/bin/env bash
set -euo pipefail
[ "${GITHUB_EVENT_NAME:-}" = "pull_request" ] || { echo "Not a PR; skipping."; exit 0; }

DIFF=$(git diff "origin/${GITHUB_BASE_REF:-main}...HEAD" -- 'apps/web/src/lib/site-config.ts' || true)
if echo "$DIFF" | grep -Eq '^\+.*launchedAt'; then
  LABELS=$(jq -r '.pull_request.labels[].name' < "${GITHUB_EVENT_PATH:-/dev/null}" 2>/dev/null || echo "")
  if echo "$LABELS" | grep -q "allow-launch-date-edit"; then
    echo "launchedAt change approved by label."
    exit 0
  fi
  echo "::error::SITE_CONFIG.launchedAt changed without 'allow-launch-date-edit' label."
  exit 1
fi
echo "Site config immutability OK."
