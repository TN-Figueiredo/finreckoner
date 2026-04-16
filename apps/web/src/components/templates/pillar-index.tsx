import type { PillarMock } from '@/lib/content'
import { PillarCard } from '@/components/ui/pillar-card'

export function PillarIndex({ pillars }: { pillars: PillarMock[] }) {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900">Pillars</h1>
        <p className="mt-3 text-lg text-slate-600">Comprehensive guides for cross-border creators and freelancers.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map(p => <PillarCard key={p.slug} pillar={p} />)}
      </div>
    </main>
  )
}
