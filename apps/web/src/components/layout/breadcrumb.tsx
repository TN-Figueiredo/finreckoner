import Link from 'next/link'
import { JsonLd } from '@/components/ui/json-ld'
import { breadcrumbJsonLd } from '@/lib/json-ld'

type Item = { label: string; url?: string }

export function Breadcrumb({ items }: { items: Item[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-slate-700 mb-4">
        <ol className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              {item.url ? (
                <Link href={item.url} className="underline hover:text-slate-900">{item.label}</Link>
              ) : (
                <span aria-current="page" className="text-slate-900 font-medium">{item.label}</span>
              )}
              {i < items.length - 1 && <span aria-hidden="true" className="text-slate-500">›</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  )
}
