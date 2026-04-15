// src/app/sitemap.ts
import { SITE_CONFIG } from '@/lib/site-config'

export default function sitemap() {
  return [
    { url: SITE_CONFIG.url, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 1 },
  ]
}
