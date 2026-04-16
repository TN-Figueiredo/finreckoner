import type { ReactNode } from 'react'

export function ContentBody({ children }: { children: ReactNode }) {
  return <div className="prose prose-slate max-w-none">{children}</div>
}
