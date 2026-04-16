#!/usr/bin/env bash
# Guard SITE_CONFIG.launchedAt against unauthorized edits.
# Compares the VALUE (not just the line presence) between base branch and HEAD,
# so reformatting or adding adjacent fields does not trigger a false positive.
# Escape hatch: PR label `allow-launch-date-edit`.

set -euo pipefail
[ "${GITHUB_EVENT_NAME:-}" = "pull_request" ] || { echo "Not a PR; skipping."; exit 0; }

FILE='apps/web/src/lib/site-config.ts'

# Extract `launchedAt: 'YYYY-MM-DD'` value from a given git ref (empty if field missing).
extract_value() {
  local ref="$1"
  git show "${ref}:${FILE}" 2>/dev/null \
    | grep -oE "launchedAt:\\s*'[^']+'" \
    | head -1 \
    | sed -E "s/launchedAt:[[:space:]]*'([^']+)'/\\1/"
}

BEFORE=$(extract_value "origin/${GITHUB_BASE_REF:-main}" || true)
AFTER=$(extract_value "HEAD" || true)

if [ "$BEFORE" = "$AFTER" ]; then
  echo "Site config immutability OK. launchedAt unchanged (${AFTER:-<absent>})."
  exit 0
fi

LABELS=$(jq -r '.pull_request.labels[].name' < "${GITHUB_EVENT_PATH:-/dev/null}" 2>/dev/null || echo "")
if echo "$LABELS" | grep -q "allow-launch-date-edit"; then
  echo "launchedAt changed '${BEFORE}' → '${AFTER}' (approved by label)."
  exit 0
fi

echo "::error::SITE_CONFIG.launchedAt changed '${BEFORE}' → '${AFTER}' without 'allow-launch-date-edit' label."
exit 1
