// INTERNAL — these function signatures AND types will be rewritten on CMS integration.
// DO NOT treat as stable. DO NOT export from any barrel.
import type { ReactNode } from 'react'
import { pillarFixture } from '@/__fixtures__/pillar.mock'
import { postFixture } from '@/__fixtures__/post.mock'

export type AuthorMock = { name: string; url?: string }
export type ReviewerMock = { name: string; credential: string; date: string }
export type CitationMock = { label: string; url: string; publishedAt: string }
export type PillarMock = {
  slug: string
  title: string
  subtitle: string
  body: ReactNode
  updatedAt: string
  reviewedAt?: string | null
  author?: AuthorMock | null
  reviewer?: ReviewerMock | null
  heroImage?: string | null
  citations?: CitationMock[] | null
  jurisdiction?: 'US' | 'CA' | 'US-CA' | null
}
export type PostMock = PillarMock & {
  publishedAt: string
  hasAffiliateLinks?: boolean
}

const PILLARS: PillarMock[] = [pillarFixture]
const POSTS: PostMock[] = [postFixture]

export async function getPillarSlugs(): Promise<string[]> {
  return PILLARS.map((p) => p.slug)
}
export async function getPillarBySlug(slug: string): Promise<PillarMock | null> {
  return PILLARS.find((p) => p.slug === slug) ?? null
}
export async function getAllPillars(): Promise<PillarMock[]> {
  return PILLARS
}
export async function getPostSlugs(): Promise<string[]> {
  return POSTS.map((p) => p.slug)
}
export async function getPostBySlug(slug: string): Promise<PostMock | null> {
  return POSTS.find((p) => p.slug === slug) ?? null
}
export async function getAllPosts(): Promise<PostMock[]> {
  return POSTS
}
