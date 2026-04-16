import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/site-config'
import { getAllPillars, getAllPosts } from '@/lib/content'

// `force-static` + async is safe under output:'export' ONLY while
// getAllPillars/getAllPosts return fixture arrays (synchronous-under-the-hood).
// When Wave 5 wires this to @tn-figueiredo/cms, the fetch must be resolvable
// at build time — either keep it sync-from-cache or move to a build script.
export const dynamic = 'force-static'

const STATIC_PATHS = [
  '/',
  '/contact',
  '/pillars',
  '/blog',
  '/legal/disclaimer',
  '/legal/accuracy',
  '/legal/privacy',
  '/legal/terms',
  '/legal/ftc-disclosure',
  '/legal/dnsmpi',
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticEntries = STATIC_PATHS.map(path => ({
    url: path === '/' ? SITE_CONFIG.url : `${SITE_CONFIG.url}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.5,
  }))

  const [pillars, posts] = await Promise.all([getAllPillars(), getAllPosts()])
  const pillarEntries = pillars.map(p => ({
    url: `${SITE_CONFIG.url}/pillars/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  const postEntries = posts.map(p => ({
    url: `${SITE_CONFIG.url}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticEntries, ...pillarEntries, ...postEntries]
}
