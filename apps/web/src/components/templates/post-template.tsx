import type { ReactNode } from 'react'
import type { PostMock } from '@/lib/content'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { ContentBody } from '@/components/ui/content-body'
import { ShareButtons } from '@/components/ui/share-buttons'
import { JsonLd } from '@/components/ui/json-ld'
import { articleJsonLd } from '@/lib/json-ld'
import { formatDate, formatYearMonth } from '@/lib/format'
import { SITE_CONFIG } from '@/lib/site-config'
import { AuthorByline, ReviewerByline } from '@tn-figueiredo/ymyl-ui/react'

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

      <div className="meta mt-4 text-sm text-slate-700 space-y-1">
        {post.author && (
          <AuthorByline
            author={{ name: post.author.name, bioUrl: post.author.url }}
          />
        )}
        {post.reviewer && (
          <ReviewerByline
            reviewer={{
              name: post.reviewer.name,
              credential: post.reviewer.credential,
              reviewedAt: post.reviewer.date,
            }}
          />
        )}
        {/* Published date always shown; "Last reviewed" dropped when reviewer
            present (ReviewerByline already renders that info). Inline by design. */}
        <p>
          Published <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {!post.reviewer && (
            <>
              {' '}· Last reviewed <time dateTime={reviewDate}>{formatYearMonth(reviewDate)}</time>
            </>
          )}
        </p>
      </div>

      {/* Inline by design — partner-links <FTCDisclosure> takes a specific Provider for per-CTA proximity disclosure; this is a generic above-fold "this post has affiliate links" aside. */}
      {post.hasAffiliateLinks && (
        <aside role="note" className="my-4 rounded bg-slate-100 p-3 text-sm">
          <p>
            <strong>Affiliate disclosure:</strong> This post contains affiliate links.
            We may earn a commission at no extra cost to you.{' '}
            <a href="/legal/ftc-disclosure" className="underline">Learn how we disclose</a>.
          </p>
        </aside>
      )}

      {/* Inline by design — ymyl-ui@0.1.1 YmylDisclaimer is calc-page-specific ("This calculator..."); semantically wrong for content pages. */}
      <aside role="note" className="my-6 rounded border-l-4 border-amber-400 bg-amber-50 p-4 text-sm">
        <p>
          <strong>Informational only.</strong> Not tax, legal, or financial advice.
          Consult a licensed professional for your situation.{' '}
          <a href="/legal/disclaimer" className="underline">Full disclaimer</a>.
        </p>
      </aside>

      <ContentBody>{content}</ContentBody>

      {/* Inline by design — no dedicated ymyl-ui@0.1.x <Jurisdiction> component. */}
      <p className="text-sm text-slate-500 mt-8">
        Jurisdiction: {post.jurisdiction ?? 'US federal / CA federal + provincial'}. State/provincial rules may vary.
      </p>

      {/* Inline by design — no dedicated ymyl-ui@0.1.x <Citations> component. */}
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
