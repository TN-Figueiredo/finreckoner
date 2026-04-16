// src/lib/site-config.ts
// IMMUTABLE: launchedAt is locked at sprint S0 close. CI guards against unauthorized edits.
// To edit launchedAt, add the 'allow-launch-date-edit' label to the PR.

import { ENV } from '@/env'

export const SITE_CONFIG = {
  launchedAt: '2026-04-29',
  deployedAt: ENV.VERCEL_GIT_COMMIT_SHA
    ? new Date().toISOString()
    : 'dev',
  url: 'https://finreckoner.com',
  siteName: 'finreckoner',
  defaultLocales: ['en-US', 'en-CA'] as const,
  defaultOgImage: 'https://finreckoner.com/og/default.png',
  author: {
    name: 'Thiago Figueiredo',
    url: '/about',
  },
  organization: {
    name: 'finreckoner',
    logoUrl: 'https://finreckoner.com/logo.png',
    sameAs: [] as string[],
  },
} as const
