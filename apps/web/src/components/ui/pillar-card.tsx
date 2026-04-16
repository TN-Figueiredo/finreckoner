import Link from 'next/link'
import type { PillarMock } from '@/lib/content'

export function PillarCard({ pillar }: { pillar: PillarMock }) {
  return (
    <Link href={`/pillars/${pillar.slug}`} className="block rounded border border-slate-200 bg-white p-6 hover:border-slate-400 hover:shadow transition">
      <h3 className="text-lg font-semibold text-slate-900">{pillar.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{pillar.subtitle}</p>
    </Link>
  )
}
