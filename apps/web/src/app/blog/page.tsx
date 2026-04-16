import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/content'
import { PostIndex } from '@/components/templates/post-index'
import { SITE_CONFIG } from '@/lib/site-config'

const url = `${SITE_CONFIG.url}/blog`

export const metadata: Metadata = {
  title: `Blog — ${SITE_CONFIG.siteName}`,
  description: 'Deep-dives on taxes, currency, and cross-border finance.',
  alternates: { canonical: url, languages: { 'en-US': url, 'en-CA': url, 'x-default': url } },
  openGraph: { title: 'Blog', description: 'Cross-border finance deep-dives', url, siteName: SITE_CONFIG.siteName, type: 'website' },
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  return <PostIndex posts={posts} />
}
