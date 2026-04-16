import { SITE_CONFIG } from '@/lib/site-config'

export function Footer() {
  return (
    <footer className="border-t mt-16 py-8 text-sm text-slate-700">
      <div className="max-w-4xl mx-auto px-4 flex flex-col gap-2">
        <p>
          <span suppressHydrationWarning>finreckoner.com</span>
          {' · '}
          Live since{' '}
          <time dateTime={SITE_CONFIG.launchedAt}>
            {new Date(SITE_CONFIG.launchedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </time>
        </p>
        <p>Informational only — not tax, legal, or financial advice.</p>
      </div>
    </footer>
  )
}
