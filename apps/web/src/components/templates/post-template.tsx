import type { ReactNode } from 'react'
import type { PostMock } from '@/lib/content'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { ContentBody } from '@/components/ui/content-body'
import { ShareButtons } from '@/components/ui/share-buttons'
import { JsonLd } from '@/components/ui/json-ld'
import { articleJsonLd } from '@/lib/json-ld'
import { formatDate, formatYearMonth } from '@/lib/format'
import { SITE_CONFIG } from '@/lib/site-config'

export function PostTemplate({ post, content }: { post: PostMock; content: ReactNode }) {
  const reviewDate = post.reviewedAt ?? post.updatedAt
  const pageUrl = `${SITE_CONFIG.url}/blog/${post.slug}`
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb items={[
        { label: 'Home', url: '/' },
        { label: 'Blog', url: '/blog' },
        { label: post.title },
      ]} />

      <header>
        <h1 className="text-4xl font-bold text-slate-900">{post.title}</h1>
        <p className="mt-3 text-lg text-slate-600">{post.subtitle}</p>
      </header>

      {/* POST-WAVE-3: replace with <AuthorByline>+<ReviewerByline>+<LastReviewed> from @tn-figueiredo/ymyl-ui */}
      <div className="meta mt-4 text-sm text-slate-600 space-y-1">
        {post.author && (
          <p>By{' '}
            {post.author.url
              ? <a href={post.author.url} className="underline">{post.author.name}</a>
              : post.author.name}
          </p>
        )}
        {post.reviewer && (
          <p>Reviewed by {post.reviewer.name}, {post.reviewer.credential} —{' '}
            <time dateTime={post.reviewer.date}>{formatDate(post.reviewer.date)}</time>
          </p>
        )}
        <p>
          Published <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {' '}· Last reviewed <time dateTime={reviewDate}>{formatYearMonth(reviewDate)}</time>
        </p>
      </div>

      {/* POST-WAVE-3: replace with <FTCDisclosure variant="above-fold"/> from @tn-figueiredo/partner-links */}
      {post.hasAffiliateLinks && (
        <aside role="note" className="my-4 rounded bg-slate-100 p-3 text-sm">
          <p>
            <strong>Affiliate disclosure:</strong> This post contains affiliate links.
            We may earn a commission at no extra cost to you.{' '}
            <a href="/legal/ftc-disclosure" className="underline">Learn how we disclose</a>.
          </p>
        </aside>
      )}

      {/* POST-WAVE-3: replace with <Disclaimer inline/> from @tn-figueiredo/ymyl-ui */}
      <aside role="note" className="my-6 rounded border-l-4 border-amber-400 bg-amber-50 p-4 text-sm">
        <p>
          <strong>Informational only.</strong> Not tax, legal, or financial advice.
          Consult a licensed professional for your situation.{' '}
          <a href="/legal/disclaimer" className="underline">Full disclaimer</a>.
        </p>
      </aside>

      <ContentBody>{content}</ContentBody>

      {/* POST-WAVE-3: replace with <Jurisdiction/> from @tn-figueiredo/ymyl-ui */}
      <p className="text-sm text-slate-500 mt-8">
        Jurisdiction: {post.jurisdiction ?? 'US federal / CA federal + provincial'}. State/provincial rules may vary.
      </p>

      {/* POST-WAVE-3: replace with <Citations/> from @tn-figueiredo/ymyl-ui */}
      {post.citations && post.citations.length > 0 && (
        <section aria-labelledby="citations-heading" className="mt-12 border-t pt-6">
          <h2 id="citations-heading" className="text-lg font-semibold">Sources</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {post.citations.map((c, i) => (
              <li key={i}>
                <a href={c.url} className="underline">{c.label}</a>
                {' '}— published <time dateTime={c.publishedAt}>{formatDate(c.publishedAt)}</time>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ShareButtons url={pageUrl} title={post.title} />
      <JsonLd data={articleJsonLd(post, 'post')} />
    </article>
  )
}
