import Link from 'next/link'
import { formatDate } from '@/lib/format'
import type { PostMock } from '@/lib/content'

export function PostCard({ post }: { post: PostMock }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block border-b border-slate-200 py-6 hover:bg-slate-50 transition px-2">
      <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{post.subtitle}</p>
      <p className="mt-2 text-xs text-slate-500">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </p>
    </Link>
  )
}
