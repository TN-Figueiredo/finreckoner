import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostSlugs, getPostBySlug } from '@/lib/content'
import { PostTemplate } from '@/components/templates/post-template'
import { SITE_CONFIG } from '@/lib/site-config'
import { toAbsolute } from '@/lib/url'

export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  const url = toAbsolute(`/blog/${post.slug}`)
  const image = toAbsolute(post.heroImage ?? SITE_CONFIG.defaultOgImage)
  return {
    title: `${post.title} — ${SITE_CONFIG.siteName}`,
    description: post.subtitle,
    alternates: { canonical: url, languages: { 'en-US': url, 'en-CA': url, 'x-default': url } },
    openGraph: {
      title: post.title, description: post.subtitle, url,
      siteName: SITE_CONFIG.siteName, type: 'article',
      images: [{ url: image }],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function PostDetailPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()
  return (
    <main id="main-content">
      <PostTemplate post={post} content={<p>Post content body will be sourced from CMS post-Wave-5. This placeholder renders until then.</p>} />
    </main>
  )
}
