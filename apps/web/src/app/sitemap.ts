// src/app/sitemap.ts
import { SITE_CONFIG } from '@/lib/site-config'

export const dynamic = 'force-static'

const STATIC_PATHS = [
  '/',
  '/contact',
  '/legal/disclaimer',
  '/legal/accuracy',
  '/legal/privacy',
  '/legal/terms',
  '/legal/ftc-disclosure',
  '/legal/dnsmpi',
] as const

export default function sitemap() {
  const now = new Date()
  return STATIC_PATHS.map((path) => ({
    url: path === '/' ? SITE_CONFIG.url : `${SITE_CONFIG.url}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.5,
  }))
}
