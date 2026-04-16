'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  // eslint-disable-next-line no-console
  console.error('GlobalError boundary caught:', error)
  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-4 text-slate-600">We&apos;re sorry — an unexpected error occurred.</p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
