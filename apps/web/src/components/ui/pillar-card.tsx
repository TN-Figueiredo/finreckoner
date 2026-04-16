import Link from 'next/link'
import type { PillarMock } from '@/lib/content'

export function PillarCard({ pillar }: { pillar: PillarMock }) {
  return (
    <Link href={`/pillars/${pillar.slug}`} className="block rounded border border-slate-200 bg-white p-6 hover:border-slate-400 hover:shadow transition">
      <h2 className="text-lg font-semibold text-slate-900">{pillar.title}</h2>
      <p className="mt-2 text-sm text-slate-700">{pillar.subtitle}</p>
    </Link>
  )
}
