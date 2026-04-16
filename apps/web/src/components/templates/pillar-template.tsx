import type { ReactNode } from 'react'
import type { PillarMock } from '@/lib/content'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { ContentBody } from '@/components/ui/content-body'
import { JsonLd } from '@/components/ui/json-ld'
import { articleJsonLd } from '@/lib/json-ld'
import { formatDate, formatYearMonth } from '@/lib/format'

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

      {/* POST-WAVE-3: replace with <AuthorByline>+<ReviewerByline>+<LastReviewed> from @tn-figueiredo/ymyl-ui */}
      <div className="meta mt-4 text-sm text-slate-600 space-y-1">
        {pillar.author && (
          <p>By{' '}
            {pillar.author.url
              ? <a href={pillar.author.url} className="underline">{pillar.author.name}</a>
              : pillar.author.name}
          </p>
        )}
        {pillar.reviewer && (
          <p>Reviewed by {pillar.reviewer.name}, {pillar.reviewer.credential} —{' '}
            <time dateTime={pillar.reviewer.date}>{formatDate(pillar.reviewer.date)}</time>
          </p>
        )}
        <p>Last reviewed:{' '}
          <time dateTime={reviewDate}>{formatYearMonth(reviewDate)}</time>
        </p>
      </div>

      {/* POST-WAVE-3: replace with <Disclaimer inline /> from @tn-figueiredo/ymyl-ui */}
      <aside role="note" className="my-6 rounded border-l-4 border-amber-400 bg-amber-50 p-4 text-sm">
        <p>
          <strong>Informational only.</strong> Not tax, legal, or financial advice.
          Consult a licensed professional for your situation.{' '}
          <a href="/legal/disclaimer" className="underline">Full disclaimer</a>.
        </p>
      </aside>

      <ContentBody>{content}</ContentBody>

      {/* POST-WAVE-3: replace with <Jurisdiction jurisdiction={pillar.jurisdiction}/> from @tn-figueiredo/ymyl-ui */}
      <p className="text-sm text-slate-500 mt-8">
        Jurisdiction: {pillar.jurisdiction ?? 'US federal / CA federal + provincial'}. State/provincial rules may vary.
      </p>

      {/* POST-WAVE-3: replace with <Citations citations={pillar.citations}/> from @tn-figueiredo/ymyl-ui */}
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
