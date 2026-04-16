# Wave 3 publish runbook — S0 hygiene cascade

**Purpose:** Publish the 5 packages produced by the S0 hygiene wave to GitHub
Packages registry, then unblock `finreckoner` CI.

**Target date:** 2026-04-22 (per ADR 005). Hard escalation: 2026-04-29.

**Prerequisites (do these BEFORE step 1):**

- [ ] Resolve `tnf-ecosystem` local `main` vs `origin/main` divergence
      (29 local WIP commits in admin/support/fraud-detection vs 34 remote
      commits incl. Sprint 0). Decide: rebase WIP onto origin/main, or land
      WIP first then rebase s0-hygiene branch on top.
- [ ] Verify `NPM_TOKEN` secret is valid in
      `github.com/TN-Figueiredo/tnf-ecosystem` Actions secrets
      (`gh secret list --repo TN-Figueiredo/tnf-ecosystem` to confirm).
- [ ] Confirm `npm whoami --registry=https://npm.pkg.github.com` works
      locally (otherwise `npm publish` will fail with 401).
- [ ] Read each package's CHANGELOG `## 0.2.0 — 2026-04-15` (or `## 0.1.0`
      for ymyl-ui) entry to confirm scope.

## Sequence

### Step 1 — Open ecosystem PR

The `s0-hygiene` branch in worktree
`~/Workspace/tnf-ecosystem-s0-hygiene/` should already be committed with all
five package changes. Push and open PR:

```bash
cd ~/Workspace/tnf-ecosystem-s0-hygiene
git push origin s0-hygiene
gh pr create \
  --base main \
  --head s0-hygiene \
  --title "feat(s0-hygiene): ymyl-ui@0.1.0 NEW + lgpd/seo/calc-engine/partner-links 0.2.0" \
  --body-file ../finreckoner/docs/runbooks/wave-3-publish-pr-body.md
```

(If the PR-body file does not exist, paste the per-package summary from the
five `CHANGELOG.md` 0.2.0 / 0.1.0 entries.)

### Step 2 — Review + merge

- [ ] Self-review the diff on GitHub UI. Pay attention to:
  - `packages/ymyl-ui/` (NEW package — verify backward compat is moot, but
    verify `name`, `version`, `repository.directory` field correct)
  - `packages/lgpd/package.json` — version bumped to `0.2.0`, new exports
  - `packages/seo/package.json` — version bumped to `0.2.0`, new exports
  - `packages/calc-engine/package.json` — version bumped to `0.2.0`
  - `packages/partner-links/package.json` — version bumped to `0.2.0`
  - Root `package.json` — `overrides` block added (react/react-dom 19.2.5)
- [ ] CI green (turbo build + test across all 5 packages). All 470 tests
      should pass.
- [ ] Squash-merge or merge-commit per ecosystem convention.

### Step 3 — Publish each package (in dependency order)

Publish order matters because some packages depend on others:

```bash
# After PR merged, on main:
cd ~/Workspace/tnf-ecosystem
git checkout main && git pull
npm install --legacy-peer-deps   # honors the new overrides

# Publish in this order (least-dependent first):
for pkg in calc-engine partner-links seo lgpd ymyl-ui; do
  cd packages/$pkg
  npm run build
  npm test
  npm publish
  cd ../..
done
```

Tag each publish:

```bash
git tag calc-engine-v0.2.0
git tag partner-links-v0.2.0
git tag seo-v0.2.0
git tag lgpd-v0.2.0
git tag ymyl-ui-v0.1.0
git push --tags
```

### Step 4 — Cascade smoke-test

```bash
cd ~/Workspace/finreckoner/apps/web
rm -rf node_modules
npm install   # should now resolve 0.2.0 packages + ymyl-ui@0.1.0
npm run typecheck
npm test
npm run build
```

If all green, push the cascade-verify commit to `finreckoner/main`:

```bash
cd ~/Workspace/finreckoner
git tag s0-hygiene-cascade-complete
git push origin main --tags
```

### Step 5 — Update other consumers (if any)

Per ecosystem CLAUDE.md, consumers (TNG, MEISimples, fan-stamp,
bythiagofigueiredo) pin exact versions. Decide per-consumer whether to bump:

- **finreckoner** — bumps now (this sprint).
- **TNG (tonagarantia)** — only consumes `seo` and `shared`. Bump `seo` to
  0.2.0 if any locale/hreflang changes are needed; otherwise defer.
- **bythiagofigueiredo** — consumes `seo`, `lgpd`. Bump if compliance pages
  needed; otherwise defer (cms package extraction is its own work).
- **MEISimples** — N/A in this wave.
- **fan-stamp** — N/A in this wave.

If bumping a consumer:

```bash
cd ~/Workspace/<consumer>
./scripts/upgrade-ecosystem.sh @tn-figueiredo/<package> 0.2.0
```

## Rollback (if Step 3 fails mid-publish)

GitHub Packages does **not** support unpublishing within 72h via the API
without admin intervention. If a publish fails partway:

1. Identify which packages succeeded (check
   `https://github.com/orgs/TN-Figueiredo/packages`).
2. Bump the failed packages' versions (e.g., `0.2.0` → `0.2.1`) and
   re-publish — never attempt to overwrite `0.2.0`.
3. Update consumer pins to `0.2.1` for those packages.
4. Document the incident in `docs/incidents/2026-04-XX-publish-rollback.md`.

## Watch dashboard

Per ADR 005:

| Date | Status | Notes |
|------|--------|-------|
| 2026-04-19 | First reminder | Begin verifying prerequisites checklist |
| 2026-04-22 | Target publish | All 5 packages live |
| 2026-04-26 | Soft escalation | If still pending, post note in finreckoner README + consider fallback inline |
| 2026-04-29 | Hard escalation = S1 G0 | If publish missing, S1 starts with inline ymyl-ui + ADR 006 documenting the technical debt |

## Acceptance criteria for "Wave 3 done"

- [ ] All 5 packages live on GitHub Packages at the expected versions
- [ ] All 5 git tags pushed
- [ ] `finreckoner` `npm install` succeeds with no peer warnings
- [ ] `finreckoner` typecheck + test + build all green
- [ ] `finreckoner` tag `s0-hygiene-cascade-complete` pushed
- [ ] ADR 005 updated with `Status: Decided` + actual publish date
- [ ] If consumers bumped: each consumer's CI green
