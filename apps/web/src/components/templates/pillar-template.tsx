import type { ReactNode } from 'react'
import type { PillarMock } from '@/lib/content'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { ContentBody } from '@/components/ui/content-body'
import { JsonLd } from '@/components/ui/json-ld'
import { articleJsonLd } from '@/lib/json-ld'
import { formatDate, formatYearMonth } from '@/lib/format'
import { AuthorByline, ReviewerByline } from '@tn-figueiredo/ymyl-ui/react'

export function PillarTemplate({ pillar, content }: { pillar: PillarMock; content: ReactNode }) {
  const reviewDate = pillar.reviewedAt ?? pillar.updatedAt
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb items={[
        { label: 'Home', url: '/' },
        { label: 'Pillars', url: '/pillars' },
        { label: pillar.title },
      ]} />

      <header>
        <h1 className="text-4xl font-bold text-slate-900">{pillar.title}</h1>
        <p className="mt-3 text-lg text-slate-600">{pillar.subtitle}</p>
      </header>

      <div className="meta mt-4 text-sm text-slate-700 space-y-1">
        {pillar.author && (
          <AuthorByline
            author={{ name: pillar.author.name, bioUrl: pillar.author.url }}
          />
        )}
        {pillar.reviewer && (
          <ReviewerByline
            reviewer={{
              name: pillar.reviewer.name,
              credential: pillar.reviewer.credential,
              reviewedAt: pillar.reviewer.date,
            }}
          />
        )}
        {!pillar.reviewer && (
          // Fallback only when no reviewer — ReviewerByline already emits the
          // date otherwise. Inline by design — no dedicated ymyl-ui@0.1.x
          // `<LastReviewed>` component.
          <p>Last reviewed:{' '}
            <time dateTime={reviewDate}>{formatYearMonth(reviewDate)}</time>
          </p>
        )}
      </div>

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
        Jurisdiction: {pillar.jurisdiction ?? 'US federal / CA federal + provincial'}. State/provincial rules may vary.
      </p>

      {/* Inline by design — no dedicated ymyl-ui@0.1.x <Citations> component. */}
      {pillar.citations && pillar.citations.length > 0 && (
        <section aria-labelledby="citations-heading" className="mt-12 border-t pt-6">
          <h2 id="citations-heading" className="text-lg font-semibold">Sources</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {pillar.citations.map((c, i) => (
              <li key={i}>
                <a href={c.url} className="underline">{c.label}</a>
                {' '}— published <time dateTime={c.publishedAt}>{formatDate(c.publishedAt)}</time>
              </li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd data={articleJsonLd(pillar, 'pillar')} />
    </article>
  )
}
