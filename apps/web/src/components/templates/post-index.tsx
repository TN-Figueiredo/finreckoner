import type { PostMock } from '@/lib/content'
import { PostCard } from '@/components/ui/post-card'

export function PostIndex({ posts }: { posts: PostMock[] }) {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-slate-900">Blog</h1>
        <p className="mt-3 text-lg text-slate-600">Deep-dives on taxes, currency, and cross-border finance.</p>
      </header>
      <div>
        {posts.map(p => <PostCard key={p.slug} post={p} />)}
      </div>
    </main>
  )
}
