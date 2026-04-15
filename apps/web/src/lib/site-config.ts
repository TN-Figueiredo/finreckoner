// src/lib/site-config.ts
// IMMUTABLE: launchedAt is locked at sprint S0 close. CI guards against unauthorized edits.
// To edit, add the 'allow-launch-date-edit' label to the PR.

export const SITE_CONFIG = {
  launchedAt: '2026-04-29',
  deployedAt: process.env.VERCEL_GIT_COMMIT_SHA
    ? new Date().toISOString()
    : 'dev',
  url: 'https://finreckoner.com',
  defaultLocales: ['en-US', 'en-CA'] as const,
} as const
