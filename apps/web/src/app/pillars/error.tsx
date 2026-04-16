'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  // eslint-disable-next-line no-console
  console.error('Pillar route error:', error)
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Couldn&apos;t load this pillar</h1>
      <p className="mt-4 text-slate-600">Something went wrong loading this page.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
      >
        Try again
      </button>
    </main>
  )
}
