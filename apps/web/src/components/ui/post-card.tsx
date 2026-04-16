import Link from 'next/link'
import { formatDate } from '@/lib/format'
import type { PostMock } from '@/lib/content'

export function PostCard({ post }: { post: PostMock }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block border-b border-slate-200 py-6 hover:bg-slate-50 transition px-2">
      <h2 className="text-lg font-semibold text-slate-900">{post.title}</h2>
      <p className="mt-1 text-sm text-slate-700">{post.subtitle}</p>
      <p className="mt-2 text-xs text-slate-700">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </p>
    </Link>
  )
}
